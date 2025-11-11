/**
 * Dynatrace Content Service with PERSISTENT STORAGE
 *
 * MULTI-LAYER STORAGE STRATEGY (in priority order):
 * 1. In-memory cache (fastest, lost on page refresh)
 * 2. Dynatrace Documents API (PERSISTENT weeks/months, supports 5MB+ files with chunking)
 * 3. Session backup cache (fallback for Documents API)
 * 4. Grail logs (legacy, has retention issues)
 *
 * Documents API is the PRIMARY persistent storage - it's designed for long-term file storage
 * and won't disappear like logs do. Supports large files via automatic chunking.
 *
 * IMPORTANT: Uses Dynatrace SDK (@dynatrace-sdk/client-query) for all Grail queries
 * since this app runs INSIDE the Dynatrace platform and has direct SDK access.
 * Never use external fetch() calls for Dynatrace APIs - always use the SDK.
 */

import { queryExecutionClient } from '@dynatrace-sdk/client-query';
import { getCurrentUploadId } from './contentVersionService';
import {
  getCurrentUploadIdFromSettings,
  storeContentBackup,
  getContentBackup
} from './appSettingsService';
import {
  storeContentDocument,
  getContentDocument
} from './documentStorageService';

// In-memory cache for uploaded content (survives during session)
const contentCache = new Map<string, { content: string; uploadId: string; timestamp: number }>();
const CACHE_TTL_MS = 3600000; // 1 hour

const LOG_INGEST_PATH = '/platform/classic/environment-api/v2/logs/ingest';

export interface TopicContent {
  topicId: string;
  content: string;
  timestamp?: string;
}

/**
 * Fetches content using multi-layer storage strategy
 * Checks: 1) Cache, 2) Documents API (persistent), 3) Session backup, 4) Logs (legacy)
 */
export async function fetchTopicContent(topicId: string): Promise<string | null> {
  try {
    // LAYER 1: Check in-memory cache first (fastest)
    const cached = contentCache.get(topicId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
      console.log(`[ContentService] ✓ Cache hit for ${topicId} (${cached.content.length} chars)`);
      return cached.content;
    }

    // LAYER 2: Try Documents API (PERSISTENT storage for weeks/months)
    console.log(`[ContentService] Cache miss, checking Documents API for ${topicId}...`);
    const documentContent = await getContentDocument(topicId);
    if (documentContent) {
      console.log(`[ContentService] ✓ Retrieved from Documents API (${documentContent.length} chars)`);
      // Update cache
      contentCache.set(topicId, {
        content: documentContent,
        uploadId: 'document',
        timestamp: Date.now()
      });
      return documentContent;
    }

    // LAYER 3: Try session backup cache (fallback)
    console.log(`[ContentService] No document found, checking session backup for ${topicId}...`);
    const backupContent = await getContentBackup(topicId);
    if (backupContent) {
      console.log(`[ContentService] ✓ Retrieved from session backup (${backupContent.length} chars)`);
      // Update cache
      contentCache.set(topicId, {
        content: backupContent,
        uploadId: 'backup',
        timestamp: Date.now()
      });
      return backupContent;
    }

    // LAYER 4: Try Grail logs (legacy, last resort)
    console.log(`[LogContentService] No backup found, querying Grail logs for ${topicId}...`);

    // Try app-settings version first, fall back to log-based version
    let currentUploadId = await getCurrentUploadIdFromSettings(topicId);
    if (!currentUploadId) {
      currentUploadId = await getCurrentUploadId(topicId);
    }

    // DQL query - if we have uploadId, query by it; otherwise fallback to timestamp
    let query: string;
    if (currentUploadId) {
      query = `fetch logs
        | filter log.source == "dynatrace-deepdive-app" and topicid == "${topicId}" and uploadid == "${currentUploadId}" and isNull(configid)
        | limit 1
        | fields content, timestamp, uploadid`;
      console.log(`[LogContentService] Fetching with uploadId: ${currentUploadId}`);
    } else {
      // Fallback to timestamp sorting if no uploadId is registered
      query = `fetch logs
        | filter log.source == "dynatrace-deepdive-app" and topicid == "${topicId}" and isNull(configid)
        | sort timestamp desc
        | limit 1
        | fields content, timestamp, uploadid`;
      console.log(`[LogContentService] Fetching with timestamp sort (no uploadId)`);
    }

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60,
        maxResultRecords: 1
      }
    });

    console.log(`[LogContentService] Response.result.records length:`, response.result?.records?.length);

    // Extract content from first (and only) record
    if (response.result?.records && response.result.records.length > 0) {
      const record = response.result.records[0];
      if (record && typeof record.content === 'string') {
        console.log(`[LogContentService] ✓ Found in logs (${record.content.length} chars)`);
        // Update cache
        contentCache.set(topicId, {
          content: record.content,
          uploadId: record.uploadid as string || 'unknown',
          timestamp: Date.now()
        });
        return record.content;
      }
    }

    console.log(`[LogContentService] ✗ No content found in any storage layer for ${topicId}`);
    return null;
  } catch (error) {
    console.error(`[LogContentService] Error fetching topic ${topicId}:`, error);
    return null;
  }
}

/**
 * Fetches all topics from logs
 * Returns a map of topicId -> latest content
 */
export async function fetchAllTopics(): Promise<Map<string, string>> {
  try {
    // DQL query to fetch all unique topics with their latest content
    // Note: Field names are lowercased by log ingestion
    const query = `fetch logs
      | filter log.source == "dynatrace-deepdive-app" and isNotNull(topicid)
      | sort timestamp desc
      | summarize latest_content = takeFirst(content), latest_timestamp = takeFirst(timestamp), by: {topicid}`;

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60,
        maxResultRecords: 10000
      }
    });

    const topicsMap = new Map<string, string>();

    if (response.result?.records) {
      for (const record of response.result.records) {
        if (record &&
            typeof record.topicid === 'string' &&
            typeof record.latest_content === 'string') {
          topicsMap.set(record.topicid, record.latest_content);
        }
      }
    }

    return topicsMap;
  } catch (error) {
    console.debug('No log topics found', error);
    return new Map();
  }
}

/**
 * Uploads content using MULTI-LAYER storage strategy
 * Stores in: 1) Cache, 2) Documents API (persistent), 3) Session backup, 4) Logs (legacy)
 * Returns the uploadId on success
 */
export async function uploadTopicContent(
  topicId: string,
  content: string
): Promise<string | null> {
  try {
    // Generate unique uploadId for this content version
    const uploadId = generateUploadId();

    console.log(`[ContentService] Uploading content for ${topicId} with uploadId: ${uploadId}`);
    console.log(`[ContentService] Content size: ${content.length} chars (${new TextEncoder().encode(content).length} bytes)`);

    // LAYER 1: Store in cache immediately (instant access)
    contentCache.set(topicId, {
      content,
      uploadId,
      timestamp: Date.now()
    });
    console.log(`[ContentService] ✓ Cached content for ${topicId}`);

    // LAYER 2: Store in Documents API (PERSISTENT weeks/months, supports 5MB+ files)
    try {
      const documentSuccess = await storeContentDocument(topicId, content);
      if (documentSuccess) {
        console.log(`[ContentService] ✓ Stored in Documents API for ${topicId}`);
      } else {
        console.warn(`[ContentService] Failed to store in Documents API for ${topicId}`);
      }
    } catch (documentError) {
      console.warn(`[ContentService] Documents API storage failed (non-critical):`, documentError);
    }

    // LAYER 3: Store in session backup cache (fallback)
    try {
      const backupSuccess = await storeContentBackup(topicId, content);
      if (backupSuccess) {
        console.log(`[ContentService] ✓ Stored session backup for ${topicId}`);
      }
    } catch (backupError) {
      console.warn(`[ContentService] Session backup failed (non-critical):`, backupError);
    }

    // LAYER 4: Store in Grail logs (legacy, best-effort)
    const logEntry = {
      'log.source': 'dynatrace-deepdive-app',
      'topicId': topicId,
      'uploadId': uploadId,
      'content': content,
      'timestamp': new Date().toISOString(),
      'content.type': 'topic-content',
      'content.version': '1.0'
    };

    // Ingest log using Classic API
    const response = await fetch(LOG_INGEST_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify([logEntry])
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[LogContentService] Log ingestion failed: ${response.status} - ${errorText}`);
      // Don't fail completely - we still have cache and backup
      console.warn(`[LogContentService] Content is available in cache and backup even though log ingestion failed`);
    } else {
      console.log(`[LogContentService] ✓ Content ingested to Grail logs with uploadId: ${uploadId}`);
    }

    return uploadId;
  } catch (error) {
    console.error('[LogContentService] Error uploading topic content:', error);
    // Even if logs fail, content is in cache
    return null;
  }
}

/**
 * Generate a unique upload ID
 */
function generateUploadId(): string {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback: timestamp-based UUID v4-like ID
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  const random2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}-${random2}`;
}

/**
 * Initializes log storage with default content if no content exists
 */
export async function initializeLogContent(defaultTopics: Map<string, string>): Promise<boolean> {
  try {
    // Check if any content exists
    const existing = await fetchAllTopics();

    // If no content exists, initialize with defaults
    if (existing.size === 0 && defaultTopics.size > 0) {
      const logEntries = Array.from(defaultTopics.entries()).map(([topicId, content]) => ({
        'log.source': 'dynatrace-deepdive-app',
        'topicId': topicId,
        'content': content,
        'timestamp': new Date().toISOString(),
        'content.type': 'topic-content',
        'content.version': '1.0'
      }));

      const response = await fetch(LOG_INGEST_PATH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(logEntries)
      });

      return response.ok;
    }

    return true;
  } catch (error) {
    console.error('Error initializing log content:', error);
    return false;
  }
}

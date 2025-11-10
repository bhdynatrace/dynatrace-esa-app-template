/**
 * Dynatrace Log Content Service
 * Manages content stored as log entries in Grail
 * Always fetches the latest record by content ID - no delete needed
 *
 * IMPORTANT: Uses Dynatrace SDK (@dynatrace-sdk/client-query) for all Grail queries
 * since this app runs INSIDE the Dynatrace platform and has direct SDK access.
 * Never use external fetch() calls for Dynatrace APIs - always use the SDK.
 */

import { queryExecutionClient } from '@dynatrace-sdk/client-query';

const LOG_INGEST_PATH = '/platform/classic/environment-api/v2/logs/ingest';

export interface TopicContent {
  topicId: string;
  content: string;
  timestamp?: string;
}

/**
 * Fetches the latest content for a specific topic ID from logs
 */
export async function fetchTopicContent(topicId: string): Promise<string | null> {
  try {
    // DQL query to fetch the latest log entry for this topic
    // Note: Field names are lowercased by log ingestion
    const query = `fetch logs
      | filter log.source == "dynatrace-deepdive-app" and topicid == "${topicId}"
      | sort timestamp desc
      | limit 1
      | fields content, timestamp`;

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60,
        maxResultRecords: 1
      }
    });

    // Extract content from first (and only) record
    if (response.result?.records && response.result.records.length > 0) {
      const record = response.result.records[0];
      if (record && typeof record.content === 'string') {
        return record.content;
      }
    }

    return null;
  } catch (error) {
    // Silently return null on any error (graceful degradation to local content)
    console.debug(`No log content available for topic ${topicId}`, error);
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
 * Uploads or updates content by ingesting a new log entry
 * No delete needed - we always query for the latest record
 */
export async function uploadTopicContent(
  topicId: string,
  content: string
): Promise<boolean> {
  try {
    // Create log entry with content
    const logEntry = {
      'log.source': 'dynatrace-deepdive-app',
      'topicId': topicId,
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
      throw new Error(`Failed to upload topic: ${response.status} - ${errorText}`);
    }

    return true;
  } catch (error) {
    console.error('Error uploading topic content:', error);
    return false;
  }
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

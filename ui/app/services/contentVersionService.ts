/**
 * Content Version Service
 * Manages content version IDs stored in Grail logs
 * Maps topicId -> current uploadId to ensure correct content retrieval
 */

import { queryExecutionClient } from '@dynatrace-sdk/client-query';

const LOG_INGEST_PATH = '/platform/classic/environment-api/v2/logs/ingest';
const VERSION_CONFIG_PREFIX = 'content-version-';

/**
 * Get the current uploadId for a specific topic
 */
export async function getCurrentUploadId(topicId: string): Promise<string | null> {
  try {
    const configId = `${VERSION_CONFIG_PREFIX}${topicId}`;
    const query = `fetch logs
      | filter log.source == "dynatrace-deepdive-app" and configid == "${configId}"
      | sort timestamp desc
      | limit 1
      | fields uploadid, timestamp`;

    const response = await queryExecutionClient.queryExecute({
      body: {
        query,
        requestTimeoutMilliseconds: 10000,
        fetchTimeoutSeconds: 20,
        maxResultRecords: 1
      }
    });

    if (response.result?.records && response.result.records.length > 0) {
      const record = response.result.records[0];
      if (record && typeof record.uploadid === 'string') {
        console.log(`[ContentVersion] Current uploadId for ${topicId}: ${record.uploadid}`);
        return record.uploadid;
      }
    }

    console.log(`[ContentVersion] No version found for topic: ${topicId}`);
    return null;
  } catch (error) {
    console.debug(`[ContentVersion] Error loading version for ${topicId}:`, error);
    return null;
  }
}

/**
 * Set the current uploadId for a topic (after successful content upload)
 */
export async function setCurrentUploadId(topicId: string, uploadId: string): Promise<boolean> {
  try {
    const configId = `${VERSION_CONFIG_PREFIX}${topicId}`;
    const logEntry = {
      'log.source': 'dynatrace-deepdive-app',
      'configId': configId,
      'topicId': topicId,
      'uploadId': uploadId,
      'timestamp': new Date().toISOString(),
      'config.type': 'content-version'
    };

    const response = await fetch(LOG_INGEST_PATH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify([logEntry])
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to set version: ${response.status} - ${errorText}`);
    }

    console.log(`[ContentVersion] Version set for ${topicId}: ${uploadId}`);
    return true;
  } catch (error) {
    console.error(`[ContentVersion] Failed to set version for ${topicId}:`, error);
    return false;
  }
}

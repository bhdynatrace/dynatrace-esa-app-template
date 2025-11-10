/**
 * Dynatrace Lookup Table Service
 * Manages content stored in Grail lookup tables
 */

const LOOKUP_TABLE_PATH = 'github/topics';
const API_BASE = '/platform/storage/resource-store/v1/files/tabular';

export interface TopicRecord {
  topicId: string;
  content: string;
  lastUpdated?: string;
}

/**
 * Creates the DPL parse pattern for JSONL format
 */
function getParsePattern(): string {
  return `USING(JSONL:json)
    PARSE(json, 'JSON:jsonobject')
    FIELDS(
      STRING(json["topicId"]):topicId,
      STRING(json["content"]):content,
      STRING(json["lastUpdated"]):lastUpdated
    )`;
}

/**
 * Fetches all topics from the lookup table
 */
export async function fetchAllTopics(): Promise<Map<string, string>> {
  try {
    // Query the lookup table using DQL
    const query = `fetch dt.grail.lookup("${LOOKUP_TABLE_PATH}")`;

    // Use the Dynatrace API to execute DQL query
    const response = await fetch('/platform/storage/grail/v1/query:execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        requestTimeoutMilliseconds: 30000,
        fetchTimeoutSeconds: 60,
        maxResultRecords: 10000
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch topics: ${response.status}`);
    }

    const data = await response.json();
    const topicsMap = new Map<string, string>();

    // Parse the results
    if (data.result && data.result.records) {
      for (const record of data.result.records) {
        if (record.topicId && record.content) {
          topicsMap.set(record.topicId, record.content);
        }
      }
    }

    return topicsMap;
  } catch (error) {
    console.error('Error fetching topics from lookup table:', error);
    return new Map();
  }
}

/**
 * Fetches a single topic from the lookup table
 */
export async function fetchTopicContent(topicId: string): Promise<string | null> {
  try {
    const allTopics = await fetchAllTopics();
    return allTopics.get(topicId) || null;
  } catch (error) {
    console.error(`Error fetching topic ${topicId}:`, error);
    return null;
  }
}

/**
 * Uploads or updates content in the lookup table
 */
export async function uploadTopicContent(
  topicId: string,
  content: string
): Promise<boolean> {
  try {
    // First, fetch all existing topics
    const allTopics = await fetchAllTopics();

    // Update or add the new topic
    allTopics.set(topicId, content);

    // Convert to JSONL format
    const jsonlContent = Array.from(allTopics.entries())
      .map(([id, cont]) => JSON.stringify({
        topicId: id,
        content: cont,
        lastUpdated: new Date().toISOString()
      }))
      .join('\n');

    // Create FormData for multipart upload
    const formData = new FormData();

    // Add the content as a blob
    const contentBlob = new Blob([jsonlContent], { type: 'application/x-ndjson' });
    formData.append('content', contentBlob, 'topics.jsonl');

    // Add the request parameters
    const requestParams = {
      parsePattern: getParsePattern(),
      lookupField: 'topicId',
      filePath: LOOKUP_TABLE_PATH
    };
    formData.append('request', new Blob([JSON.stringify(requestParams)], { type: 'application/json' }));

    // Upload to Dynatrace
    const response = await fetch(`${API_BASE}/lookup:upload`, {
      method: 'POST',
      body: formData
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
 * Deletes a topic from the lookup table
 */
export async function deleteTopicContent(topicId: string): Promise<boolean> {
  try {
    // Fetch all existing topics
    const allTopics = await fetchAllTopics();

    // Remove the topic
    allTopics.delete(topicId);

    // Convert to JSONL format
    const jsonlContent = Array.from(allTopics.entries())
      .map(([id, cont]) => JSON.stringify({
        topicId: id,
        content: cont,
        lastUpdated: new Date().toISOString()
      }))
      .join('\n');

    // Create FormData for multipart upload
    const formData = new FormData();

    const contentBlob = new Blob([jsonlContent], { type: 'application/x-ndjson' });
    formData.append('content', contentBlob, 'topics.jsonl');

    const requestParams = {
      parsePattern: getParsePattern(),
      lookupField: 'topicId',
      filePath: LOOKUP_TABLE_PATH
    };
    formData.append('request', new Blob([JSON.stringify(requestParams)], { type: 'application/json' }));

    const response = await fetch(`${API_BASE}/lookup:upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Failed to delete topic: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting topic content:', error);
    return false;
  }
}

/**
 * Initializes the lookup table with default content if it doesn't exist
 */
export async function initializeLookupTable(defaultTopics: Map<string, string>): Promise<boolean> {
  try {
    // Check if table exists by trying to fetch
    const existing = await fetchAllTopics();

    // If table is empty, initialize with defaults
    if (existing.size === 0 && defaultTopics.size > 0) {
      const jsonlContent = Array.from(defaultTopics.entries())
        .map(([id, cont]) => JSON.stringify({
          topicId: id,
          content: cont,
          lastUpdated: new Date().toISOString()
        }))
        .join('\n');

      const formData = new FormData();
      const contentBlob = new Blob([jsonlContent], { type: 'application/x-ndjson' });
      formData.append('content', contentBlob, 'topics.jsonl');

      const requestParams = {
        parsePattern: getParsePattern(),
        lookupField: 'topicId',
        filePath: LOOKUP_TABLE_PATH
      };
      formData.append('request', new Blob([JSON.stringify(requestParams)], { type: 'application/json' }));

      const response = await fetch(`${API_BASE}/lookup:upload`, {
        method: 'POST',
        body: formData
      });

      return response.ok;
    }

    return true;
  } catch (error) {
    console.error('Error initializing lookup table:', error);
    return false;
  }
}

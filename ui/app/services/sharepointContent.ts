/**
 * SharePoint Content Service
 * Fetches markdown content from SharePoint
 */

import { SHAREPOINT_CONTENT, USE_SHAREPOINT_CONTENT } from '../config/sharepoint';
import { CONTENT_DATA } from '../data/content';
import { TopicContent } from '../types/content';

// In-memory cache for fetched content
const contentCache: Map<string, string> = new Map();

/**
 * Fetches content from SharePoint URL
 * Uses credentials mode to include authentication cookies
 */
async function fetchSharePointContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include', // Include authentication cookies
      headers: {
        'Accept': 'text/plain, text/markdown, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }

    const content = await response.text();
    return content;
  } catch (error) {
    console.error('SharePoint fetch error:', error);
    throw error;
  }
}

/**
 * Gets content for a topic ID
 * If SharePoint is enabled and configured, fetches from SharePoint
 * Otherwise falls back to local content
 */
export async function getTopicContent(topicId: string): Promise<TopicContent> {
  // If SharePoint is disabled or not configured for this topic, use local content
  if (!USE_SHAREPOINT_CONTENT || !SHAREPOINT_CONTENT[topicId]) {
    const localContent = CONTENT_DATA[topicId];
    if (!localContent) {
      throw new Error(`Content not found for topic: ${topicId}`);
    }
    return localContent;
  }

  const config = SHAREPOINT_CONTENT[topicId];

  // Get metadata from config or fallback to local content
  const getMetadata = () => {
    if (config.metadata) {
      return config.metadata;
    }
    // Fallback to local content metadata if available
    const localContent = CONTENT_DATA[topicId];
    if (localContent?.metadata) {
      return localContent.metadata;
    }
    // Default metadata
    return {
      duration: 5,
      tags: [],
      relatedTopics: []
    };
  };

  const metadata = getMetadata();

  // Check cache first
  if (contentCache.has(topicId)) {
    return {
      id: config.id,
      title: config.title,
      type: config.type,
      content: contentCache.get(topicId)!,
      metadata,
    };
  }

  try {
    // Fetch from SharePoint
    const content = await fetchSharePointContent(config.url);

    // Cache the content
    contentCache.set(topicId, content);

    return {
      id: config.id,
      title: config.title,
      type: config.type,
      content,
      metadata,
    };
  } catch (error) {
    console.error(`Failed to fetch content from SharePoint for ${topicId}, falling back to local content:`, error);

    // Fallback to local content if available
    const localContent = CONTENT_DATA[topicId];
    if (localContent) {
      return localContent;
    }

    throw new Error(`Content not available for topic: ${topicId}`);
  }
}

/**
 * Preloads content for multiple topics
 * Useful for preloading content when the app starts
 */
export async function preloadContent(topicIds: string[]): Promise<void> {
  if (!USE_SHAREPOINT_CONTENT) {
    return; // No need to preload if using local content
  }

  const promises = topicIds.map(async (topicId) => {
    try {
      await getTopicContent(topicId);
    } catch (error) {
      console.warn(`Failed to preload content for ${topicId}:`, error);
    }
  });

  await Promise.all(promises);
}

/**
 * Clears the content cache
 * Useful for forcing a refresh of content
 */
export function clearContentCache(): void {
  contentCache.clear();
}

/**
 * Checks if SharePoint content is enabled
 */
export function isSharePointEnabled(): boolean {
  return USE_SHAREPOINT_CONTENT;
}

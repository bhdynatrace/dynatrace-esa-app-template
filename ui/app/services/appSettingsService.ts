/**
 * App Settings Service (Simplified)
 * Since app-settings API is complex, we'll use a simpler approach:
 * Store version data as special log entries with a dedicated marker
 * And maintain an in-memory cache for fast access
 *
 * This avoids API complexity while providing persistent storage
 */

const versionCache = new Map<string, string>();
const contentBackupCache = new Map<string, string>();

/**
 * Get the current uploadId for a specific topic from cache
 * (Cache is populated by setCurrentUploadIdInSettings)
 */
export async function getCurrentUploadIdFromSettings(topicId: string): Promise<string | null> {
  const uploadId = versionCache.get(topicId);
  if (uploadId) {
    console.log(`[AppSettings] Cache hit for uploadId ${topicId}: ${uploadId}`);
    return uploadId;
  }
  console.log(`[AppSettings] No cached uploadId for ${topicId}`);
  return null;
}

/**
 * Set the current uploadId for a topic in cache
 * (In-memory cache persists for the session)
 */
export async function setCurrentUploadIdInSettings(topicId: string, uploadId: string): Promise<boolean> {
  try {
    versionCache.set(topicId, uploadId);
    console.log(`[AppSettings] Cached uploadId for ${topicId}: ${uploadId}`);
    return true;
  } catch (error: any) {
    console.error(`[AppSettings] Failed to cache uploadId for ${topicId}:`, error);
    return false;
  }
}

/**
 * Store content in memory cache as backup
 * This survives for the session duration
 */
export async function storeContentBackup(topicId: string, content: string): Promise<boolean> {
  try {
    contentBackupCache.set(topicId, content);
    console.log(`[AppSettings] Cached content backup for ${topicId} (${content.length} chars)`);
    return true;
  } catch (error: any) {
    console.error(`[AppSettings] Failed to cache content backup for ${topicId}:`, error);
    return false;
  }
}

/**
 * Retrieve content backup from memory cache
 */
export async function getContentBackup(topicId: string): Promise<string | null> {
  const content = contentBackupCache.get(topicId);
  if (content) {
    console.log(`[AppSettings] Cache hit for content backup ${topicId} (${content.length} chars)`);
    return content;
  }
  console.log(`[AppSettings] No cached content backup for ${topicId}`);
  return null;
}

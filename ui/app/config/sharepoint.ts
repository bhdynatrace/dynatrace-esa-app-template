/**
 * SharePoint Configuration
 * Maps content IDs to SharePoint URLs
 */

export interface SharePointContentConfig {
  id: string;
  url: string;
  title: string;
  type: 'markdown' | 'interactive';
  metadata?: {
    duration: number;
    tags: string[];
    relatedTopics: string[];
  };
}

/**
 * SharePoint content URLs
 * Update these URLs to point to your SharePoint markdown files
 */
export const SHAREPOINT_CONTENT: Record<string, SharePointContentConfig> = {
  'managed-offline': {
    id: 'managed-offline',
    url: 'https://your-sharepoint-site.sharepoint.com/sites/your-site/Shared%20Documents/content/managed-offline.md',
    title: 'Dynatrace Managed Offline',
    type: 'markdown'
  },
  'rag-fundamentals': {
    id: 'rag-fundamentals',
    url: 'https://your-sharepoint-site.sharepoint.com/sites/your-site/Shared%20Documents/content/rag-fundamentals.md',
    title: 'RAG, Chunking & Embeddings',
    type: 'markdown'
  },
  'ai-security': {
    id: 'ai-security',
    url: 'https://your-sharepoint-site.sharepoint.com/sites/your-site/Shared%20Documents/content/ai-security.md',
    title: 'AI Security Concerns',
    type: 'markdown'
  },
  // Add more content mappings here as needed
};

/**
 * Enable/disable SharePoint content fetching
 * Set to false to use local content from content.ts
 */
export const USE_SHAREPOINT_CONTENT = false; // Set to true when SharePoint URLs are configured

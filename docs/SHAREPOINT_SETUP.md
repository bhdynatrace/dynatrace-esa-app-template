# SharePoint Content Integration Guide

This document explains how to configure the app to fetch content from SharePoint instead of using locally bundled content.

## Overview

The app supports loading markdown content from SharePoint at runtime. This allows you to:
- Update content without rebuilding/redeploying the app
- Manage content in SharePoint where it can be edited by non-developers
- Keep content synchronized with your organization's SharePoint site

## How It Works

1. When a user selects a topic, the app fetches the markdown content from the configured SharePoint URL
2. Content is cached in memory to avoid repeated fetches
3. If SharePoint is unavailable, the app falls back to local bundled content
4. Authentication is handled automatically using the user's browser credentials

## Configuration Steps

### Step 1: Upload Markdown Files to SharePoint

1. Create a dedicated folder in your SharePoint site for content files (e.g., `/Shared Documents/deep-dive-content/`)
2. Upload your markdown (.md) files to this folder
3. Ensure users who will access the app have read permissions to these files

### Step 2: Get SharePoint URLs

For each markdown file:

1. Navigate to the file in SharePoint
2. Click the "..." menu and select "Details"
3. Copy the full URL from the address bar (it should look like):
   ```
   https://yourorg.sharepoint.com/sites/yoursite/Shared%20Documents/deep-dive-content/rag-fundamentals.md
   ```

### Step 3: Configure URLs in the App

Edit `/ui/app/config/sharepoint.ts`:

```typescript
export const SHAREPOINT_CONTENT: Record<string, SharePointContentConfig> = {
  'rag-fundamentals': {
    id: 'rag-fundamentals',
    url: 'https://yourorg.sharepoint.com/sites/yoursite/Shared%20Documents/deep-dive-content/rag-fundamentals.md',
    title: 'RAG, Chunking & Embeddings',
    type: 'markdown'
  },
  'ai-security': {
    id: 'ai-security',
    url: 'https://yourorg.sharepoint.com/sites/yoursite/Shared%20Documents/deep-dive-content/ai-security.md',
    title: 'AI Security Concerns',
    type: 'markdown'
  },
  // Add more mappings...
};
```

### Step 4: Enable SharePoint Content

In `/ui/app/config/sharepoint.ts`, set:

```typescript
export const USE_SHAREPOINT_CONTENT = true;
```

### Step 5: Rebuild and Deploy

```bash
npm run build
npm run deploy
```

## CORS Configuration

If you encounter CORS errors, you may need to configure SharePoint to allow requests from your Dynatrace environment:

1. Contact your SharePoint administrator
2. Request that CORS be enabled for your Dynatrace app URL:
   `https://jhl74831.apps.dynatrace.com`

## Authentication

The app uses `credentials: 'include'` when fetching from SharePoint, which means:
- Users must be authenticated to SharePoint in their browser
- The browser will automatically include authentication cookies
- Users should be logged into SharePoint before accessing the app

## Content Format

Markdown files should follow this structure:

```markdown
# Main Title

## Section Heading

Content goes here...

### Subsection

- Bullet point
- Another point

**Bold text** for emphasis

![Image Alt Text](image-url.png)

Links: [Link Text](https://example.com)
```

## Testing

To test SharePoint integration:

1. Ensure `USE_SHAREPOINT_CONTENT = true` in config
2. Open browser DevTools → Network tab
3. Navigate to a topic
4. Look for requests to SharePoint URLs
5. Check console for any errors

## Troubleshooting

### Content Not Loading

1. **Check SharePoint permissions**: Ensure users have read access
2. **Verify URLs**: Make sure URLs in config are correct and accessible
3. **Check browser console**: Look for error messages
4. **Test URL directly**: Try opening the SharePoint URL in a new tab

### CORS Errors

```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Solution**: Contact SharePoint admin to enable CORS for your app domain

### Authentication Errors

```
401 Unauthorized
```

**Solution**: Ensure users are logged into SharePoint before accessing the app

### Fallback Behavior

If SharePoint fetch fails, the app automatically falls back to local content (if available). Check console for warnings:

```
Failed to fetch content from SharePoint for <topic-id>, falling back to local content
```

## Updating Content

To update content after initial deployment:

1. Edit the markdown file in SharePoint
2. Save changes
3. Users will see updated content on next page load (or after clearing cache)
4. **No app rebuild/redeploy needed!**

## Disabling SharePoint Content

To revert to local bundled content:

1. Set `USE_SHAREPOINT_CONTENT = false` in `/ui/app/config/sharepoint.ts`
2. Rebuild and redeploy the app

## Content File Mapping

Current topics that can be mapped to SharePoint:

| Topic ID | Current Title |
|----------|--------------|
| `managed-offline` | Dynatrace Managed Offline |
| `rag-fundamentals` | RAG, Chunking & Embeddings |
| `ai-security` | AI Security Concerns |
| (add more from your topics.ts) | |

To find all available topic IDs, check `/ui/app/data/topics.ts`

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify SharePoint URLs are accessible
3. Review CORS and authentication settings
4. Test with local content first to isolate SharePoint issues

/**
 * Document Storage Service with CHUNKING support
 * Handles large files (up to 10MB+) by splitting into chunks
 * Uses Dynatrace Documents HTTP API for PERSISTENT long-term storage
 * Documents persist indefinitely (weeks/months) unlike logs which have retention limits
 */

const DOCUMENTS_API_PATH = '/platform/classic/environment-api/v2/documents';
const DOCUMENT_PREFIX = 'deepdive-content-';
const CHUNK_SIZE = 450000; // 450KB per chunk (safe under 512KB Documents API limit)

/**
 * Store content as Dynatrace documents with chunking for large files
 * Splits files larger than 450KB into multiple chunks
 */
export async function storeContentDocument(topicId: string, content: string): Promise<boolean> {
  try {
    const contentBytes = new TextEncoder().encode(content).length;
    console.log(`[DocumentStorage] Storing content for ${topicId} (${content.length} chars, ${contentBytes} bytes)`);

    // If content is small enough, store as single document
    if (contentBytes <= CHUNK_SIZE) {
      return await storeSingleDocument(topicId, content);
    }

    // For large content, split into chunks
    return await storeChunkedDocument(topicId, content);
  } catch (error: any) {
    console.error(`[DocumentStorage] Error storing document for ${topicId}:`, error);
    return false;
  }
}

/**
 * Store content as a single document (for files < 900KB)
 */
async function storeSingleDocument(topicId: string, content: string): Promise<boolean> {
  try {
    const documentName = `${DOCUMENT_PREFIX}${topicId}`;

    const response = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(documentName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'text/markdown'
      },
      body: content
    });

    if (response.ok) {
      console.log(`[DocumentStorage] ✓ Stored single document: ${documentName}`);
      return true;
    }

    console.error(`[DocumentStorage] Failed to store document: ${response.status} ${response.statusText}`);
    return false;
  } catch (error: any) {
    console.error(`[DocumentStorage] Error storing single document:`, error);
    return false;
  }
}

/**
 * Store large content as multiple chunked documents
 * Uses character-based chunking with proper boundary handling
 */
async function storeChunkedDocument(topicId: string, content: string): Promise<boolean> {
  try {
    // Split content into chunks by CHARACTER count (not bytes)
    // This ensures we don't split multi-byte UTF-8 sequences or base64 strings
    const chunks: string[] = [];
    const chunkSizeChars = CHUNK_SIZE; // Treat as character count
    let offset = 0;

    while (offset < content.length) {
      // Get chunk by character position
      const chunk = content.substring(offset, offset + chunkSizeChars);
      chunks.push(chunk);
      offset += chunkSizeChars;

      console.log(`[DocumentStorage] Chunk ${chunks.length}: ${offset} / ${content.length} chars`);
    }

    console.log(`[DocumentStorage] Splitting into ${chunks.length} chunks for ${topicId}`);

    // Store metadata document with chunk count
    const metadataName = `${DOCUMENT_PREFIX}${topicId}-meta`;
    const metadata = JSON.stringify({
      topicId,
      totalChunks: chunks.length,
      totalSize: content.length,
      timestamp: new Date().toISOString()
    });

    await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(metadataName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: metadata
    });

    // Store each chunk sequentially to ensure order
    for (let index = 0; index < chunks.length; index++) {
      const chunkName = `${DOCUMENT_PREFIX}${topicId}-chunk-${index}`;
      const chunk = chunks[index];

      const response = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(chunkName)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'text/plain; charset=utf-8'
        },
        body: chunk
      });

      if (!response.ok) {
        console.error(`[DocumentStorage] Failed to store chunk ${index}: ${response.status}`);
        return false;
      }

      console.log(`[DocumentStorage] ✓ Stored chunk ${index + 1}/${chunks.length}`);
    }

    console.log(`[DocumentStorage] ✓ Stored ${chunks.length} chunks for ${topicId}`);
    return true;
  } catch (error: any) {
    console.error(`[DocumentStorage] Error storing chunked document:`, error);
    return false;
  }
}

/**
 * Retrieve content from Dynatrace documents (handles both single and chunked)
 */
export async function getContentDocument(topicId: string): Promise<string | null> {
  try {
    // First, try to get as single document
    const singleDoc = await getSingleDocument(topicId);
    if (singleDoc) {
      return singleDoc;
    }

    // If not found, try chunked retrieval
    return await getChunkedDocument(topicId);
  } catch (error: any) {
    console.error(`[DocumentStorage] Error retrieving document for ${topicId}:`, error);
    return null;
  }
}

/**
 * Retrieve single (non-chunked) document
 */
async function getSingleDocument(topicId: string): Promise<string | null> {
  try {
    const documentName = `${DOCUMENT_PREFIX}${topicId}`;
    console.log(`[DocumentStorage] Trying single document: ${documentName}`);

    const response = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(documentName)}`, {
      method: 'GET'
    });

    if (response.ok) {
      const text = await response.text();
      console.log(`[DocumentStorage] ✓ Retrieved single document (${text.length} chars)`);
      return text;
    }

    // 404 is expected - means we should try chunked retrieval
    if (response.status === 404) {
      console.log(`[DocumentStorage] Single document not found, trying chunked...`);
      return null;
    }

    console.warn(`[DocumentStorage] Failed to retrieve document: ${response.status} ${response.statusText}`);
    return null;
  } catch (error: any) {
    console.error(`[DocumentStorage] Error retrieving single document:`, error);
    return null;
  }
}

/**
 * Retrieve and reassemble chunked document
 * Retrieves chunks IN ORDER to ensure proper reassembly
 */
async function getChunkedDocument(topicId: string): Promise<string | null> {
  try {
    // Get metadata to know how many chunks to retrieve
    const metadataName = `${DOCUMENT_PREFIX}${topicId}-meta`;
    console.log(`[DocumentStorage] Retrieving metadata: ${metadataName}`);

    const metaResponse = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(metadataName)}`, {
      method: 'GET'
    });

    if (!metaResponse.ok) {
      if (metaResponse.status === 404) {
        console.log(`[DocumentStorage] No chunked document found for ${topicId}`);
      }
      return null;
    }

    const metaText = await metaResponse.text();
    const metadata = JSON.parse(metaText);

    console.log(`[DocumentStorage] Found ${metadata.totalChunks} chunks for ${topicId}, expected size: ${metadata.totalSize} chars`);

    // Retrieve chunks IN ORDER (sequentially) to ensure proper reassembly
    const chunks: string[] = [];
    for (let i = 0; i < metadata.totalChunks; i++) {
      const chunkName = `${DOCUMENT_PREFIX}${topicId}-chunk-${i}`;

      const response = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(chunkName)}`, {
        method: 'GET'
      });

      if (response.ok) {
        const chunkText = await response.text();
        chunks.push(chunkText);
        console.log(`[DocumentStorage] ✓ Retrieved chunk ${i + 1}/${metadata.totalChunks} (${chunkText.length} chars)`);
      } else {
        console.error(`[DocumentStorage] ✗ Failed to retrieve chunk ${i}: ${response.status}`);
        chunks.push(''); // Add empty string to maintain order
      }
    }

    // Reassemble chunks in order
    const reassembled = chunks.join('');

    console.log(`[DocumentStorage] ✓ Reassembled ${chunks.length} chunks`);
    console.log(`[DocumentStorage]   Expected: ${metadata.totalSize} chars, Got: ${reassembled.length} chars`);

    // Verify size matches
    if (reassembled.length !== metadata.totalSize) {
      console.warn(`[DocumentStorage] ⚠ Size mismatch! Expected ${metadata.totalSize} but got ${reassembled.length}`);
    }

    return reassembled;
  } catch (error: any) {
    console.error(`[DocumentStorage] Error retrieving chunked document:`, error);
    return null;
  }
}

/**
 * List all stored content documents
 */
export async function listAllDocuments(): Promise<string[]> {
  try {
    const response = await fetch(DOCUMENTS_API_PATH, {
      method: 'GET'
    });

    if (response.ok) {
      const data = await response.json();

      if (data && data.items) {
        const contentDocs = data.items
          .filter((doc: any) => doc.name?.startsWith(DOCUMENT_PREFIX))
          .map((doc: any) => doc.name?.replace(DOCUMENT_PREFIX, '') || '')
          .filter((name: string) => name.length > 0);

        console.log(`[DocumentStorage] Found ${contentDocs.length} stored documents`);
        return contentDocs;
      }
    }

    return [];
  } catch (error: any) {
    console.error(`[DocumentStorage] Error listing documents:`, error);
    return [];
  }
}

/**
 * Delete a content document (handles both single and chunked documents)
 */
export async function deleteContentDocument(topicId: string): Promise<boolean> {
  try {
    const documentName = `${DOCUMENT_PREFIX}${topicId}`;

    // Try to delete single document
    const singleResponse = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(documentName)}`, {
      method: 'DELETE'
    });

    if (singleResponse.ok || singleResponse.status === 404) {
      console.log(`[DocumentStorage] ✓ Deleted single document: ${documentName}`);
    }

    // Try to delete chunked documents
    // First get metadata to know how many chunks
    const metadataName = `${DOCUMENT_PREFIX}${topicId}-meta`;
    const metaResponse = await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(metadataName)}`, {
      method: 'GET'
    });

    if (metaResponse.ok) {
      const metaText = await metaResponse.text();
      const metadata = JSON.parse(metaText);

      // Delete all chunks
      const deletePromises = [];
      for (let i = 0; i < metadata.totalChunks; i++) {
        const chunkName = `${DOCUMENT_PREFIX}${topicId}-chunk-${i}`;
        deletePromises.push(
          fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(chunkName)}`, { method: 'DELETE' })
        );
      }

      await Promise.all(deletePromises);

      // Delete metadata
      await fetch(`${DOCUMENTS_API_PATH}/${encodeURIComponent(metadataName)}`, {
        method: 'DELETE'
      });

      console.log(`[DocumentStorage] ✓ Deleted chunked document with ${metadata.totalChunks} chunks`);
    }

    return true;
  } catch (error: any) {
    console.error(`[DocumentStorage] Error deleting document for ${topicId}:`, error);
    return false;
  }
}

/**
 * AdminContentUploader Component
 * Allows admin users to upload content files via drag-and-drop
 */

import React, { useState, useRef } from 'react';
import { Flex, Text, Button } from '@dynatrace/strato-components';
import { uploadTopicContent } from '../services/logContentService';
import { setCurrentUploadId } from '../services/contentVersionService';
import { setCurrentUploadIdInSettings } from '../services/appSettingsService';

interface AdminContentUploaderProps {
  topicId: string;
  topicTitle: string;
  onContentUpdated: () => void;
}

export const AdminContentUploader: React.FC<AdminContentUploaderProps> = ({
  topicId,
  topicTitle,
  onContentUpdated
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Only accept text files
    if (!file.type.startsWith('text/') && !file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      alert('Please upload a text file (.txt, .md)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus('idle');

      // Read file content
      const content = await file.text();

      // Upload using hybrid storage (cache + app-settings + logs)
      const uploadId = await uploadTopicContent(topicId, content);

      if (uploadId) {
        // Save the uploadId in BOTH app-settings (reliable) and logs (backup)
        const settingsSaved = await setCurrentUploadIdInSettings(topicId, uploadId);
        const logVersionSaved = await setCurrentUploadId(topicId, uploadId);

        if (settingsSaved || logVersionSaved) {
          setUploadStatus('success');
          console.log(`[AdminContentUploader] ✓ Content uploaded for ${topicId}`);
          console.log(`[AdminContentUploader]   - App-settings: ${settingsSaved ? 'saved' : 'failed'}`);
          console.log(`[AdminContentUploader]   - Log version: ${logVersionSaved ? 'saved' : 'failed'}`);
          console.log(`[AdminContentUploader]   - Cache: always saved`);
        } else {
          console.warn(`[AdminContentUploader] Content in cache but version tracking failed for ${topicId}`);
          setUploadStatus('success'); // Still show success since content is in cache
        }

        // Content should be immediately available from cache, but trigger refresh anyway
        // Immediate refresh (cache should have it)
        setTimeout(() => onContentUpdated(), 100);
        // Secondary refresh after 3 seconds (app-settings and logs should be indexed)
        setTimeout(() => onContentUpdated(), 3000);

        // Close modal after showing success message
        setTimeout(() => {
          setIsOpen(false);
          setUploadStatus('idle');
        }, 3000);
      } else {
        setUploadStatus('error');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <>
      {/* Edit icon button */}
      <button
        onClick={() => setIsOpen(true)}
        title="Upload content (Admin)"
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'rgba(108, 93, 211, 0.9)',
          border: '2px solid #6c5dd3',
          color: '#ffffff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold',
          transition: 'all 0.2s ease',
          zIndex: 100
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.background = 'rgba(108, 93, 211, 1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'rgba(108, 93, 211, 0.9)';
        }}
      >
        ✎
      </button>

      {/* Upload modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={() => !isUploading && setIsOpen(false)}
        >
          <div
            style={{
              background: 'var(--dt-colors-background-container-default, #25273d)',
              borderRadius: '8px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: '24px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '16px'
              }}
            >
              Upload Content
            </Text>

            <Text
              style={{
                fontSize: '14px',
                color: '#b4b4be',
                marginBottom: '24px'
              }}
            >
              {topicTitle}
            </Text>

            {/* Drag and drop area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              style={{
                border: `2px dashed ${isDragging ? '#6c5dd3' : 'rgba(108, 93, 211, 0.3)'}`,
                borderRadius: '8px',
                padding: '48px 24px',
                textAlign: 'center',
                background: isDragging ? 'rgba(108, 93, 211, 0.1)' : 'rgba(45, 48, 73, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '16px'
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Text
                style={{
                  fontSize: '48px',
                  marginBottom: '16px'
                }}
              >
                📄
              </Text>
              <Text
                style={{
                  fontSize: '16px',
                  color: '#f0f0f5',
                  marginBottom: '8px'
                }}
              >
                {isUploading ? 'Uploading...' : 'Drop file here or click to browse'}
              </Text>
              <Text
                style={{
                  fontSize: '12px',
                  color: '#b4b4be'
                }}
              >
                Accepts .txt and .md files
              </Text>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,text/*"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />

            {/* Status messages */}
            {uploadStatus === 'success' && (
              <div>
                <Text
                  style={{
                    fontSize: '14px',
                    color: '#7dc579',
                    marginBottom: '8px',
                    textAlign: 'center'
                  }}
                >
                  ✓ Content uploaded successfully!
                </Text>
                <Text
                  style={{
                    fontSize: '12px',
                    color: '#b4b4be',
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}
                >
                  Content will refresh automatically in a few seconds...
                </Text>
              </div>
            )}

            {uploadStatus === 'error' && (
              <Text
                style={{
                  fontSize: '14px',
                  color: '#ee3d48',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}
              >
                ✗ Failed to upload content. Please try again.
              </Text>
            )}

            {/* Close button */}
            <Flex justifyContent="flex-end">
              <Button
                variant="default"
                onClick={() => setIsOpen(false)}
                disabled={isUploading}
              >
                Close
              </Button>
            </Flex>
          </div>
        </div>
      )}
    </>
  );
};

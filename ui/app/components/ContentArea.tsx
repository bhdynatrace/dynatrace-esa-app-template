/**
 * ContentArea Component
 * Displays rich content including markdown, case studies, diagrams, and code
 */

import React, { useState } from 'react';
import { Flex, Text, Button, Container } from '@dynatrace/strato-components';
import { TopicContent } from '../types/content';
import { AdminContentUploader } from './AdminContentUploader';
import { RichMarkdownRenderer } from './RichMarkdownRenderer';
import { MarkdownTheme } from '../styles/markdownThemes';
import { ThinkingStickFigure } from './ThinkingStickFigure';
import { HeartMonitor } from './HeartMonitor';

interface ContentAreaProps {
  content: TopicContent | null;
  isLoading: boolean;
  isBookmarked: boolean;
  onBookmark: () => void;
  onNext: () => void;
  onPrevious: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  userNote: string;
  onNoteChange: (note: string) => void;
  isAdmin?: boolean;
  currentTopicId: string | null;
  onContentRefresh: () => void;
  theme?: MarkdownTheme;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
  content,
  isLoading,
  isBookmarked,
  onBookmark,
  onNext,
  onPrevious,
  hasNext,
  hasPrevious,
  userNote,
  onNoteChange,
  isAdmin = false,
  currentTopicId,
  onContentRefresh,
  theme
}) => {
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(userNote);

  // Check if content starts with a markdown heading
  const contentHasHeading = (contentText: string): boolean => {
    if (!contentText) return false;
    const trimmed = contentText.trim();
    return /^#{1,6}\s/.test(trimmed);
  };

  const shouldShowTopicTitle = content && !contentHasHeading(content.content);

  const handleDownloadMarkdown = () => {
    if (!content || !currentTopicId) return;

    // Create a Blob from the markdown content
    const blob = new Blob([content.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentTopicId}.md`;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          flex: 1,
          padding: '48px',
          color: '#b4b4be'
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(108, 93, 211, 0.2)',
            borderTop: '4px solid var(--dt-colors-accent-primary-default, #6c5dd3)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <Text style={{ marginTop: '16px', fontSize: '14px' }}>Loading content...</Text>
      </Flex>
    );
  }

  if (!content) {
    return (
      <Flex
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        style={{
          flex: 1,
          padding: '48px',
          color: '#7a7a8a',
          position: 'relative'
        }}
      >
        {/* Admin Content Uploader for empty topics */}
        {isAdmin && currentTopicId && (
          <AdminContentUploader
            topicId={currentTopicId}
            topicTitle={currentTopicId}
            onContentUpdated={onContentRefresh}
          />
        )}

        <Text style={{ fontSize: '18px', fontStyle: 'italic', marginBottom: '16px' }}>
          {isAdmin && currentTopicId ? 'No content available for this topic' : 'Select a topic to begin'}
        </Text>

        {isAdmin && currentTopicId && (
          <Text style={{ fontSize: '14px', color: '#b4b4be', textAlign: 'center', maxWidth: '400px' }}>
            Click the edit icon (✎) above to upload content for this section
          </Text>
        )}
      </Flex>
    );
  }

  return (
    <Flex
      flexDirection="column"
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #0a1542 0%, #1a1f4d 25%, #2d1b4e 50%, #3d1654 75%, #4a1a5c 100%)',
        position: 'relative'
      }}
    >
      {/* Breadcrumb */}
      <Flex
        alignItems="center"
        gap={8}
        style={{
          padding: '16px 48px',
          background: 'rgba(10, 21, 66, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <Text
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.6)',
            letterSpacing: '0.5px'
          }}
        >
          {content.metadata.tags.join(' > ')}
        </Text>
      </Flex>

      {/* Content */}
      <div
        style={{
          padding: '32px 48px',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
          position: 'relative'
        }}
      >
        {/* Admin Content Uploader - show even when no content exists */}
        {isAdmin && currentTopicId && (
          <>
            <AdminContentUploader
              topicId={currentTopicId}
              topicTitle={content?.title || currentTopicId}
              onContentUpdated={onContentRefresh}
            />
            {/* Download Markdown Button */}
            {content && (
              <button
                onClick={handleDownloadMarkdown}
                title="Download markdown (Admin)"
                style={{
                  position: 'absolute',
                  top: '56px',
                  right: '16px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(50, 200, 50, 0.9)',
                  border: '2px solid #32c832',
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
                  e.currentTarget.style.background = 'rgba(50, 200, 50, 1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.background = 'rgba(50, 200, 50, 0.9)';
                }}
              >
                ⬇
              </button>
            )}
          </>
        )}

        {/* Thinking Stick Figure - only on AI Mindset topic */}
        {currentTopicId === 'ai-mindset' && <ThinkingStickFigure />}

        {/* Heart Monitor - only on CCO DynaPulse topic */}
        {currentTopicId === 'pulseboard' && <HeartMonitor />}

        {/* Smart Topic Title - only show if content doesn't have a heading */}
        {shouldShowTopicTitle && (
          <h1
            style={{
              fontSize: theme?.styles.h1Size || '32px',
              fontWeight: (theme?.styles.h1Weight || '600') as any,
              color: theme?.styles.h1Color || '#ffffff',
              background: theme?.styles.h1Background || 'transparent',
              padding: theme?.styles.h1Padding || '0',
              borderRadius: theme?.styles.h1BorderRadius || '0',
              marginBottom: theme?.styles.h1MarginBottom || '24px',
              marginTop: 0
            }}
          >
            {content.title}
          </h1>
        )}

        {/* Content Rendering */}
        <RichMarkdownRenderer content={content.content} theme={theme} />
      </div>

      {/* Actions Bar */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        style={{
          padding: '16px 48px',
          background: 'rgba(37, 39, 61, 0.8)',
          borderTop: '1px solid rgba(108, 93, 211, 0.2)',
          marginTop: 'auto'
        }}
      >
        <Flex gap={12}>
          <Button
            variant={isBookmarked ? 'emphasized' : 'default'}
            onClick={onBookmark}
          >
            {isBookmarked ? '🔖 Bookmarked' : '🔖 Bookmark'}
          </Button>
          <Button
            variant="default"
            onClick={() => setShowNoteEditor(!showNoteEditor)}
          >
            📝 {userNote ? 'Edit Note' : 'Add Note'}
          </Button>
        </Flex>

        <Flex gap={12}>
          <Button
            variant="default"
            onClick={onPrevious}
            disabled={!hasPrevious}
          >
            ◀ Previous
          </Button>
          <Button
            variant="default"
            onClick={onNext}
            disabled={!hasNext}
          >
            Next ▶
          </Button>
        </Flex>
      </Flex>

      {/* Note Editor Modal (simplified) */}
      {showNoteEditor && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => setShowNoteEditor(false)}
        >
          <Container
            style={{
              width: '600px',
              maxWidth: '90%',
              background: 'var(--dt-colors-background-container-default, #25273d)',
              borderRadius: '8px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: '16px'
              }}
            >
              📝 Add Note
            </Text>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your notes here..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '12px',
                background: 'rgba(45, 48, 73, 0.8)',
                border: '1px solid rgba(108, 93, 211, 0.3)',
                borderRadius: '4px',
                color: '#f0f0f5',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <Flex gap={12} justifyContent="flex-end" style={{ marginTop: '16px' }}>
              <Button
                variant="default"
                onClick={() => setShowNoteEditor(false)}
              >
                Cancel
              </Button>
              <Button
                variant="emphasized"
                onClick={() => {
                  onNoteChange(noteText);
                  setShowNoteEditor(false);
                }}
              >
                Save
              </Button>
            </Flex>
          </Container>
        </div>
      )}
    </Flex>
  );
};

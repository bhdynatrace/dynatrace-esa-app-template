/**
 * ContentArea Component
 * Displays rich content including markdown, case studies, diagrams, and code
 */

import React, { useState } from 'react';
import { Flex, Text, Button, Container } from '@dynatrace/strato-components';
import { TopicContent } from '../types/content';
import { AdminContentUploader } from './AdminContentUploader';
import { RichMarkdownRenderer } from './RichMarkdownRenderer';

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
}

interface CalloutProps {
  type: 'info' | 'warning' | 'critical' | 'tip';
  children: React.ReactNode;
}

const Callout: React.FC<CalloutProps> = ({ type, children }) => {
  const styles = {
    info: {
      background: 'rgba(0, 161, 224, 0.1)',
      border: '2px solid rgba(0, 161, 224, 0.5)',
      icon: 'ℹ️',
      title: 'INFORMATION'
    },
    warning: {
      background: 'rgba(255, 200, 0, 0.1)',
      border: '2px solid rgba(255, 200, 0, 0.5)',
      icon: '⚠️',
      title: 'WARNING'
    },
    critical: {
      background: 'rgba(238, 61, 72, 0.1)',
      border: '2px solid rgba(238, 61, 72, 0.5)',
      icon: '🚨',
      title: 'CRITICAL'
    },
    tip: {
      background: 'rgba(50, 200, 50, 0.1)',
      border: '2px solid rgba(50, 200, 50, 0.5)',
      icon: '💡',
      title: 'PRO TIP'
    }
  };

  const style = styles[type];

  return (
    <div
      style={{
        padding: '16px 20px',
        borderRadius: '8px',
        margin: '24px 0',
        background: style.background,
        border: style.border,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
      }}
    >
      <Flex alignItems="center" gap={8} style={{ marginBottom: '8px' }}>
        <Text style={{ fontSize: '16px' }}>{style.icon}</Text>
        <Text
          style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#f0f0f5',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          {style.title}
        </Text>
      </Flex>
      <div style={{ color: '#b4b4be', fontSize: '14px', lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
};

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
  onContentRefresh
}) => {
  const [showNoteEditor, setShowNoteEditor] = useState(false);
  const [noteText, setNoteText] = useState(userNote);

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
        overflowY: 'auto'
      }}
    >
      {/* Breadcrumb */}
      <Flex
        alignItems="center"
        gap={8}
        style={{
          padding: '16px 48px',
          background: 'rgba(37, 39, 61, 0.5)',
          borderBottom: '1px solid rgba(108, 93, 211, 0.1)'
        }}
      >
        <Text
          style={{
            fontSize: '12px',
            color: 'rgba(180, 180, 190, 0.7)'
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
          <AdminContentUploader
            topicId={currentTopicId}
            topicTitle={content?.title || currentTopicId}
            onContentUpdated={onContentRefresh}
          />
        )}

        {/* Title with duration */}
        <Flex justifyContent="space-between" alignItems="center" style={{ marginBottom: '24px' }}>
          <Text
            style={{
              fontSize: '32px',
              fontWeight: 600,
              color: '#ffffff',
              lineHeight: 1.2
            }}
          >
            {content.title}
          </Text>
          <Text
            style={{
              fontSize: '12px',
              color: 'rgba(180, 180, 190, 0.7)',
              background: 'rgba(108, 93, 211, 0.15)',
              padding: '6px 12px',
              borderRadius: '12px'
            }}
          >
            ⏱️ Est. {content.metadata.duration} min
          </Text>
        </Flex>

        {/* Content Rendering */}
        <RichMarkdownRenderer content={content.content} />

        {/* Example Callouts (would be parsed from content in production) */}
        <Callout type="info">
          <Text>
            This is an example informational callout. In production, these would be parsed from
            markdown content using a custom renderer.
          </Text>
        </Callout>

        {/* Related Topics */}
        {content.metadata.relatedTopics.length > 0 && (
          <Container
            style={{
              marginTop: '48px',
              padding: '24px',
              background: 'rgba(45, 48, 73, 0.6)',
              borderRadius: '8px',
              border: '1px solid rgba(108, 93, 211, 0.2)'
            }}
          >
            <Text
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#f0f0f5',
                marginBottom: '12px'
              }}
            >
              🔗 Related Topics
            </Text>
            <Flex gap={8} flexWrap="wrap">
              {content.metadata.relatedTopics.map((topic, i) => (
                <div
                  key={i}
                  style={{
                    padding: '8px 16px',
                    background: 'rgba(108, 93, 211, 0.15)',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(108, 93, 211, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(108, 93, 211, 0.15)';
                  }}
                >
                  <Text style={{ fontSize: '13px', color: '#d8b9ff' }}>{topic}</Text>
                </div>
              ))}
            </Flex>
          </Container>
        )}
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

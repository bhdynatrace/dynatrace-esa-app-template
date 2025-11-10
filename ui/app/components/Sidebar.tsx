/**
 * Sidebar Component
 * Topic navigation, search, bookmarks, and progress tracking
 */

import React, { useState, useMemo } from 'react';
import { Flex, Text, Button } from '@dynatrace/strato-components';
import { Topic, ModuleId, BookmarkItem } from '../types/content';
import { MODULES } from '../data/modules';
import { TOPICS_DATA } from '../data/topics';

interface SidebarProps {
  moduleId: ModuleId;
  topics: Topic[];
  activeTopic: string | null;
  onTopicSelect: (topicId: string, targetModuleId?: ModuleId) => void;
  bookmarks: BookmarkItem[];
  onBookmarkClick: (topicId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  completedTopics: Set<string>;
  moduleProgress: number;
  estimatedTimeRemaining: number;
}

interface TopicSearchResult {
  topic: Topic;
  moduleId: ModuleId;
  moduleName: string;
}

interface TopicItemProps {
  topic: Topic;
  isActive: boolean;
  isCompleted: boolean;
  onSelect: (topicId: string) => void;
  activeTopic: string | null;
  level?: number;
}

const TopicItem: React.FC<TopicItemProps> = ({
  topic,
  isActive,
  isCompleted,
  onSelect,
  activeTopic,
  level = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;

  const getIcon = () => {
    if (isCompleted) return '✓';
    if (isActive) return '◉';
    return '○';
  };

  const getIconColor = () => {
    if (isCompleted) return '#32c832';
    if (isActive) return '#6c5dd3';
    return '#7a7a8a';
  };

  const getBackgroundStyle = () => {
    if (isActive) {
      return {
        background: 'rgba(108, 93, 211, 0.2)',
        borderLeft: '3px solid var(--dt-colors-accent-primary-default, #6c5dd3)'
      };
    }
    return {};
  };

  return (
    <div style={{ marginLeft: level * 16 }}>
      <Flex
        alignItems="center"
        justifyContent="space-between"
        onClick={() => {
          if (hasSubtopics) {
            setIsExpanded(!isExpanded);
          }
          onSelect(topic.id);
        }}
        style={{
          padding: '12px 16px',
          marginBottom: '4px',
          borderRadius: '4px',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          ...getBackgroundStyle()
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'rgba(108, 93, 211, 0.1)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent';
          }
        }}
      >
        <Flex alignItems="center" gap={12} style={{ flex: 1 }}>
          <Text style={{ fontSize: '16px', color: getIconColor(), lineHeight: 1 }}>
            {hasSubtopics ? (isExpanded ? '▼' : '▶') : getIcon()}
          </Text>
          <Text
            style={{
              fontSize: '14px',
              color: isActive ? '#ffffff' : '#b4b4be',
              fontWeight: isActive ? 500 : 400,
              flex: 1
            }}
          >
            {topic.title}
          </Text>
        </Flex>
        <Text
          style={{
            fontSize: '11px',
            color: 'rgba(180, 180, 190, 0.6)',
            fontWeight: 500
          }}
        >
          {topic.duration}m
        </Text>
      </Flex>

      {hasSubtopics && isExpanded && (
        <div>
          {topic.subtopics!.map(subtopic => (
            <TopicItem
              key={subtopic.id}
              topic={subtopic}
              isActive={isActive && activeTopic === subtopic.id}
              isCompleted={isCompleted}
              onSelect={onSelect}
              activeTopic={activeTopic}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  moduleId,
  topics,
  activeTopic,
  onTopicSelect,
  bookmarks,
  onBookmarkClick,
  searchQuery,
  onSearchChange,
  completedTopics,
  moduleProgress,
  estimatedTimeRemaining
}) => {
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Global search across all modules
  const globalSearchResults = useMemo((): TopicSearchResult[] => {
    if (searchQuery === '') return [];

    const results: TopicSearchResult[] = [];
    const query = searchQuery.toLowerCase();

    MODULES.forEach(module => {
      const moduleTopics = TOPICS_DATA[module.id] || [];
      moduleTopics.forEach(topic => {
        const matchesTitle = topic.title.toLowerCase().includes(query);
        const matchesTags = topic.tags.some(tag => tag.toLowerCase().includes(query));

        if (matchesTitle || matchesTags) {
          results.push({
            topic,
            moduleId: module.id,
            moduleName: module.title
          });
        }
      });
    });

    return results;
  }, [searchQuery]);

  // Local filtering for current module topics
  const filteredTopics = topics.filter(topic =>
    searchQuery === '' ||
    topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const moduleBookmarks = bookmarks.filter(b => b.moduleId === moduleId);
  const totalTopics = topics.length;
  const completedCount = topics.filter(t => completedTopics.has(t.id)).length;

  // Determine if we should show global search results
  const showGlobalSearch = searchQuery !== '' && globalSearchResults.length > 0;

  return (
    <Flex
      flexDirection="column"
      gap={16}
      style={{
        width: '320px',
        height: '100%',
        background: 'rgba(37, 39, 61, 0.95)',
        borderRight: '1px solid rgba(108, 93, 211, 0.2)',
        padding: '24px 16px',
        overflowY: 'auto'
      }}
    >
      {/* Search Box */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search all topics across modules..."
        style={{
          width: '100%',
          height: '40px',
          background: 'rgba(45, 48, 73, 0.8)',
          border: '1px solid rgba(108, 93, 211, 0.3)',
          borderRadius: '4px',
          color: '#f0f0f5',
          padding: '0 16px',
          fontSize: '14px'
        }}
      />

      {/* Topics Section */}
      {!showBookmarks && (
        <>
          <Flex justifyContent="space-between" alignItems="center">
            <Text
              style={{
                fontSize: '12px',
                color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}
            >
              {showGlobalSearch ? `Search Results (${globalSearchResults.length})` : 'Topics'}
            </Text>
            {!showGlobalSearch && (
              <Text
                style={{
                  fontSize: '11px',
                  color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)'
                }}
              >
                {completedCount}/{totalTopics}
              </Text>
            )}
          </Flex>

          {/* Global Search Results */}
          {showGlobalSearch && (
            <Flex flexDirection="column" gap={4}>
              {globalSearchResults.map((result) => (
                <div
                  key={`${result.moduleId}-${result.topic.id}`}
                  onClick={() => onTopicSelect(result.topic.id, result.moduleId)}
                  style={{
                    padding: '12px 16px',
                    marginBottom: '4px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: activeTopic === result.topic.id ? 'rgba(108, 93, 211, 0.2)' : 'transparent',
                    borderLeft: activeTopic === result.topic.id ? '3px solid var(--dt-colors-accent-primary-default, #6c5dd3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTopic !== result.topic.id) {
                      e.currentTarget.style.background = 'rgba(108, 93, 211, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTopic !== result.topic.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <Flex flexDirection="column" gap={4}>
                    <Flex alignItems="center" gap={12}>
                      <Text style={{ fontSize: '16px', color: completedTopics.has(result.topic.id) ? '#32c832' : '#7a7a8a', lineHeight: 1 }}>
                        {completedTopics.has(result.topic.id) ? '✓' : '○'}
                      </Text>
                      <Text
                        style={{
                          fontSize: '14px',
                          color: activeTopic === result.topic.id ? '#ffffff' : '#b4b4be',
                          fontWeight: activeTopic === result.topic.id ? 500 : 400,
                          flex: 1
                        }}
                      >
                        {result.topic.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: '11px',
                          color: 'rgba(180, 180, 190, 0.6)',
                          fontWeight: 500
                        }}
                      >
                        {result.topic.duration}m
                      </Text>
                    </Flex>
                    <Text
                      style={{
                        fontSize: '11px',
                        color: '#6c5dd3',
                        fontWeight: 600,
                        marginLeft: '28px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      📁 {result.moduleName}
                    </Text>
                  </Flex>
                </div>
              ))}
            </Flex>
          )}

          {/* Current Module Topics */}
          {!showGlobalSearch && (
            <Flex flexDirection="column" gap={4}>
              {filteredTopics.map(topic => (
                <TopicItem
                  key={topic.id}
                  topic={topic}
                  isActive={activeTopic === topic.id}
                  isCompleted={completedTopics.has(topic.id)}
                  onSelect={(topicId) => onTopicSelect(topicId)}
                  activeTopic={activeTopic}
                />
              ))}
            </Flex>
          )}
        </>
      )}

      {/* Bookmarks Section */}
      {showBookmarks && (
        <>
          <Flex justifyContent="space-between" alignItems="center">
            <Text
              style={{
                fontSize: '12px',
                color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontWeight: 600
              }}
            >
              Bookmarks ({moduleBookmarks.length})
            </Text>
          </Flex>

          <Flex flexDirection="column" gap={8}>
            {moduleBookmarks.length === 0 ? (
              <Text
                style={{
                  fontSize: '14px',
                  color: 'rgba(180, 180, 190, 0.6)',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  padding: '24px 0'
                }}
              >
                No bookmarks yet
              </Text>
            ) : (
              moduleBookmarks.map(bookmark => (
                <Flex
                  key={bookmark.topicId}
                  flexDirection="column"
                  gap={4}
                  onClick={() => onBookmarkClick(bookmark.topicId)}
                  style={{
                    padding: '12px',
                    background: 'rgba(45, 48, 73, 0.6)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(108, 93, 211, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(45, 48, 73, 0.6)';
                  }}
                >
                  <Flex alignItems="center" gap={8}>
                    <Text style={{ fontSize: '14px' }}>🔖</Text>
                    <Text
                      style={{
                        fontSize: '14px',
                        color: '#f0f0f5',
                        fontWeight: 500,
                        flex: 1
                      }}
                    >
                      {bookmark.title}
                    </Text>
                  </Flex>
                  {bookmark.note && (
                    <Text
                      style={{
                        fontSize: '12px',
                        color: 'rgba(180, 180, 190, 0.7)',
                        fontStyle: 'italic',
                        marginLeft: '22px'
                      }}
                    >
                      {bookmark.note}
                    </Text>
                  )}
                </Flex>
              ))
            )}
          </Flex>
        </>
      )}

      {/* Toggle Button */}
      <Button
        variant="default"
        onClick={() => setShowBookmarks(!showBookmarks)}
        style={{
          width: '100%',
          borderRadius: '4px'
        }}
      >
        {showBookmarks ? '← Back to Topics' : '📖 View Bookmarks'}
      </Button>

      {/* Progress Widget */}
      <Flex
        flexDirection="column"
        gap={12}
        style={{
          padding: '16px',
          background: 'rgba(45, 48, 73, 0.8)',
          borderRadius: '8px',
          border: '1px solid rgba(108, 93, 211, 0.2)',
          marginTop: 'auto'
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text
            style={{
              fontSize: '12px',
              color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600
            }}
          >
            Progress
          </Text>
          <Text
            style={{
              fontSize: '14px',
              color: '#f0f0f5',
              fontWeight: 600
            }}
          >
            {Math.round(moduleProgress)}%
          </Text>
        </Flex>

        {/* Progress Bar */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: 'rgba(108, 93, 211, 0.2)',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${moduleProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--dt-colors-accent-primary-default, #6c5dd3), #32c832)',
              transition: 'width 0.5s ease-in-out'
            }}
          />
        </div>

        <Flex flexDirection="column" gap={4}>
          <Text
            style={{
              fontSize: '12px',
              color: 'rgba(180, 180, 190, 0.8)'
            }}
          >
            {completedCount} of {totalTopics} topics completed
          </Text>
          {estimatedTimeRemaining > 0 && (
            <Text
              style={{
                fontSize: '12px',
                color: 'rgba(180, 180, 190, 0.8)'
              }}
            >
              Est. {estimatedTimeRemaining} min remaining
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

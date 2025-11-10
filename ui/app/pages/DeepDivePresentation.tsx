/**
 * DeepDivePresentation Page
 * Main page component that orchestrates the entire presentation
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Flex, Heading, Text } from '@dynatrace/strato-components';
import { ChevronNavigation } from '../components/ChevronNavigation';
import { Sidebar } from '../components/Sidebar';
import { ContentArea } from '../components/ContentArea';
import { MODULES } from '../data/modules';
import { TOPICS_DATA } from '../data/topics';
import { CONTENT_DATA } from '../data/content';
import { PLACEHOLDER_CONTENT } from '../data/placeholderContent';
import { fetchTopicContent } from '../services/logContentService';
import { MARKDOWN_THEMES, ThemeId } from '../styles/markdownThemes';
import { ThemeSelector } from '../components/ThemeSelector';
import { getGlobalTheme, setGlobalTheme } from '../services/themeSettingsService';
import {
  ModuleId,
  UserProgress,
  TopicContent,
  BookmarkItem
} from '../types/content';

const STORAGE_KEY = 'deepdive-user-progress';

interface DeepDivePresentationProps {
  isAdmin?: boolean;
}

const DeepDivePresentation: React.FC<DeepDivePresentationProps> = ({ isAdmin = false }) => {
  // State management
  const [currentModule, setCurrentModule] = useState<ModuleId>('architectures');
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('classic');

  // Load global theme from app-settings (applies to all users)
  useEffect(() => {
    const loadGlobalTheme = async () => {
      const globalTheme = await getGlobalTheme();
      setCurrentTheme(globalTheme);
    };
    loadGlobalTheme();
  }, []);

  // Save global theme to app-settings (admin only)
  const handleThemeChange = async (themeId: ThemeId) => {
    setCurrentTheme(themeId);
    if (isAdmin) {
      const success = await setGlobalTheme(themeId, 'admin');
      if (success) {
        console.log(`[DeepDivePresentation] Global theme updated to: ${themeId}`);
      } else {
        console.error('[DeepDivePresentation] Failed to save global theme');
      }
    }
  };

  // Load user progress from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const progress: UserProgress = JSON.parse(stored);
        setCurrentModule(progress.currentModule);
        setCurrentTopic(progress.currentTopic);
        setCompletedTopics(new Set(Array.from(progress.completedTopics || [])));
        setNotes(progress.notes || {});
        // Bookmarks stored separately
        const bookmarksStored = localStorage.getItem(`${STORAGE_KEY}-bookmarks`);
        if (bookmarksStored) {
          setBookmarks(JSON.parse(bookmarksStored));
        }
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
  }, []);

  // Save user progress to localStorage
  useEffect(() => {
    const progress: Partial<UserProgress> = {
      currentModule,
      currentTopic,
      completedTopics,
      notes,
      lastAccessed: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...progress,
      completedTopics: Array.from(completedTopics)
    }));
    localStorage.setItem(`${STORAGE_KEY}-bookmarks`, JSON.stringify(bookmarks));
  }, [currentModule, currentTopic, completedTopics, notes, bookmarks]);

  // Get current module's topics
  const currentTopics = useMemo(() => {
    return TOPICS_DATA[currentModule] || [];
  }, [currentModule]);

  // Get current topic content (async from logs, SharePoint, or local)
  const [currentContent, setCurrentContent] = useState<TopicContent | null>(null);
  const [contentRefreshKey, setContentRefreshKey] = useState(0);

  useEffect(() => {
    if (!currentTopic) {
      setCurrentContent(null);
      return;
    }

    const loadContent = async () => {
      setIsLoading(true);
      try {
        // Try log content first (for admin-uploaded content)
        const logContent = await fetchTopicContent(currentTopic);

        if (logContent) {
          // If we have log content, use ONLY that (with metadata from local content)
          const baseContent = CONTENT_DATA[currentTopic];
          if (baseContent) {
            setCurrentContent({
              ...baseContent,
              content: logContent
            });
          } else {
            // If no local content exists, create basic structure
            setCurrentContent({
              id: currentTopic,
              title: currentTopic,
              type: 'markdown',
              content: logContent,
              metadata: {
                duration: 5,
                tags: [],
                relatedTopics: []
              }
            });
          }
        } else {
          // No log content found, use local content from project
          const localContent = CONTENT_DATA[currentTopic];
          if (localContent) {
            setCurrentContent(localContent);
          } else {
            // Final fallback: use placeholder content
            const placeholderMarkdown = PLACEHOLDER_CONTENT[currentTopic];
            if (placeholderMarkdown) {
              // Get topic metadata from TOPICS_DATA to build proper TopicContent
              const topicMeta = Object.values(TOPICS_DATA)
                .flat()
                .find(t => t.id === currentTopic);

              setCurrentContent({
                id: currentTopic,
                title: topicMeta?.title || currentTopic,
                type: 'markdown',
                content: placeholderMarkdown,
                metadata: {
                  duration: topicMeta?.duration || 5,
                  tags: topicMeta?.tags || [],
                  relatedTopics: topicMeta?.relatedTopics || []
                }
              });
            } else {
              setCurrentContent(null);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load content:', error);
        // Fallback to local content on error
        const fallbackContent = CONTENT_DATA[currentTopic];
        if (fallbackContent) {
          setCurrentContent(fallbackContent);
        } else {
          // Final fallback: use placeholder content
          const placeholderMarkdown = PLACEHOLDER_CONTENT[currentTopic];
          if (placeholderMarkdown) {
            const topicMeta = Object.values(TOPICS_DATA)
              .flat()
              .find(t => t.id === currentTopic);

            setCurrentContent({
              id: currentTopic,
              title: topicMeta?.title || currentTopic,
              type: 'markdown',
              content: placeholderMarkdown,
              metadata: {
                duration: topicMeta?.duration || 5,
                tags: topicMeta?.tags || [],
                relatedTopics: topicMeta?.relatedTopics || []
              }
            });
          } else {
            setCurrentContent(null);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [currentTopic, contentRefreshKey]);

  // Callback for admin to refresh content after upload
  const handleContentRefresh = () => {
    setContentRefreshKey(prev => prev + 1);
  };

  // Calculate module progress
  const moduleProgress = useMemo(() => {
    const progress: Record<ModuleId, number> = {} as Record<ModuleId, number>;

    MODULES.forEach(module => {
      const moduleTopics = TOPICS_DATA[module.id] || [];
      const totalTopics = moduleTopics.length;
      if (totalTopics === 0) {
        progress[module.id] = 0;
        return;
      }

      const completedCount = moduleTopics.filter(t => completedTopics.has(t.id)).length;
      progress[module.id] = Math.round((completedCount / totalTopics) * 100);
    });

    return progress;
  }, [completedTopics]);

  // Calculate estimated time remaining
  const estimatedTimeRemaining = useMemo(() => {
    const remainingTopics = currentTopics.filter(t => !completedTopics.has(t.id));
    return remainingTopics.reduce((sum, topic) => sum + topic.duration, 0);
  }, [currentTopics, completedTopics]);

  // Handlers
  const handleModuleChange = (moduleId: ModuleId) => {
    setCurrentModule(moduleId);
    const moduleTopics = TOPICS_DATA[moduleId] || [];
    if (moduleTopics.length > 0) {
      setCurrentTopic(moduleTopics[0].id);
    } else {
      setCurrentTopic(null);
    }
    setSearchQuery('');
  };

  const handleTopicSelect = (topicId: string, targetModuleId?: ModuleId) => {
    setIsLoading(true);

    // If a different module is specified, switch to it first
    if (targetModuleId && targetModuleId !== currentModule) {
      setCurrentModule(targetModuleId);
    }

    setCurrentTopic(topicId);
    setSearchQuery(''); // Clear search when selecting a topic

    // Mark as completed after viewing
    setTimeout(() => {
      setCompletedTopics(prev => new Set([...Array.from(prev), topicId]));
      setIsLoading(false);
    }, 500);
  };

  const handleBookmark = () => {
    if (!currentTopic || !currentContent) return;

    const existingIndex = bookmarks.findIndex(b => b.topicId === currentTopic);

    if (existingIndex >= 0) {
      // Remove bookmark
      setBookmarks(bookmarks.filter((_, i) => i !== existingIndex));
    } else {
      // Add bookmark
      const newBookmark: BookmarkItem = {
        topicId: currentTopic,
        moduleId: currentModule,
        title: currentContent.title,
        addedAt: new Date().toISOString(),
        note: notes[currentTopic]
      };
      setBookmarks([...bookmarks, newBookmark]);
    }
  };

  const handleBookmarkClick = (topicId: string) => {
    const bookmark = bookmarks.find(b => b.topicId === topicId);
    if (bookmark) {
      setCurrentModule(bookmark.moduleId);
      setCurrentTopic(topicId);
    }
  };

  const handleNoteChange = (note: string) => {
    if (!currentTopic) return;

    setNotes(prev => ({
      ...prev,
      [currentTopic]: note
    }));

    // Update bookmark note if bookmarked
    const bookmarkIndex = bookmarks.findIndex(b => b.topicId === currentTopic);
    if (bookmarkIndex >= 0) {
      const updated = [...bookmarks];
      updated[bookmarkIndex].note = note;
      setBookmarks(updated);
    }
  };

  const handleNext = () => {
    if (!currentTopic) return;

    const currentIndex = currentTopics.findIndex(t => t.id === currentTopic);
    if (currentIndex >= 0 && currentIndex < currentTopics.length - 1) {
      handleTopicSelect(currentTopics[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (!currentTopic) return;

    const currentIndex = currentTopics.findIndex(t => t.id === currentTopic);
    if (currentIndex > 0) {
      handleTopicSelect(currentTopics[currentIndex - 1].id);
    }
  };

  const hasNext = useMemo(() => {
    if (!currentTopic) return false;
    const currentIndex = currentTopics.findIndex(t => t.id === currentTopic);
    return currentIndex >= 0 && currentIndex < currentTopics.length - 1;
  }, [currentTopic, currentTopics]);

  const hasPrevious = useMemo(() => {
    if (!currentTopic) return false;
    const currentIndex = currentTopics.findIndex(t => t.id === currentTopic);
    return currentIndex > 0;
  }, [currentTopic, currentTopics]);

  const isBookmarked = useMemo(() => {
    return currentTopic ? bookmarks.some(b => b.topicId === currentTopic) : false;
  }, [currentTopic, bookmarks]);

  return (
    <Flex
      flexDirection="column"
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--dt-colors-background-base-default, #1b1c2e)',
        color: 'var(--dt-colors-text-neutral-default, #f0f0f5)'
      }}
    >
      {/* Header */}
      <Flex
        justifyContent="space-between"
        alignItems="center"
        style={{
          padding: '16px 24px',
          background: 'var(--dt-colors-background-container-default, #25273d)',
          borderBottom: '2px solid rgba(108, 93, 211, 0.3)'
        }}
      >
        <Flex flexDirection="column">
          <Heading level={1} style={{ margin: 0, whiteSpace: 'nowrap' }}>
            D1 Leadership AI Deep Dive
          </Heading>
          <Text
            style={{
              fontSize: '12px',
              color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
              fontStyle: 'italic',
              marginTop: '4px'
            }}
          >
            Interactive Presentation Platform
          </Text>
        </Flex>
        <Flex
          flexDirection="column"
          alignItems="flex-end"
          gap={8}
        >
          {/* Theme Selector - Admin Only */}
          {isAdmin && (
            <ThemeSelector
              currentTheme={currentTheme}
              onThemeChange={handleThemeChange}
            />
          )}
          <Text
            style={{
              fontSize: '12px',
              color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
              fontStyle: 'italic'
            }}
          >
            App by Dynatrace One - ESA OSS
          </Text>
          <Text
            style={{
              fontSize: '11px',
              color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
              fontStyle: 'italic'
            }}
          >
            by Brett Hofer
          </Text>
        </Flex>
      </Flex>

      {/* Chevron Navigation */}
      <ChevronNavigation
        modules={MODULES}
        currentModule={currentModule}
        onModuleChange={handleModuleChange}
        progress={moduleProgress}
        completedTopics={completedTopics}
      />

      {/* Main Content Area */}
      <Flex style={{ flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          moduleId={currentModule}
          topics={currentTopics}
          activeTopic={currentTopic}
          onTopicSelect={handleTopicSelect}
          bookmarks={bookmarks}
          onBookmarkClick={handleBookmarkClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          completedTopics={completedTopics}
          moduleProgress={moduleProgress[currentModule] || 0}
          estimatedTimeRemaining={estimatedTimeRemaining}
        />

        {/* Content Display */}
        <ContentArea
          content={currentContent}
          isLoading={isLoading}
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
          onNext={handleNext}
          onPrevious={handlePrevious}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          userNote={currentTopic ? notes[currentTopic] || '' : ''}
          onNoteChange={handleNoteChange}
          isAdmin={isAdmin}
          currentTopicId={currentTopic}
          onContentRefresh={handleContentRefresh}
          theme={MARKDOWN_THEMES[currentTheme]}
        />
      </Flex>
    </Flex>
  );
};

export default DeepDivePresentation;

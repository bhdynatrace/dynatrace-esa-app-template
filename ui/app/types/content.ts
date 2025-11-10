/**
 * Content Type Definitions
 * Deep Dive Presents (D1-ESA)
 */

export type ModuleId =
  | 'architectures'
  | 'challenges'
  | 'ai-crash-course'
  | 'app-demo'
  | 'splunk-migration'
  | 'dynabridge-vision'
  | 'blueprint'
  | 'qa';

export interface Module {
  id: ModuleId;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  icon?: string;
  color?: string;
}

export interface Topic {
  id: string;
  title: string;
  contentFile: string;
  duration: number; // minutes
  order: number;
  tags: string[];
  relatedTopics: string[];
  subtopics?: Topic[];
  completed?: boolean;
  icon?: string;
}

export interface TopicContent {
  id: string;
  title: string;
  type: 'markdown' | 'case-study' | 'diagram' | 'interactive';
  content: string;
  metadata: {
    duration: number;
    tags: string[];
    relatedTopics: string[];
  };
}

export interface ModuleMetadata {
  module: ModuleId;
  topics: Topic[];
}

export interface UserProgress {
  userId: string;
  lastAccessed: string; // ISO timestamp
  currentModule: ModuleId;
  currentTopic: string | null;
  completedTopics: Set<string>;
  bookmarks: Set<string>;
  notes: Record<string, string>; // topicId -> note
  sessionTime: number; // total minutes
  moduleProgress: Record<ModuleId, number>; // 0-100
}

export interface NavigationState {
  currentModule: ModuleId;
  currentTopic: string | null;
  breadcrumb: BreadcrumbItem[];
  history: string[];
  historyIndex: number;
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface SessionState {
  sessionId?: string;
  isPresenterMode: boolean;
  participants?: string[];
  syncEnabled: boolean;
}

export interface SearchResult {
  topicId: string;
  moduleId: ModuleId;
  title: string;
  excerpt: string;
  relevance: number;
}

export interface BookmarkItem {
  topicId: string;
  moduleId: ModuleId;
  title: string;
  addedAt: string; // ISO timestamp
  note?: string;
}

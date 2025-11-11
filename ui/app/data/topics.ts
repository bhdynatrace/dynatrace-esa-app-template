/**
 * Topics Data
 * Topic definitions for each module
 */

import { Topic, ModuleId } from '../types/content';

export const TOPICS_DATA: Record<ModuleId, Topic[]> = {
  architectures: [
    {
      id: 'managed-offline',
      title: 'Dynatrace Managed Offline',
      contentFile: 'managed-offline.md',
      duration: 5,
      order: 1,
      tags: ['architecture', 'managed', 'offline'],
      relatedTopics: ['managed-pha', 'saas-classic']
    },
    {
      id: 'managed-pha',
      title: 'Dynatrace Managed + PHA',
      contentFile: 'managed-pha.md',
      duration: 5,
      order: 2,
      tags: ['architecture', 'managed', 'pha'],
      relatedTopics: ['managed-offline', 'saas-gen3']
    },
    {
      id: 'saas-classic',
      title: 'Dynatrace SaaS Classic',
      contentFile: 'saas-classic.md',
      duration: 5,
      order: 3,
      tags: ['architecture', 'saas', 'classic'],
      relatedTopics: ['saas-gen3', 'managed-offline']
    },
    {
      id: 'saas-gen3',
      title: 'Dynatrace SaaS Gen3',
      contentFile: 'saas-gen3.md',
      duration: 5,
      order: 4,
      tags: ['architecture', 'saas', 'gen3'],
      relatedTopics: ['saas-classic', 'managed-pha']
    },
    {
      id: 'crisis-that-defines-us',
      title: 'The Crisis That Will Define Us',
      contentFile: 'crisis-that-defines-us.md',
      duration: 7,
      order: 5,
      tags: ['architecture', 'crisis', 'strategy', 'future'],
      relatedTopics: ['managed-offline', 'saas-gen3']
    }
  ],

  challenges: [
    {
      id: 'challenges-overview',
      title: 'Service Challenges Overview',
      contentFile: 'challenges-overview.md',
      duration: 3,
      order: 1,
      tags: ['challenges', 'overview'],
      relatedTopics: ['esa-summary', 'accenture', 'shell']
    },
    {
      id: 'esa-summary',
      title: 'ESA Summary',
      contentFile: 'esa-summary.md',
      duration: 5,
      order: 2,
      tags: ['esa', 'summary', 'overview'],
      relatedTopics: ['challenges-overview', 'accenture']
    },
    {
      id: 'accenture',
      title: 'Case Study: Accenture vs DataDog',
      contentFile: 'accenture.md',
      duration: 4,
      order: 3,
      tags: ['case-study', 'competitive', 'loss'],
      relatedTopics: ['esa-summary', 'academy', 'shell']
    },
    {
      id: 'academy',
      title: 'Case Study: Academy Migration',
      contentFile: 'academy.md',
      duration: 3,
      order: 4,
      tags: ['case-study', 'migration', 'preparation'],
      relatedTopics: ['accenture', 'shell']
    },
    {
      id: 'shell',
      title: 'Case Study: Shell FinOps',
      contentFile: 'shell.md',
      duration: 4,
      order: 5,
      tags: ['case-study', 'finops', 'service-loss'],
      relatedTopics: ['academy', 'esa-ai-case-01']
    },
    {
      id: 'esa-ai-case-01',
      title: 'ESA: AI Recent Example',
      contentFile: 'esa-ai-case-01.md',
      duration: 5,
      order: 6,
      tags: ['esa', 'ai', 'case-study'],
      relatedTopics: ['shell', 'esa-ai-case-02']
    },
    {
      id: 'esa-ai-case-02',
      title: 'ESA: AI Other Use Cases',
      contentFile: 'esa-ai-case-02.md',
      duration: 5,
      order: 7,
      tags: ['esa', 'ai', 'case-study'],
      relatedTopics: ['esa-ai-case-01', 'esa-ai-case-03']
    },
    {
      id: 'esa-ai-case-03',
      title: 'ESA: AI Case 03',
      contentFile: 'esa-ai-case-03.md',
      duration: 5,
      order: 8,
      tags: ['esa', 'ai', 'case-study'],
      relatedTopics: ['esa-ai-case-02']
    }
  ],

  'ai-crash-course': [
    {
      id: 'ai-mindset',
      title: 'AI Mindset & Organizational Readiness',
      contentFile: 'ai-mindset.md',
      duration: 5,
      order: 1,
      tags: ['ai', 'mindset', 'culture'],
      relatedTopics: ['security-considerations']
    },
    {
      id: 'security-considerations',
      title: 'Security Hurdles & Compliance',
      contentFile: 'security-considerations.md',
      duration: 5,
      order: 2,
      tags: ['ai', 'security', 'compliance'],
      relatedTopics: ['ollama-private', 'ai-mindset']
    },
    {
      id: 'ollama-private',
      title: 'Ollama & Private Model Hosting',
      contentFile: 'ollama-private.md',
      duration: 5,
      order: 3,
      tags: ['ai', 'ollama', 'private-hosting'],
      relatedTopics: ['rag-fundamentals']
    },
    {
      id: 'rag-fundamentals',
      title: 'RAG, Chunking & Embeddings',
      contentFile: 'rag-fundamentals.md',
      duration: 5,
      order: 4,
      tags: ['ai', 'rag', 'embeddings'],
      relatedTopics: ['knowledge-graphs', 'claude-ecosystem']
    },
    {
      id: 'knowledge-graphs',
      title: 'Knowledge Graphs',
      contentFile: 'knowledge-graphs.md',
      duration: 5,
      order: 5,
      tags: ['ai', 'knowledge-graphs'],
      relatedTopics: ['rag-fundamentals', 'claude-ecosystem']
    },
    {
      id: 'claude-ecosystem',
      title: 'Claude Projects, Skills & Agents',
      contentFile: 'claude-ecosystem.md',
      duration: 5,
      order: 6,
      tags: ['ai', 'claude', 'agents'],
      relatedTopics: ['security-deployment']
    }
  ],

  'app-demo': [
    {
      id: 'template-overview',
      title: 'App Building Template Overview',
      contentFile: 'template-overview.md',
      duration: 7,
      order: 1,
      tags: ['demo', 'template', 'development'],
      relatedTopics: ['volumetric-explorer']
    },
    {
      id: 'volumetric-explorer',
      title: 'Volumetric Explorer: Best Buy Case Study',
      contentFile: 'volumetric-explorer.md',
      duration: 8,
      order: 2,
      tags: ['demo', 'case-study', 'best-buy'],
      relatedTopics: ['template-overview']
    }
  ],

  'dynabridge-vision': [
    {
      id: 'dynabridge-splunk',
      title: 'DynaBridge for Splunk',
      contentFile: 'dynabridge-splunk.md',
      duration: 8,
      order: 1,
      tags: ['splunk', 'dynabridge', 'automation'],
      relatedTopics: ['migration-challenges', 'platform-expansion']
    },
    {
      id: 'migration-challenges',
      title: 'Splunk Migration Challenges',
      contentFile: 'migration-challenges.md',
      duration: 6,
      order: 2,
      tags: ['splunk', 'migration', 'challenges', 'dynabridge'],
      relatedTopics: ['dynabridge-splunk', 'platform-expansion']
    },
    {
      id: 'platform-expansion',
      title: 'Platform Expansion Strategy',
      contentFile: 'platform-expansion.md',
      duration: 5,
      order: 3,
      tags: ['dynabridge', 'strategy', 'expansion'],
      relatedTopics: ['migration-challenges', 'workflow-consistency']
    },
    {
      id: 'workflow-consistency',
      title: 'Workflow Consistency & Reusability',
      contentFile: 'workflow-consistency.md',
      duration: 5,
      order: 4,
      tags: ['dynabridge', 'workflow', 'consistency'],
      relatedTopics: ['platform-expansion']
    }
  ],

  blueprint: [
    {
      id: 'org-vision',
      title: 'Organization Vision & Structure',
      contentFile: 'org-vision.md',
      duration: 5,
      order: 1,
      tags: ['blueprint', 'organization', 'vision'],
      relatedTopics: ['forge-initiative']
    },
    {
      id: 'forge-initiative',
      title: 'The Forge Initiative',
      contentFile: 'forge-initiative.md',
      duration: 5,
      order: 2,
      tags: ['blueprint', 'forge', 'initiative'],
      relatedTopics: ['langgraph', 'pulseboard']
    },
    {
      id: 'langgraph',
      title: 'LangGraph Architecture',
      contentFile: 'langgraph.md',
      duration: 5,
      order: 3,
      tags: ['blueprint', 'langgraph', 'ai'],
      relatedTopics: ['pulseboard']
    },
    {
      id: 'pulseboard',
      title: 'CCO DynaPulse: Customer Signal Fabric',
      contentFile: 'pulseboard.md',
      duration: 5,
      order: 4,
      tags: ['blueprint', 'pulseboard', 'customer-signals'],
      relatedTopics: ['langgraph', 'forge-initiative']
    }
  ],

  qa: [
    {
      id: 'qa-session',
      title: 'Q&A Discussion',
      contentFile: 'qa-session.md',
      duration: 15,
      order: 1,
      tags: ['qa', 'discussion'],
      relatedTopics: []
    }
  ]
};

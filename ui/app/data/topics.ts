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
      relatedTopics: ['accenture', 'shell']
    },
    {
      id: 'accenture',
      title: 'Case Study: Accenture vs DataDog',
      contentFile: 'accenture.md',
      duration: 4,
      order: 2,
      tags: ['case-study', 'competitive', 'loss'],
      relatedTopics: ['academy', 'shell']
    },
    {
      id: 'academy',
      title: 'Case Study: Academy Migration',
      contentFile: 'academy.md',
      duration: 3,
      order: 3,
      tags: ['case-study', 'migration', 'preparation'],
      relatedTopics: ['accenture', 'gm']
    },
    {
      id: 'shell',
      title: 'Case Study: Shell FinOps',
      contentFile: 'shell.md',
      duration: 4,
      order: 4,
      tags: ['case-study', 'finops', 'service-loss'],
      relatedTopics: ['gm', 'accenture']
    },
    {
      id: 'gm',
      title: 'Case Study: GM Incident',
      contentFile: 'gm.md',
      duration: 3,
      order: 5,
      tags: ['case-study', 'incident', 'visibility'],
      relatedTopics: ['american-airlines', 'shell']
    },
    {
      id: 'frit-boa',
      title: 'Case Study: FRIT & BOA Navigation',
      contentFile: 'frit-boa.md',
      duration: 4,
      order: 6,
      tags: ['case-study', 'navigation', 'complexity'],
      relatedTopics: ['american-airlines']
    },
    {
      id: 'american-airlines',
      title: 'Case Study: American Airlines',
      contentFile: 'american-airlines.md',
      duration: 4,
      order: 7,
      tags: ['case-study', 'architecture', 'sev1'],
      relatedTopics: ['gm', 'frit-boa']
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

  'splunk-migration': [
    {
      id: 'migration-challenges',
      title: 'Splunk Migration Challenges',
      contentFile: 'migration-challenges.md',
      duration: 6,
      order: 1,
      tags: ['splunk', 'migration', 'challenges'],
      relatedTopics: ['conversion-complexity']
    },
    {
      id: 'conversion-complexity',
      title: 'SPL to DQL Conversion',
      contentFile: 'conversion-complexity.md',
      duration: 6,
      order: 2,
      tags: ['splunk', 'spl', 'dql'],
      relatedTopics: ['manual-process']
    },
    {
      id: 'manual-process',
      title: 'Manual Migration Pain Points',
      contentFile: 'manual-process.md',
      duration: 5,
      order: 3,
      tags: ['splunk', 'manual', 'pain-points'],
      relatedTopics: ['conversion-complexity']
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
      relatedTopics: ['platform-expansion', 'workflow-consistency']
    },
    {
      id: 'platform-expansion',
      title: 'Platform Expansion Strategy',
      contentFile: 'platform-expansion.md',
      duration: 5,
      order: 2,
      tags: ['dynabridge', 'strategy', 'expansion'],
      relatedTopics: ['dynabridge-splunk', 'workflow-consistency']
    },
    {
      id: 'workflow-consistency',
      title: 'Workflow Consistency & Reusability',
      contentFile: 'workflow-consistency.md',
      duration: 5,
      order: 3,
      tags: ['dynabridge', 'workflow', 'consistency'],
      relatedTopics: ['dynabridge-splunk', 'platform-expansion']
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
      title: 'CCO PulseBoard: Customer Signal Fabric',
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

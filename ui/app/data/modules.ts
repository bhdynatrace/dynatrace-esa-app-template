/**
 * Module Configuration
 * Deep Dive Presents (D1-ESA)
 */

import { Module } from '../types/content';

export const MODULES: Module[] = [
  {
    id: 'architectures',
    title: 'Platforms & Challenges',
    description: 'Overview of Dynatrace platform deployment models and challenges',
    duration: 20,
    order: 1,
    icon: 'architecture',
    color: '#6c5dd3'
  },
  {
    id: 'challenges',
    title: 'Service Challenges',
    description: 'Real-world case studies and service gaps',
    duration: 25,
    order: 2,
    icon: 'alert',
    color: '#ee3d48'
  },
  {
    id: 'ai-crash-course',
    title: 'AI Crash Course',
    description: 'AI mindset, security, RAG, and Claude ecosystem',
    duration: 30,
    order: 3,
    icon: 'brain',
    color: '#00a1e0'
  },
  {
    id: 'app-demo',
    title: 'App Building Demo',
    description: 'Template overview and Volumetric Explorer case study',
    duration: 15,
    order: 4,
    icon: 'dashboard',
    color: '#32c832'
  },
  {
    id: 'splunk-migration',
    title: 'Splunk Migration',
    description: 'Deep dive into Splunk to Dynatrace migration challenges',
    duration: 17,
    order: 5,
    icon: 'transfer',
    color: '#ffc800'
  },
  {
    id: 'dynabridge-vision',
    title: 'DynaBridge Vision',
    description: 'DynaBridge for Splunk, platform expansion, and workflow consistency',
    duration: 18,
    order: 6,
    icon: 'bridge',
    color: '#d946ef'
  },
  {
    id: 'blueprint',
    title: 'Vision',
    description: 'Customer Solutions & AI Engineering organization vision',
    duration: 20,
    order: 7,
    icon: 'blueprint',
    color: '#3b82f6'
  },
  {
    id: 'qa',
    title: 'Q&A',
    description: 'Open forum and discussion',
    duration: 15,
    order: 8,
    icon: 'question',
    color: '#8b5cf6'
  }
];

export const getModuleById = (id: string): Module | undefined => {
  return MODULES.find(m => m.id === id);
};

export const getModuleIndex = (id: string): number => {
  return MODULES.findIndex(m => m.id === id);
};

export const getNextModule = (currentId: string): Module | undefined => {
  const currentIndex = getModuleIndex(currentId);
  if (currentIndex === -1 || currentIndex === MODULES.length - 1) {
    return undefined;
  }
  return MODULES[currentIndex + 1];
};

export const getPreviousModule = (currentId: string): Module | undefined => {
  const currentIndex = getModuleIndex(currentId);
  if (currentIndex <= 0) {
    return undefined;
  }
  return MODULES[currentIndex - 1];
};

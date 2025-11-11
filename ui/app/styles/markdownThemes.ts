/**
 * Markdown Theme System
 * Defines different styling themes for markdown content rendering
 */

export type ThemeId = 'classic' | 'executive' | 'presentation' | 'technical' | 'academic' | 'cosmic';

export interface MarkdownTheme {
  id: ThemeId;
  name: string;
  description: string;
  styles: {
    // Headers
    h1Size: string;
    h1Weight: string;
    h1Color: string;
    h1Background: string;
    h1Padding: string;
    h1BorderRadius: string;
    h1MarginBottom: string;
    h1BoxShadow?: string;

    h2Size: string;
    h2Weight: string;
    h2Color: string;
    h2BorderBottom: string;
    h2PaddingBottom: string;
    h2MarginBottom: string;
    h2BoxShadow?: string;

    h3Size: string;
    h3Weight: string;
    h3Color: string;
    h3MarginBottom: string;
    h3BoxShadow?: string;

    // Body text
    paragraphSize: string;
    paragraphLineHeight: string;
    paragraphMarginBottom: string;

    // Code
    codeBackground: string;
    codeBorder: string;
    codePadding: string;
    codeBorderRadius: string;
    codeBlockPadding: string;

    // Lists
    listMarginLeft: string;
    listItemMarginBottom: string;

    // Blockquotes
    blockquoteBackground: string;
    blockquoteBorderLeft: string;
    blockquotePadding: string;

    // Links
    linkColor: string;
    linkHoverColor: string;

    // Tables
    tableBorder: string;
    tableHeaderBackground: string;
    tableRowHoverBackground: string;
  };
}

export const MARKDOWN_THEMES: Record<ThemeId, MarkdownTheme> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Clean, minimal styling - easy on the eyes',
    styles: {
      h1Size: '32px',
      h1Weight: '600',
      h1Color: '#ffffff',
      h1Background: 'transparent',
      h1Padding: '0',
      h1BorderRadius: '0',
      h1MarginBottom: '24px',

      h2Size: '24px',
      h2Weight: '600',
      h2Color: '#f0f0f5',
      h2BorderBottom: '1px solid rgba(108, 93, 211, 0.3)',
      h2PaddingBottom: '8px',
      h2MarginBottom: '16px',

      h3Size: '20px',
      h3Weight: '600',
      h3Color: '#e0e0e5',
      h3MarginBottom: '12px',

      paragraphSize: '16px',
      paragraphLineHeight: '1.6',
      paragraphMarginBottom: '16px',

      codeBackground: 'rgba(45, 48, 73, 0.6)',
      codeBorder: '1px solid rgba(108, 93, 211, 0.3)',
      codePadding: '2px 6px',
      codeBorderRadius: '4px',
      codeBlockPadding: '16px',

      listMarginLeft: '24px',
      listItemMarginBottom: '8px',

      blockquoteBackground: 'rgba(45, 48, 73, 0.4)',
      blockquoteBorderLeft: '4px solid rgba(108, 93, 211, 0.6)',
      blockquotePadding: '12px 16px',

      linkColor: '#8b7cff',
      linkHoverColor: '#a99bff',

      tableBorder: '1px solid rgba(108, 93, 211, 0.3)',
      tableHeaderBackground: 'rgba(108, 93, 211, 0.2)',
      tableRowHoverBackground: 'rgba(108, 93, 211, 0.1)'
    }
  },

  executive: {
    id: 'executive',
    name: 'Executive',
    description: 'Bold headers with backgrounds - commanding presence',
    styles: {
      h1Size: '36px',
      h1Weight: '700',
      h1Color: '#ffffff',
      h1Background: 'linear-gradient(135deg, rgba(108, 93, 211, 0.3) 0%, rgba(108, 93, 211, 0.15) 100%)',
      h1Padding: '12px 20px',
      h1BorderRadius: '8px',
      h1MarginBottom: '24px',
      h1BoxShadow: '0 8px 16px rgba(0, 0, 0, 0.6), 0 4px 8px rgba(0, 0, 0, 0.4)',

      h2Size: '24px',
      h2Weight: '700',
      h2Color: '#d8b9ff',
      h2BorderBottom: '3px solid rgba(108, 93, 211, 0.6)',
      h2PaddingBottom: '10px',
      h2MarginBottom: '20px',
      h2BoxShadow: '0 6px 12px rgba(0, 0, 0, 0.5), 0 3px 6px rgba(0, 0, 0, 0.3)',

      h3Size: '18px',
      h3Weight: '600',
      h3Color: '#a99bff',
      h3MarginBottom: '14px',
      h3BoxShadow: '0 4px 10px rgba(0, 0, 0, 0.45), 0 2px 5px rgba(0, 0, 0, 0.25)',

      paragraphSize: '16px',
      paragraphLineHeight: '1.7',
      paragraphMarginBottom: '16px',

      codeBackground: 'rgba(108, 93, 211, 0.2)',
      codeBorder: '2px solid rgba(108, 93, 211, 0.4)',
      codePadding: '4px 8px',
      codeBorderRadius: '6px',
      codeBlockPadding: '20px',

      listMarginLeft: '28px',
      listItemMarginBottom: '12px',

      blockquoteBackground: 'rgba(108, 93, 211, 0.15)',
      blockquoteBorderLeft: '6px solid rgba(216, 185, 255, 0.8)',
      blockquotePadding: '16px 20px',

      linkColor: '#d8b9ff',
      linkHoverColor: '#ffffff',

      tableBorder: '2px solid rgba(108, 93, 211, 0.4)',
      tableHeaderBackground: 'rgba(108, 93, 211, 0.3)',
      tableRowHoverBackground: 'rgba(108, 93, 211, 0.15)'
    }
  },

  presentation: {
    id: 'presentation',
    name: 'Presentation',
    description: 'Extra large fonts - perfect for projectors',
    styles: {
      h1Size: '56px',
      h1Weight: '800',
      h1Color: '#ffffff',
      h1Background: 'rgba(108, 93, 211, 0.2)',
      h1Padding: '20px 32px',
      h1BorderRadius: '12px',
      h1MarginBottom: '40px',

      h2Size: '40px',
      h2Weight: '700',
      h2Color: '#ffffff',
      h2BorderBottom: '4px solid rgba(108, 93, 211, 0.8)',
      h2PaddingBottom: '16px',
      h2MarginBottom: '32px',

      h3Size: '32px',
      h3Weight: '600',
      h3Color: '#f0f0f5',
      h3MarginBottom: '24px',

      paragraphSize: '22px',
      paragraphLineHeight: '1.8',
      paragraphMarginBottom: '24px',

      codeBackground: 'rgba(45, 48, 73, 0.8)',
      codeBorder: '2px solid rgba(108, 93, 211, 0.5)',
      codePadding: '6px 12px',
      codeBorderRadius: '8px',
      codeBlockPadding: '24px',

      listMarginLeft: '32px',
      listItemMarginBottom: '16px',

      blockquoteBackground: 'rgba(108, 93, 211, 0.2)',
      blockquoteBorderLeft: '8px solid rgba(108, 93, 211, 1)',
      blockquotePadding: '20px 24px',

      linkColor: '#a99bff',
      linkHoverColor: '#d8b9ff',

      tableBorder: '3px solid rgba(108, 93, 211, 0.5)',
      tableHeaderBackground: 'rgba(108, 93, 211, 0.4)',
      tableRowHoverBackground: 'rgba(108, 93, 211, 0.2)'
    }
  },

  technical: {
    id: 'technical',
    name: 'Technical',
    description: 'Monospace focus - developer-friendly',
    styles: {
      h1Size: '28px',
      h1Weight: '700',
      h1Color: '#50fa7b',
      h1Background: 'transparent',
      h1Padding: '0',
      h1BorderRadius: '0',
      h1MarginBottom: '20px',

      h2Size: '22px',
      h2Weight: '700',
      h2Color: '#8be9fd',
      h2BorderBottom: '2px solid rgba(139, 233, 253, 0.3)',
      h2PaddingBottom: '6px',
      h2MarginBottom: '16px',

      h3Size: '18px',
      h3Weight: '600',
      h3Color: '#ffb86c',
      h3MarginBottom: '12px',

      paragraphSize: '15px',
      paragraphLineHeight: '1.6',
      paragraphMarginBottom: '16px',

      codeBackground: 'rgba(68, 71, 90, 0.8)',
      codeBorder: '1px solid rgba(80, 250, 123, 0.3)',
      codePadding: '3px 8px',
      codeBorderRadius: '3px',
      codeBlockPadding: '16px',

      listMarginLeft: '24px',
      listItemMarginBottom: '8px',

      blockquoteBackground: 'rgba(68, 71, 90, 0.4)',
      blockquoteBorderLeft: '4px solid rgba(189, 147, 249, 0.6)',
      blockquotePadding: '12px 16px',

      linkColor: '#8be9fd',
      linkHoverColor: '#50fa7b',

      tableBorder: '1px solid rgba(139, 233, 253, 0.3)',
      tableHeaderBackground: 'rgba(68, 71, 90, 0.6)',
      tableRowHoverBackground: 'rgba(68, 71, 90, 0.3)'
    }
  },

  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Traditional document style - scholarly appearance',
    styles: {
      h1Size: '36px',
      h1Weight: '700',
      h1Color: '#ffffff',
      h1Background: 'transparent',
      h1Padding: '0',
      h1BorderRadius: '0',
      h1MarginBottom: '28px',

      h2Size: '28px',
      h2Weight: '600',
      h2Color: '#f0f0f5',
      h2BorderBottom: '2px solid rgba(180, 180, 190, 0.3)',
      h2PaddingBottom: '10px',
      h2MarginBottom: '20px',

      h3Size: '22px',
      h3Weight: '600',
      h3Color: '#e0e0e5',
      h3MarginBottom: '14px',

      paragraphSize: '17px',
      paragraphLineHeight: '1.75',
      paragraphMarginBottom: '18px',

      codeBackground: 'rgba(180, 180, 190, 0.1)',
      codeBorder: '1px solid rgba(180, 180, 190, 0.3)',
      codePadding: '3px 7px',
      codeBorderRadius: '3px',
      codeBlockPadding: '18px',

      listMarginLeft: '32px',
      listItemMarginBottom: '10px',

      blockquoteBackground: 'rgba(180, 180, 190, 0.05)',
      blockquoteBorderLeft: '5px solid rgba(180, 180, 190, 0.4)',
      blockquotePadding: '14px 18px',

      linkColor: '#9b9bab',
      linkHoverColor: '#c0c0cf',

      tableBorder: '1px solid rgba(180, 180, 190, 0.3)',
      tableHeaderBackground: 'rgba(180, 180, 190, 0.15)',
      tableRowHoverBackground: 'rgba(180, 180, 190, 0.08)'
    }
  },

  cosmic: {
    id: 'cosmic',
    name: 'Cosmic',
    description: 'Space-inspired theme - clean white text on cosmic gradient',
    styles: {
      h1Size: '42px',
      h1Weight: '300',
      h1Color: '#ffffff',
      h1Background: 'transparent',
      h1Padding: '0',
      h1BorderRadius: '0',
      h1MarginBottom: '32px',

      h2Size: '32px',
      h2Weight: '400',
      h2Color: '#ffffff',
      h2BorderBottom: 'none',
      h2PaddingBottom: '0',
      h2MarginBottom: '24px',

      h3Size: '24px',
      h3Weight: '400',
      h3Color: 'rgba(255, 255, 255, 0.95)',
      h3MarginBottom: '16px',

      paragraphSize: '17px',
      paragraphLineHeight: '1.7',
      paragraphMarginBottom: '18px',

      codeBackground: 'rgba(0, 0, 0, 0.3)',
      codeBorder: '1px solid rgba(255, 255, 255, 0.2)',
      codePadding: '3px 8px',
      codeBorderRadius: '4px',
      codeBlockPadding: '20px',

      listMarginLeft: '28px',
      listItemMarginBottom: '12px',

      blockquoteBackground: 'rgba(255, 255, 255, 0.05)',
      blockquoteBorderLeft: '4px solid rgba(255, 255, 255, 0.3)',
      blockquotePadding: '16px 20px',

      linkColor: '#b8a3ff',
      linkHoverColor: '#d4c5ff',

      tableBorder: '1px solid rgba(255, 255, 255, 0.2)',
      tableHeaderBackground: 'rgba(255, 255, 255, 0.1)',
      tableRowHoverBackground: 'rgba(255, 255, 255, 0.05)'
    }
  }
};

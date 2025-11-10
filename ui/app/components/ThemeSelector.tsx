/**
 * ThemeSelector Component
 * Dropdown for selecting markdown content themes
 */

import React from 'react';
import { Flex, Text } from '@dynatrace/strato-components';
import { MARKDOWN_THEMES, ThemeId } from '../styles/markdownThemes';

interface ThemeSelectorProps {
  currentTheme: ThemeId;
  onThemeChange: (themeId: ThemeId) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentTheme, onThemeChange }) => {
  return (
    <Flex alignItems="center" gap={8} style={{
      padding: '8px 12px',
      background: 'rgba(108, 93, 211, 0.15)',
      borderRadius: '8px',
      border: '1px solid rgba(108, 93, 211, 0.4)'
    }}>
      <Text style={{ fontSize: '12px', color: '#8b7deb', fontWeight: 600 }}>
        🎨 Admin Theme:
      </Text>
      <select
        value={currentTheme}
        onChange={(e) => onThemeChange(e.target.value as ThemeId)}
        title="Set content theme for all users (Admin only)"
        style={{
          padding: '6px 10px',
          background: 'rgba(45, 48, 73, 0.9)',
          border: '2px solid rgba(108, 93, 211, 0.5)',
          borderRadius: '6px',
          color: '#f0f0f5',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(108, 93, 211, 0.8)';
          e.currentTarget.style.background = 'rgba(45, 48, 73, 1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(108, 93, 211, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(108, 93, 211, 0.5)';
          e.currentTarget.style.background = 'rgba(45, 48, 73, 0.9)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {Object.values(MARKDOWN_THEMES).map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name} - {theme.description}
          </option>
        ))}
      </select>
    </Flex>
  );
};

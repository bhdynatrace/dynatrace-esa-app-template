/**
 * ChevronNavigation Component
 * Top-level module navigation with progress indicators
 */

import React from 'react';
import { Flex, Text } from '@dynatrace/strato-components';
import { Module, ModuleId } from '../types/content';

interface ChevronNavigationProps {
  modules: Module[];
  currentModule: ModuleId;
  onModuleChange: (moduleId: ModuleId) => void;
  progress: Record<ModuleId, number>;
  completedTopics: Set<string>;
}

interface ChevronStepProps {
  module: Module;
  isActive: boolean;
  isCompleted: boolean;
  progress: number;
  onClick: () => void;
  showConnector: boolean;
}

const ChevronStep: React.FC<ChevronStepProps> = ({
  module,
  isActive,
  isCompleted,
  progress,
  onClick,
  showConnector
}) => {
  const getBackgroundStyle = () => {
    if (isActive) {
      return {
        background: 'linear-gradient(135deg, var(--dt-colors-accent-primary-default, #6c5dd3), #5848b3)',
        border: '2px solid var(--dt-colors-accent-primary-default, #6c5dd3)',
        boxShadow: '0 6px 20px rgba(108, 93, 211, 0.6), 0 3px 10px rgba(108, 93, 211, 0.4)'
      };
    }
    if (isCompleted) {
      return {
        background: 'rgba(50, 200, 50, 0.1)',
        border: '1px solid rgba(50, 200, 50, 0.5)',
        boxShadow: '0 5px 18px rgba(50, 200, 50, 0.4), 0 2px 8px rgba(50, 200, 50, 0.3)'
      };
    }
    return {
      background: 'rgba(45, 48, 73, 0.5)',
      border: '1px solid rgba(108, 93, 211, 0.2)',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5), 0 2px 6px rgba(0, 0, 0, 0.3)'
    };
  };

  const getTextColor = () => {
    if (isActive) return '#ffffff';
    if (isCompleted) return '#32c832';
    return '#b4b4be';
  };

  return (
    <Flex alignItems="center" gap={0}>
      <div title={`${module.title} (${module.duration} min)`}>
        <Flex
          flexDirection="column"
          onClick={onClick}
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            minWidth: '140px',
            height: '70px',
            borderRadius: '8px',
            position: 'relative',
            transition: 'all 0.2s ease',
            ...getBackgroundStyle()
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = 'rgba(108, 93, 211, 0.15)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.background = getBackgroundStyle().background;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <Flex justifyContent="space-between" alignItems="center" style={{ marginBottom: '4px' }}>
            <Text
              style={{
                fontSize: '12px',
                fontWeight: isActive ? 600 : 500,
                color: getTextColor(),
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {module.title.split(' ')[0]}
            </Text>
            {isCompleted && (
              <Text style={{ fontSize: '14px', color: '#32c832' }}>✓</Text>
            )}
          </Flex>

          <Text
            style={{
              fontSize: '11px',
              color: isActive ? 'rgba(255, 255, 255, 0.7)' : 'rgba(180, 180, 190, 0.6)',
              lineHeight: '1.2',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {module.duration}m
          </Text>

          {/* Progress bar */}
          {progress > 0 && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                width: `${progress}%`,
                height: '3px',
                background: isCompleted
                  ? '#32c832'
                  : 'linear-gradient(90deg, var(--dt-colors-accent-primary-default, #6c5dd3), #32c832)',
                borderRadius: '0 0 0 8px',
                transition: 'width 0.5s ease-in-out'
              }}
            />
          )}
        </Flex>
      </div>

      {/* Connector arrow */}
      {showConnector && (
        <Text
          style={{
            fontSize: '20px',
            color: 'rgba(108, 93, 211, 0.4)',
            margin: '0 4px',
            userSelect: 'none'
          }}
        >
          ▶
        </Text>
      )}
    </Flex>
  );
};

export const ChevronNavigation: React.FC<ChevronNavigationProps> = ({
  modules,
  currentModule,
  onModuleChange,
  progress
}) => {
  return (
    <Flex
      flexDirection="column"
      gap={8}
      style={{
        padding: '16px 24px',
        background: 'var(--dt-colors-background-container-default, #25273d)',
        borderBottom: '1px solid rgba(108, 93, 211, 0.2)'
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
          Session Progress
        </Text>
        <Text
          style={{
            fontSize: '12px',
            color: 'var(--dt-colors-text-neutral-default, #f0f0f5)'
          }}
        >
          {modules.reduce((sum, m) => sum + m.duration, 0)} minutes total
        </Text>
      </Flex>

      <Flex gap={0} style={{ overflowX: 'auto', paddingBottom: '8px' }}>
        {modules.map((module, index) => {
          const moduleProgress = progress[module.id] || 0;
          const isCompleted = moduleProgress === 100;

          return (
            <ChevronStep
              key={module.id}
              module={module}
              isActive={currentModule === module.id}
              isCompleted={isCompleted}
              progress={moduleProgress}
              onClick={() => onModuleChange(module.id)}
              showConnector={index < modules.length - 1}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};

/**
 * ThinkingStickFigure Component
 * An animated stick figure that paces on a line, occasionally stops to celebrate
 * Multiple figures climb onto the line over time
 * Only appears on the AI Mindset topic
 */

import React, { useState, useEffect, useRef } from 'react';

type AnimationState = 'walking-right' | 'walking-left' | 'celebrating' | 'pausing' | 'climbing';

interface StickFigure {
  id: number;
  state: AnimationState;
  position: number;
  direction: 'left' | 'right';
  climbProgress: number; // 0 to 1 for climbing animation
  celebrateFrames: number; // Frame counter for celebrations
  pauseFrames: number; // Frame counter for pauses
  lastCelebrateTime: number; // Timestamp of last celebration
  nextCelebrateDelay: number; // Ms until next celebration (5-20 seconds)
}

const MAX_FIGURES = 12;
const SPAWN_INTERVAL = 4000; // 4 seconds between new figures
const CELEBRATION_FRAMES = 180; // 3 seconds at 60fps
const PAUSE_FRAMES = 60; // 1 second at 60fps

export const ThinkingStickFigure: React.FC = () => {
  const [figures, setFigures] = useState<StickFigure[]>([{
    id: 0,
    state: 'walking-right',
    position: 50,
    direction: 'right',
    climbProgress: 1,
    celebrateFrames: 0,
    pauseFrames: 0,
    lastCelebrateTime: Date.now(),
    nextCelebrateDelay: 5000 + Math.random() * 15000 // Random 5-20 seconds
  }]);

  const [multiplier, setMultiplier] = useState(2);

  const animationRef = useRef<number | null>(null);
  const nextIdRef = useRef(1);
  const lastSpawnTimeRef = useRef(Date.now());

  // Animation loop - handles ALL state transitions and movement
  useEffect(() => {
    const animate = () => {
      const now = Date.now();

      setFigures(prev => {
        let updated = prev.map((figure): StickFigure => {
          // Handle climbing animation
          if (figure.state === 'climbing') {
            const newProgress = Math.min(1, figure.climbProgress + 0.015);
            if (newProgress >= 1) {
              return {
                ...figure,
                state: figure.direction === 'right' ? 'walking-right' : 'walking-left',
                climbProgress: 1
              };
            }
            return { ...figure, climbProgress: newProgress };
          }

          // Handle celebration countdown
          if (figure.state === 'celebrating') {
            if (figure.celebrateFrames >= CELEBRATION_FRAMES) {
              return {
                ...figure,
                state: figure.direction === 'right' ? 'walking-right' : 'walking-left',
                celebrateFrames: 0,
                lastCelebrateTime: now,
                nextCelebrateDelay: 5000 + Math.random() * 15000 // Random 5-20 seconds
              };
            }
            return { ...figure, celebrateFrames: figure.celebrateFrames + 1 };
          }

          // Handle pause countdown (turn around at edges)
          if (figure.state === 'pausing') {
            if (figure.pauseFrames >= PAUSE_FRAMES) {
              const newDirection = figure.direction === 'right' ? 'left' : 'right';
              return {
                ...figure,
                state: newDirection === 'right' ? 'walking-right' : 'walking-left',
                pauseFrames: 0,
                direction: newDirection
              };
            }
            return { ...figure, pauseFrames: figure.pauseFrames + 1 };
          }

          // Handle walking animation
          if (figure.state === 'walking-right' || figure.state === 'walking-left') {
            const speed = 0.06;
            const newPos = figure.state === 'walking-right'
              ? figure.position + speed
              : figure.position - speed;
            const clampedPos = Math.max(10, Math.min(90, newPos));

            // Check for edges
            const isAtLeftEdge = clampedPos <= 10 && figure.direction === 'left';
            const isAtRightEdge = clampedPos >= 90 && figure.direction === 'right';

            if (isAtLeftEdge || isAtRightEdge) {
              return {
                ...figure,
                state: 'pausing',
                position: clampedPos,
                pauseFrames: 0
              };
            }

            // Check for random celebration (every 5-20 seconds)
            if (now - figure.lastCelebrateTime >= figure.nextCelebrateDelay) {
              return {
                ...figure,
                state: 'celebrating',
                position: clampedPos,
                celebrateFrames: 0
              };
            }

            return { ...figure, position: clampedPos };
          }

          return figure;
        });

        // Check if we should spawn a new figure
        if (updated.length < MAX_FIGURES && now - lastSpawnTimeRef.current >= SPAWN_INTERVAL) {
          lastSpawnTimeRef.current = now;
          const spawnPosition = 10 + Math.random() * 80;
          updated = [...updated, {
            id: nextIdRef.current++,
            state: 'climbing',
            position: spawnPosition,
            direction: Math.random() > 0.5 ? 'right' : 'left',
            climbProgress: 0,
            celebrateFrames: 0,
            pauseFrames: 0,
            lastCelebrateTime: now,
            nextCelebrateDelay: 5000 + Math.random() * 15000 // Random 5-20 seconds
          }];

          // Add 5 to the multiplier with each new figure, but cap at 50x
          setMultiplier(prev => Math.min(50, prev + 5));
        }

        return updated;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Render a single stick figure
  const renderStickFigure = (figure: StickFigure) => {
    const isWalking = figure.state === 'walking-right' || figure.state === 'walking-left';
    const isCelebrating = figure.state === 'celebrating';
    const isClimbing = figure.state === 'climbing';
    const facingRight = figure.direction === 'right';

    // Calculate vertical offset for climbing animation
    const climbOffset = isClimbing ? (1 - figure.climbProgress) * 60 : 0;

    return (
      <div
        key={figure.id}
        style={{
          position: 'absolute',
          top: `${climbOffset}px`,
          left: `${figure.position}%`,
          transform: 'translateX(-50%)',
          opacity: isClimbing ? figure.climbProgress : 1,
          zIndex: isClimbing ? 10 : 1
        }}
      >
        {/* Lightbulb emoji - appears when celebrating */}
        {isCelebrating && (
          <div
            className="lightbulb-emoji"
            style={{
              position: 'absolute',
              top: '-25px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '24px',
              zIndex: 10
            }}
          >
            💡
          </div>
        )}

        <svg
          width="40"
          height="60"
          viewBox="0 0 40 60"
          style={{
            transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
            transition: 'transform 0.5s ease'
          }}
        >
          {/* Head */}
          <circle
            cx={isWalking ? "28" : "20"}
            cy={isWalking ? "15" : "8"}
            r="6"
            fill="none"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2"
            style={{ transition: 'all 0.4s ease' }}
          />

          {/* Eyes - looking at user when celebrating */}
          {isCelebrating && (
            <>
              <circle cx="18" cy="7" r="1.5" fill="rgba(255, 255, 255, 0.9)" />
              <circle cx="22" cy="7" r="1.5" fill="rgba(255, 255, 255, 0.9)" />
            </>
          )}

          {/* Body */}
          <line
            x1={isWalking ? "28" : "20"}
            y1={isWalking ? "21" : "14"}
            x2={isWalking ? "24" : "20"}
            y2="35"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transition: 'all 0.4s ease' }}
          />

          {/* Arms */}
          {isCelebrating ? (
            <>
              <line x1="20" y1="20" x2="12" y2="12" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" className="celebrate-arm-left" />
              <line x1="20" y1="20" x2="28" y2="12" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" className="celebrate-arm-right" />
            </>
          ) : (
            <>
              <path d={isWalking ? "M 28 26 Q 20 30, 19 34" : "M 20 20 Q 14 24, 15 28"} fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" style={{ transition: 'all 0.4s ease' }} />
              <path d={isWalking ? "M 28 26 Q 26 30, 23 34" : "M 20 20 Q 26 24, 25 28"} fill="none" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="2" strokeLinecap="round" style={{ transition: 'all 0.4s ease' }} />
            </>
          )}

          {/* Legs */}
          {isWalking ? (
            <>
              <polyline points="24,35 21,42 18,50" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="walking-leg-left" style={{ transition: 'all 0.4s ease' }} />
              <polyline points="24,35 26,42 28,50" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="walking-leg-right" style={{ transition: 'all 0.4s ease' }} />
            </>
          ) : (
            <>
              <polyline points="20,35 19,42 18,50" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.4s ease' }} />
              <polyline points="20,35 21,42 22,50" fill="none" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'all 0.4s ease' }} />
            </>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div
      style={{
        width: '100%',
        height: '120px',
        position: 'relative',
        marginTop: '40px',
        marginBottom: '40px'
      }}
    >
      {/* Below the line - Traditional Solutioning */}
      <div
        style={{
          position: 'absolute',
          top: '75px',
          left: '10%',
          right: '10%',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '12px 32px',
          borderRadius: '12px',
          zIndex: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <span
          style={{
            fontFamily: '"Arial Black", "Impact", sans-serif',
            fontSize: '32px',
            fontWeight: 900,
            color: '#4A4A4A',
            letterSpacing: '2px'
          }}
        >
          CLASSIC THINKING & SOLUTIONING
        </span>
      </div>

      {/* Multiplier display - spinning gold text */}
      <div
        style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 0
        }}
      >
        <span
          className="multiplier-spin"
          style={{
            fontFamily: '"Arial Black", "Impact", sans-serif',
            fontSize: '30px',
            fontWeight: 900,
            color: '#FFD700',
            letterSpacing: '2px',
            textShadow: '0 0 12px rgba(255, 215, 0, 0.8)',
            display: 'inline-block'
          }}
        >
          {multiplier}x
        </span>
      </div>

      {/* Above the line - AI First Solutioning */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 0
        }}
      >
        <span
          style={{
            fontFamily: '"Arial Black", "Impact", sans-serif',
            fontSize: '28px',
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.8)',
            letterSpacing: '2px',
            textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
          }}
        >
          AI FIRST SOLUTIONING
        </span>
      </div>

      {/* The line */}
      <div
        style={{
          position: 'absolute',
          top: '60px',
          left: '10%',
          right: '10%',
          height: '2px',
          background: 'rgba(255, 255, 255, 0.6)',
          boxShadow: '0 0 8px rgba(255, 255, 255, 0.4)',
          zIndex: 1
        }}
      />

      {/* Render all stick figures */}
      {figures.map(figure => renderStickFigure(figure))}

      {/* CSS Animations */}
      <style>{`
        @keyframes walkingLegLeft {
          0%, 100% { transform: rotate(-15deg); transform-origin: 24px 35px; }
          50% { transform: rotate(15deg); transform-origin: 24px 35px; }
        }

        @keyframes walkingLegRight {
          0%, 100% { transform: rotate(15deg); transform-origin: 24px 35px; }
          50% { transform: rotate(-15deg); transform-origin: 24px 35px; }
        }

        @keyframes celebrateArms {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes lightbulbBlink {
          0%, 100% { opacity: 1; transform: translateX(-50%) scale(1); }
          50% { opacity: 0.3; transform: translateX(-50%) scale(1.1); }
        }

        @keyframes multiplierSpin {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        .walking-leg-left { animation: walkingLegLeft 0.6s ease-in-out infinite; }
        .walking-leg-right { animation: walkingLegRight 0.6s ease-in-out infinite; }
        .celebrate-arm-left, .celebrate-arm-right { animation: celebrateArms 0.5s ease-in-out infinite; }
        .lightbulb-emoji { animation: lightbulbBlink 0.6s ease-in-out infinite; }
        .multiplier-spin { animation: multiplierSpin 2s linear infinite; }
      `}</style>
    </div>
  );
};

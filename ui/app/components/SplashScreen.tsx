/**
 * SplashScreen Component
 * Displays inspirational quote before main content
 */

import React, { useEffect, useState } from 'react';
import { Flex, Text } from '@dynatrace/strato-components';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'black' | 'fadeInFirst' | 'firstMessage' | 'fadeFirst' | 'secondMessage' | 'fadeSecond' | 'thirdMessage' | 'fadeOut'>('black');

  useEffect(() => {
    // Spacebar skip handler
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        onComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    // Stage 1: Black screen for 2.5 seconds
    const blackTimer = setTimeout(() => {
      setStage('fadeInFirst');
    }, 2500);

    // Stage 2: Fade in first message for 1 second
    const fadeInFirstTimer = setTimeout(() => {
      setStage('firstMessage');
    }, 3500); // 2.5s black + 1s fade in

    // Stage 3: Show first message for 4 seconds
    const firstMessageTimer = setTimeout(() => {
      setStage('fadeFirst');
    }, 7500); // 2.5s black + 1s fade in + 4s first message

    // Stage 4: Fade out first message and show second message
    const secondMessageTimer = setTimeout(() => {
      setStage('secondMessage');
    }, 8500); // 2.5s black + 1s fade in + 4s first + 1s fade out

    // Stage 5: Show second message for 4 seconds
    const fadeSecondTimer = setTimeout(() => {
      setStage('fadeSecond');
    }, 12500); // 2.5s black + 1s fade in + 4s first + 1s fade out + 4s second

    // Stage 6: Fade out second message and show third message
    const thirdMessageTimer = setTimeout(() => {
      setStage('thirdMessage');
    }, 13500); // 2.5s black + 1s fade in + 4s first + 1s fade out + 4s second + 1s fade out

    // Stage 7: Show third message for 4 seconds
    const fadeThirdTimer = setTimeout(() => {
      setStage('fadeOut');
    }, 17500); // 2.5s black + 1s fade in + 4s first + 1s fade out + 4s second + 1s fade out + 4s third

    // Stage 8: Fade out and complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 18500); // 2.5s black + 1s fade in + 4s first + 1s fade out + 4s second + 1s fade out + 4s third + 1s fade out

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(blackTimer);
      clearTimeout(fadeInFirstTimer);
      clearTimeout(firstMessageTimer);
      clearTimeout(secondMessageTimer);
      clearTimeout(fadeSecondTimer);
      clearTimeout(thirdMessageTimer);
      clearTimeout(fadeThirdTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const getOpacity = () => {
    if (stage === 'black') return 0;
    if (stage === 'fadeInFirst') return 1; // Fade in via CSS transition
    if (stage === 'fadeFirst') return 0;
    if (stage === 'fadeSecond') return 0;
    if (stage === 'fadeOut') return 0;
    return 1;
  };

  const showFirstMessage = stage === 'fadeInFirst' || stage === 'firstMessage' || stage === 'fadeFirst';
  const showSecondMessage = stage === 'secondMessage' || stage === 'fadeSecond';
  const showThirdMessage = stage === 'thirdMessage' || stage === 'fadeOut';

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1542 0%, #1a1f4d 25%, #2d1b4e 50%, #3d1654 75%, #4a1a5c 100%)',
        padding: '48px',
        position: 'relative'
      }}
    >
      {/* Prominent vignette effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }}
      />
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {showFirstMessage && (
        <>
          <Text
            style={{
              fontSize: '48px',
              fontWeight: 300,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.4,
              maxWidth: '1000px',
              fontFamily: '"Georgia", "Times New Roman", serif',
              letterSpacing: '0.5px',
              opacity: getOpacity(),
              transition: 'opacity 1s ease-in-out',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0, 0, 0, 0.5)'
            }}
          >
            AI: The speed of Ideation to Execution is Mind Blowing!
          </Text>

          <Flex
            flexDirection="column"
            alignItems="center"
            gap={4}
            style={{
              marginTop: '48px',
              opacity: getOpacity(),
              transition: 'opacity 1s ease-in-out'
            }}
          >
            <Text
              style={{
                fontSize: '20px',
                fontWeight: 400,
                color: '#ffffff',
                textAlign: 'center',
                fontFamily: '"Georgia", "Times New Roman", serif'
              }}
            >
              by Brett Hofer - Sr. Global Director
            </Text>
            <Text
              style={{
                fontSize: '18px',
                fontWeight: 300,
                color: '#b4b4be',
                textAlign: 'center',
                fontFamily: '"Georgia", "Times New Roman", serif'
              }}
            >
              Enterprise Solutions & Architecture
            </Text>
          </Flex>
        </>
      )}

      {showSecondMessage && (
        <Text
          style={{
            fontSize: '48px',
            fontWeight: 300,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '1000px',
            fontFamily: '"Georgia", "Times New Roman", serif',
            letterSpacing: '0.5px',
            opacity: getOpacity(),
            transition: 'opacity 1s ease-in-out',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0, 0, 0, 0.5)'
          }}
        >
          Yes.. QBRs can be auto built and delivered this same way... thanks for joining.
        </Text>
      )}

      {showThirdMessage && (
        <Text
          style={{
            fontSize: '48px',
            fontWeight: 300,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.4,
            maxWidth: '1000px',
            fontFamily: '"Georgia", "Times New Roman", serif',
            letterSpacing: '0.5px',
            opacity: getOpacity(),
            transition: 'opacity 1s ease-in-out',
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.7), 0 2px 6px rgba(0, 0, 0, 0.5)'
          }}
        >
          No code was manually harmed or manually edited during the making of this presentation, thank you Claude.
        </Text>
      )}
      </div>
    </Flex>
  );
};

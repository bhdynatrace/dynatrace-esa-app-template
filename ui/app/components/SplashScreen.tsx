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
  const [stage, setStage] = useState<'black' | 'firstMessage' | 'fadeFirst' | 'secondMessage' | 'fadeSecond' | 'thirdMessage' | 'fadeOut'>('black');

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
      setStage('firstMessage');
    }, 2500);

    // Stage 2: Show first message for 3 seconds
    const firstMessageTimer = setTimeout(() => {
      setStage('fadeFirst');
    }, 5500); // 2.5s black + 3s first message

    // Stage 3: Fade first message and show second message
    const secondMessageTimer = setTimeout(() => {
      setStage('secondMessage');
    }, 6500); // 2.5s black + 3s first + 1s fade

    // Stage 4: Show second message for 4 seconds
    const fadeSecondTimer = setTimeout(() => {
      setStage('fadeSecond');
    }, 10500); // 2.5s black + 3s first + 1s fade + 4s second

    // Stage 5: Fade second message and show third message
    const thirdMessageTimer = setTimeout(() => {
      setStage('thirdMessage');
    }, 11500); // 2.5s black + 3s first + 1s fade + 4s second + 1s fade

    // Stage 6: Show third message for 4 seconds
    const fadeThirdTimer = setTimeout(() => {
      setStage('fadeOut');
    }, 15500); // 2.5s black + 3s first + 1s fade + 4s second + 1s fade + 4s third

    // Stage 7: Fade out and complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 16500); // 2.5s black + 3s first + 1s fade + 4s second + 1s fade + 4s third + 1s fade out

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      clearTimeout(blackTimer);
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
    if (stage === 'fadeFirst') return 0;
    if (stage === 'fadeSecond') return 0;
    if (stage === 'fadeOut') return 0;
    return 1;
  };

  const showFirstMessage = stage === 'firstMessage' || stage === 'fadeFirst';
  const showSecondMessage = stage === 'secondMessage' || stage === 'fadeSecond';
  const showThirdMessage = stage === 'thirdMessage' || stage === 'fadeOut';

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        padding: '48px'
      }}
    >
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
              transition: 'opacity 1s ease-in-out'
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
            transition: 'opacity 1s ease-in-out'
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
            transition: 'opacity 1s ease-in-out'
          }}
        >
          No code was manually harmed or edited during the making of this presentation, thank you Claude.
        </Text>
      )}
    </Flex>
  );
};

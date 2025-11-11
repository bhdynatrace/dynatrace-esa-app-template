/**
 * PasswordScreen Component
 * Initial password authentication screen
 */

import React, { useState } from 'react';
import { Flex, Text, Button } from '@dynatrace/strato-components';

interface PasswordScreenProps {
  onAuthenticated: (isAdmin: boolean) => void;
}

const CORRECT_PASSWORD = 'AiDeepDive';
const ADMIN_PASSWORD = 'adminAiDeep';

export const PasswordScreen: React.FC<PasswordScreenProps> = ({ onAuthenticated }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isSwipingOut, setIsSwipingOut] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isAdmin = password === ADMIN_PASSWORD;
    const isValidUser = password === CORRECT_PASSWORD || isAdmin;

    if (isValidUser) {
      setError(false);
      setIsSwipingOut(true);
      setIsFadingOut(true);
      // Store admin status in sessionStorage
      if (isAdmin) {
        sessionStorage.setItem('isAdmin', 'true');
      }
      // Trigger swipe out, then callback after animation completes
      setTimeout(() => {
        onAuthenticated(isAdmin);
      }, 1200); // 1.2 seconds for staggered swipe out
    } else {
      setError(true);
      // Shake animation on error
      const input = document.getElementById('password-input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => {
          input.classList.remove('shake');
        }, 500);
      }
    }
  };

  // Helper function to get swipe style for each element
  const getSwipeStyle = (direction: 'left' | 'right', delay: number) => ({
    transform: isSwipingOut ? `translateX(${direction === 'left' ? '-150%' : '150%'})` : 'translateX(0)',
    opacity: isSwipingOut ? 0 : 1,
    transition: `transform 0.6s ease-in ${delay}ms, opacity 0.6s ease-in ${delay}ms`
  });

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a1542 0%, #1a1f4d 25%, #2d1b4e 50%, #3d1654 75%, #4a1a5c 100%)',
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 1s ease-out',
        padding: '24px',
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
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <Flex
        flexDirection="column"
        gap={24}
        style={{
          width: '100%',
          maxWidth: '400px'
        }}
      >
        {/* Logo/Title */}
        <Flex flexDirection="column" alignItems="center" gap={12}>
          <div style={getSwipeStyle('left', 0)}>
            <Text
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: '0.5px',
                whiteSpace: 'nowrap'
              }}
            >
              D1 Leadership AI Deep Dive
            </Text>
          </div>
          <div style={getSwipeStyle('right', 100)}>
            <Text
              style={{
                fontSize: '14px',
                color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
                textAlign: 'center',
                fontStyle: 'italic'
              }}
            >
              Interactive Presentation Experience
            </Text>
          </div>
          <div style={getSwipeStyle('left', 200)}>
            <Text
              style={{
                fontSize: '16px',
                fontWeight: 400,
                color: '#ffffff',
                textAlign: 'center',
                marginTop: '16px'
              }}
            >
              by Brett Hofer - Sr. Global Director
            </Text>
          </div>
          <div style={getSwipeStyle('right', 300)}>
            <Text
              style={{
                fontSize: '14px',
                fontWeight: 300,
                color: 'var(--dt-colors-text-neutral-subdued, #b4b4be)',
                textAlign: 'center'
              }}
            >
              Enterprise Solutions & Architecture
            </Text>
          </div>
        </Flex>

        {/* Password Form */}
        <form onSubmit={handleSubmit} autoComplete="off">
          <Flex flexDirection="column" gap={16}>
            <div style={getSwipeStyle('left', 400)}>
              <Text
                style={{
                  fontSize: '14px',
                  color: 'var(--dt-colors-text-neutral-default, #f0f0f5)',
                  textAlign: 'center',
                  fontWeight: 500
                }}
              >
                Enter Presentation Password
              </Text>
            </div>

            <div style={getSwipeStyle('right', 500)}>
              <input
                id="password-input"
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                autoFocus
                autoComplete="off"
                name="presentation-access-code"
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  textAlign: 'center',
                  background: 'rgba(45, 48, 73, 0.8)',
                  border: error ? '2px solid #ee3d48' : '1px solid rgba(108, 93, 211, 0.3)',
                  borderRadius: '8px',
                  color: '#f0f0f5',
                  padding: '0 16px',
                  WebkitTextSecurity: 'disc'
                } as React.CSSProperties}
              />
            </div>

            {error && (
              <div style={getSwipeStyle('left', 600)}>
                <Text
                  style={{
                    fontSize: '13px',
                    color: '#ee3d48',
                    textAlign: 'center'
                  }}
                >
                  Incorrect password. Please try again.
                </Text>
              </div>
            )}

            <div style={getSwipeStyle('left', 600)}>
              <Button
                type="submit"
                variant="emphasized"
                style={{
                  width: '100%',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 600,
                  borderRadius: '8px'
                }}
              >
                Proceed
              </Button>
            </div>
          </Flex>
        </form>

        {/* Footer hint */}
        <div style={getSwipeStyle('right', 700)}>
          <Text
            style={{
              fontSize: '11px',
              color: 'rgba(180, 180, 190, 0.5)',
              textAlign: 'center',
              marginTop: '24px',
              fontStyle: 'italic'
            }}
          >
            Password is case-sensitive
          </Text>
        </div>
      </Flex>
      </div>
    </Flex>
  );
};

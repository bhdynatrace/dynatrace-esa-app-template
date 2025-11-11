/**
 * HeartMonitor Component
 * Animated EKG/ECG heart monitor display for CCO DynaPulse
 * Only appears on the pulseboard topic
 */

import React, { useEffect, useRef, useState } from 'react';

export const HeartMonitor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastDisruptionRef = useRef<number>(Date.now());

  // Typing animation state
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  // Customer signal metrics state
  const [signalDirections, setSignalDirections] = useState({
    dps: Math.random() > 0.5,
    mail: Math.random() > 0.5,
    chat: Math.random() > 0.5,
    ticket: Math.random() > 0.5
  });

  // Example prompts to cycle through
  const prompts = [
    "Hey DynaPulse, what's the latest you have on Academy Sports?",
    "Can you email me full DynaPulse reports on Academy, United and Best Buy?",
    "What is the latest chatter on American Airlines?",
    "Do we have any solutions for Volumetric Trending?"
  ];

  // Typing animation effect
  useEffect(() => {
    let currentPromptIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    let typingTimeout: NodeJS.Timeout;

    const typeText = () => {
      const currentPrompt = prompts[currentPromptIndex];

      if (!isDeleting) {
        // Typing forward
        if (currentCharIndex < currentPrompt.length) {
          setTypedText(currentPrompt.substring(0, currentCharIndex + 1));
          currentCharIndex++;
          // Variable typing speed (50-150ms per character)
          const delay = 50 + Math.random() * 100;
          typingTimeout = setTimeout(typeText, delay);
        } else {
          // Finished typing, pause before deleting
          typingTimeout = setTimeout(() => {
            isDeleting = true;
            typeText();
          }, 3000); // Pause 3 seconds at end
        }
      } else {
        // Deleting backward
        if (currentCharIndex > 0) {
          currentCharIndex--;
          setTypedText(currentPrompt.substring(0, currentCharIndex));
          // Faster deletion
          typingTimeout = setTimeout(typeText, 30);
        } else {
          // Finished deleting, move to next prompt
          isDeleting = false;
          currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
          // Pause before typing next prompt
          typingTimeout = setTimeout(typeText, 1000);
        }
      }
    };

    // Start typing animation
    typingTimeout = setTimeout(typeText, 1000);

    return () => {
      clearTimeout(typingTimeout);
    };
  }, []);

  // Cursor blink animation
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530); // Blink every 530ms

    return () => clearInterval(cursorInterval);
  }, []);

  // Random signal direction updates
  useEffect(() => {
    const updateSignals = () => {
      setSignalDirections({
        dps: Math.random() > 0.5,
        mail: Math.random() > 0.5,
        chat: Math.random() > 0.5,
        ticket: Math.random() > 0.5
      });
    };

    // Update every 3-7 seconds
    const randomInterval = 3000 + Math.random() * 4000;
    const intervalId = setInterval(updateSignals, randomInterval);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.width;
    const height = canvas.height;

    // Normal ECG wave data points
    const normalWaveform = [
      0.5, 0.5, 0.5, 0.5, 0.5, // baseline
      0.48, // small P wave dip
      0.52, // small P wave peak
      0.5, 0.5, 0.5, // baseline
      0.48, // Q wave
      0.85, // R wave peak (QRS complex)
      0.35, // S wave
      0.5, 0.5, // baseline
      0.53, // T wave peak
      0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5 // baseline
    ];

    // Disrupted/irregular heartbeat pattern
    const disruptedWaveform = [
      0.5, 0.5, 0.5,
      0.45, // irregular P wave
      0.55,
      0.5, 0.48,
      0.42, // deeper Q wave
      0.92, // MUCH higher R wave (irregular)
      0.28, // deeper S wave
      0.5, 0.52, 0.48, 0.52, // erratic baseline
      0.58, // taller T wave
      0.48, 0.52, 0.48, 0.5, 0.5, 0.5
    ];

    let offset = 0;
    const speed = 2;
    const normalWidth = normalWaveform.length * 8;
    const disruptedWidth = disruptedWaveform.length * 8;
    let currentWaveform = normalWaveform;
    let waveformWidth = normalWidth;
    let isDisrupted = false;

    const draw = () => {
      const now = Date.now();

      // Randomly trigger disruption every 8-15 seconds
      if (!isDisrupted && now - lastDisruptionRef.current > 8000 + Math.random() * 7000) {
        isDisrupted = true;
        currentWaveform = disruptedWaveform;
        waveformWidth = disruptedWidth;
        lastDisruptionRef.current = now;

        // Return to normal after 2-3 heartbeats
        setTimeout(() => {
          isDisrupted = false;
          currentWaveform = normalWaveform;
          waveformWidth = normalWidth;
        }, 2000 + Math.random() * 1000);
      }

      // Clear canvas with fade effect (trail)
      ctx.fillStyle = 'rgba(10, 20, 15, 0.15)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid lines
      ctx.strokeStyle = 'rgba(0, 255, 100, 0.1)';
      ctx.lineWidth = 1;

      // Vertical grid lines
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw ECG waveform (change color to red during disruption)
      ctx.strokeStyle = isDisrupted ? '#ff3333' : '#00ff66';
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = isDisrupted ? '#ff3333' : '#00ff66';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      let started = false;

      // Draw multiple cycles of the waveform across the screen
      for (let cycle = -1; cycle < Math.ceil(width / waveformWidth) + 1; cycle++) {
        for (let i = 0; i < currentWaveform.length; i++) {
          const x = (cycle * waveformWidth) + (i * 8) - offset;

          // Only draw points that are visible on screen
          if (x < -10 || x > width + 10) continue;

          const y = height * currentWaveform[i];

          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      ctx.stroke();

      // Update offset for animation
      offset += speed;
      if (offset > waveformWidth) {
        offset = 0;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '128px',
        marginBottom: '32px',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.6), inset 0 -2px 4px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 255, 100, 0.3)',
        border: '2px solid rgba(0, 255, 100, 0.4)',
        background: 'linear-gradient(135deg, #0a140f 0%, #0f1a15 50%, #0a140f 100%)',
        position: 'relative'
      }}
    >
      {/* Beveled edge effect */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '10px',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 -1px 0 rgba(0, 0, 0, 0.5)',
          pointerEvents: 'none'
        }}
      />

      {/* PulseBoard Typing Prompt */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 255, 100, 0.3)',
          fontFamily: 'monospace',
          fontSize: '13px'
        }}
      >
        <span style={{ color: '#00ff66', fontWeight: 'bold', marginRight: '8px' }}>
          DynaPulse:&gt;
        </span>
        <span style={{ color: '#ffffff' }}>
          {typedText}
        </span>
        <span
          style={{
            color: '#00ff66',
            marginLeft: '2px',
            opacity: showCursor ? 1 : 0,
            transition: 'opacity 0.1s'
          }}
        >
          ▊
        </span>
      </div>

      {/* Status indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 255, 100, 0.3)'
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#00ff66',
            boxShadow: '0 0 8px #00ff66',
            animation: 'pulse 2s ease-in-out infinite'
          }}
        />
        <span style={{ color: '#00ff66', fontSize: '12px', fontFamily: 'monospace', textTransform: 'uppercase' }}>
          CCO Signals Active
        </span>
      </div>

      {/* Customer Signal Metrics */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(0, 0, 0, 0.6)',
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(0, 255, 100, 0.3)'
        }}
      >
        {/* DPS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#00ff66', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>
            DPS:
          </span>
          <span style={{ color: signalDirections.dps ? '#32c832' : '#ff3333', fontSize: '14px' }}>
            {signalDirections.dps ? '▲' : '▼'}
          </span>
        </div>

        {/* Mail */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px' }}>✉</span>
          <span style={{ color: signalDirections.mail ? '#32c832' : '#ff3333', fontSize: '14px' }}>
            {signalDirections.mail ? '▲' : '▼'}
          </span>
        </div>

        {/* Chat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px' }}>💬</span>
          <span style={{ color: signalDirections.chat ? '#32c832' : '#ff3333', fontSize: '14px' }}>
            {signalDirections.chat ? '▲' : '▼'}
          </span>
        </div>

        {/* Ticket */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '14px' }}>🎫</span>
          <span style={{ color: signalDirections.ticket ? '#32c832' : '#ff3333', fontSize: '14px' }}>
            {signalDirections.ticket ? '▲' : '▼'}
          </span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={1200}
        height={128}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
};

import React, { useState, useEffect, useCallback, useRef } from 'react';

const SpacePiano = () => {
  const [audioContext, setAudioContext] = useState(null);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [particles, setParticles] = useState([]);
  const particleId = useRef(0);
  const audioInitialized = useRef(false);

  // Initialize audio context on first user interaction
  const initializeAudio = () => {
    if (!audioInitialized.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      setAudioContext(ctx);
      audioInitialized.current = true;
    }
  };

  // Note frequencies setup (same as before)
  const noteFrequencies = useRef({});
  useEffect(() => {
    const baseFrequencies = {
      'C': 16.35, 'C#': 17.32, 'D': 18.35, 'D#': 19.45,
      'E': 20.60, 'F': 21.83, 'F#': 23.12, 'G': 24.50,
      'G#': 25.96, 'A': 27.50, 'A#': 29.14, 'B': 30.87,
    };

    Object.entries(baseFrequencies).forEach(([note, freq]) => {
      for (let octave = 0; octave <= 8; octave++) {
        noteFrequencies.current[`${note}${octave}`] = freq * Math.pow(2, octave);
      }
    });
  }, []);

  // Particle effects (same as before)
  const createParticles = useCallback((x, y) => {
    const newParticles = Array.from({ length: 10 }, () => ({
      id: particleId.current++,
      x, y,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 4 - 2,
      life: 1,
      color: `hsl(${Math.random() * 60 + 180}, 100%, 70%)`,
    }));
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  useEffect(() => {
    let animationFrame;
    const updateParticles = () => {
      setParticles(prev =>
        prev
          .map(p => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.1,
            life: p.life - 0.02,
          }))
          .filter(p => p.life > 0)
      );
      animationFrame = requestAnimationFrame(updateParticles);
    };
    animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Audio handlers (same as before)
  const playNote = useCallback((note, x, y) => {
    if (!audioContext) {
      initializeAudio();
      return;
    }

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(noteFrequencies.current[note], audioContext.currentTime);

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.1);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    setActiveNotes(prev => new Set([...prev, note]));
    createParticles(x, y);

    return { oscillator, gainNode };
  }, [audioContext, createParticles]);

  const stopNote = useCallback((note, nodes) => {
    if (!nodes || !audioContext) return;
    const { oscillator, gainNode } = nodes;

    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.1);
    setTimeout(() => oscillator.stop(), 100);
    setActiveNotes(prev => {
      const next = new Set([...prev]);
      next.delete(note);
      return next;
    });
  }, [audioContext]);

  // Generate piano keys
  const pianoKeys = [];
  for (let octave = 0; octave <= 8; octave++) {
    [
      { note: 'C', color: 'white' },
      { note: 'C#', color: 'black' },
      { note: 'D', color: 'white' },
      { note: 'D#', color: 'black' },
      { note: 'E', color: 'white' },
      { note: 'F', color: 'white' },
      { note: 'F#', color: 'black' },
      { note: 'G', color: 'white' },
      { note: 'G#', color: 'black' },
      { note: 'A', color: 'white' },
      { note: 'A#', color: 'black' },
      { note: 'B', color: 'white' },
    ].forEach(({ note, color }) => {
      pianoKeys.push({ note: `${note}${octave}`, color });
    });
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        alignItems: 'center',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          position: 'relative',
          margin: '0 auto',
          minWidth: 'max-content'
        }}>
          {/* Particles SVG */}
          <svg
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              width: '100%',
              height: '100%'
            }}
          >
            {particles.map(particle => (
              <circle
                key={particle.id}
                cx={particle.x}
                cy={particle.y}
                r={2}
                fill={particle.color}
                opacity={particle.life}
              />
            ))}
          </svg>

          {/* Piano Keys */}
          {pianoKeys.map(({ note, color }) => {
            const isActive = activeNotes.has(note);
            const isBlack = color === 'black';

            return (
              <div
                key={note}
                onMouseDown={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const nodes = playNote(note, rect.x + rect.width / 2, rect.y);
                  const handleMouseUp = () => {
                    stopNote(note, nodes);
                    window.removeEventListener('mouseup', handleMouseUp);
                  };
                  window.addEventListener('mouseup', handleMouseUp);
                }}
                style={{
                  width: isBlack ? '30px' : '45px',
                  height: isBlack ? '120px' : '180px',
                  backgroundColor: isBlack ? '#1a1a3a' : '#fff',
                  marginLeft: isBlack ? '-15px' : '0',
                  marginRight: isBlack ? '-15px' : '0',
                  zIndex: isBlack ? 1 : 0,
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderRadius: '0 0 4px 4px',
                  border: '1px solid rgba(0,0,0,0.2)',
                  background: isBlack
                    ? 'linear-gradient(180deg, #1a1a3a 0%, #000000 100%)'
                    : 'linear-gradient(180deg, #ffffff 0%, #f0f0f0 100%)',
                  boxShadow: isActive
                    ? `0 0 20px ${isBlack ? '#4299e1' : '#63b3ed'},
                       0 0 40px ${isBlack ? '#4299e1' : '#63b3ed'}`
                    : isBlack
                      ? '0 0 4px rgba(0,0,0,0.3)'
                      : '0 2px 4px rgba(0,0,0,0.1)',
                  opacity: isActive ? 0.8 : 1
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpacePiano;
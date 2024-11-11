import React, { useEffect, useState } from 'react';

const SpaceTunnel = () => {
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0.2);
  const [isControlOpen, setIsControlOpen] = useState(false);

  useEffect(() => {
    let animationId;
    const animate = () => {
      setProgress(prev => (prev + speed * 0.005) % 1);
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [speed]);

  const getLEDColor = (stripIndex, progress) => {
    const hue = ((stripIndex / 15) * 360 + progress * 360) % 360;
    const mappedHue = 180 + (hue % 120);
    return `hsl(${mappedHue}, 100%, 50%)`; // Increased saturation and brightness
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#000',
      overflow: 'hidden'
    }}>
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 50,
      }}>
        <button
          onClick={() => setIsControlOpen(!isControlOpen)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Controls
        </button>

        {isControlOpen && (
          <div style={{
            marginTop: '0.5rem',
            padding: '1rem',
            backgroundColor: 'rgba(26, 26, 26, 0.9)',
            borderRadius: '0.25rem',
            color: 'white'
          }}>
            <label>
              Speed: {speed.toFixed(1)}x
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                style={{
                  width: '100%',
                  marginTop: '0.5rem'
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Tunnel */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        perspective: '1000px'
      }}>
        <div style={{
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: 'translateZ(0)'
        }}>
          {Array.from({ length: 15 }).map((_, index) => {
            const depth = index / 14;
            const z = -depth * 1000;
            const scale = 1 - depth * 0.6;
            const color = getLEDColor(index, progress);

            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '90vmin',
                  height: '90vmin',
                  transform: `translate(-50%, -50%) translateZ(${z}px) scale(${scale})`,
                  border: '3px solid',
                  borderColor: color,
                  boxShadow: `0 0 20px 10px ${color}`,
                  opacity: 1 - depth * 0.3,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SpaceTunnel;
import React, { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ExpandingControlsProps {
  speed: number
  hueOffset: number
  onSpeedChange: (speed: number) => void
  onHueOffsetChange: (hueOffset: number) => void
}

export function ExpandingControls({
  speed,
  hueOffset,
  onSpeedChange,
  onHueOffsetChange,
}: ExpandingControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (controlsRef.current && !controlsRef.current.contains(event.target as Node)) {
        setIsExpanded(false)
      }
    }

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isExpanded])

  return (
    <motion.div
      ref={controlsRef}
      className="relative group"
      initial={false}
      animate={{
        width: isExpanded ? 250 : 'auto',
        height: isExpanded ? 'auto' : 48,
        borderRadius: isExpanded ? 10 : 9999,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      style={{
        overflow: "hidden",
      }}
    >
      {/* Base glass effect layer */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md" style={{ borderRadius: "inherit" }} />

      {/* Static inner glow effect */}
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-30"
        style={{ 
          borderRadius: "inherit",
          background: "radial-gradient(circle at center, hsl(180, 100%, 50%), transparent 100%)"
        }}
      />

      {/* Glass edge highlights and shadows */}
      <div className="absolute inset-0 shadow-inner" style={{ borderRadius: "inherit" }} />
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-white/5" style={{ borderRadius: "inherit" }} />
      <div className="absolute inset-0 border border-white/20" style={{ borderRadius: "inherit" }} />

      {/* Button that remains visible and handles expansion */}
      <motion.button
        className="relative w-full h-full flex items-center justify-center text-white/90 font-bold tracking-wider"
        onClick={() => setIsExpanded(!isExpanded)}
        animate={{
          opacity: isExpanded ? 0 : 1,
          y: isExpanded ? -20 : 0,
        }}
        style={{
          position: isExpanded ? "absolute" : "relative",
          inset: 0,
          textShadow: "0 0 10px hsl(180, 100%, 50%), 0 0 20px hsla(180, 100%, 50%, 0.4)",
        }}
      >
        Controls
      </motion.button>

      {/* Controls Panel */}
      <motion.div
        animate={{
          opacity: isExpanded ? 1 : 0,
          y: isExpanded ? 0 : 20,
        }}
        style={{
          padding: "1.5rem",
          visibility: isExpanded ? "visible" : "hidden",
          position: "relative",
        }}
      >
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-white/90">
            Speed: {speed.toFixed(1)}x
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              value={speed}
              onChange={(e) => onSpeedChange(Number(e.target.value))}
              className="w-full h-2 mt-2 rounded-full appearance-none bg-white/10 cursor-pointer"
              style={{
                WebkitAppearance: "none",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90">
            Color: {hueOffset}°
            <input
              type="range"
              min="0"
              max="360"
              step="1"
              value={hueOffset}
              onChange={(e) => onHueOffsetChange(Number(e.target.value))}
              className="w-full h-2 mt-2 rounded-full appearance-none bg-white/10 cursor-pointer"
              style={{
                WebkitAppearance: "none",
                background: "rgba(255, 255, 255, 0.1)",
              }}
            />
          </label>
        </div>
      </motion.div>
    </motion.div>
  )
} 
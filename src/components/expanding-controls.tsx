import React, { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface ExpandingControlsProps {
  speed: number
  hueOffset: number
  onSpeedChange: (speed: number) => void
  onHueOffsetChange: (hueOffset: number) => void
  accentColor?: string
}

export function ExpandingControls({
  speed,
  hueOffset,
  onSpeedChange,
  onHueOffsetChange,
  accentColor,
}: ExpandingControlsProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const controlsRef = useRef<HTMLDivElement>(null)
  const accent = accentColor ?? "hsl(180, 100%, 50%)"

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

  const containerStyle: React.CSSProperties = {
    overflow: "hidden",
    padding: isExpanded ? "1rem 1.25rem 0.75rem" : 0,
    background: isExpanded ? "rgba(5, 12, 32, 0.65)" : "transparent",
    backdropFilter: isExpanded ? "blur(16px)" : "none",
    border: `1px solid ${isExpanded ? "rgba(255, 255, 255, 0.2)" : "transparent"}`,
    boxShadow: isExpanded ? `0 0 22px ${accent}33` : "none",
    transition: "all 0.35s ease",
  }

  return (
    <motion.div
      ref={controlsRef}
      className="relative flex flex-col items-center"
      initial={false}
      animate={{
        width: isExpanded ? 260 : 'auto',
        borderRadius: isExpanded ? 12 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
      style={containerStyle}
    >
      <motion.span
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            setIsExpanded((prev) => !prev)
          }
        }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        animate={{
          opacity: isExpanded ? 0.85 : 1,
          y: isExpanded ? -2 : 0,
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0.25rem 0.6rem",
          fontSize: "0.85rem",
          fontWeight: 600,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "rgba(255, 255, 255, 0.92)",
          cursor: "pointer",
          textAlign: "center",
          lineHeight: 1,
          textShadow: `0 0 12px ${accent}, 0 0 30px ${accent}66`,
          filter: `drop-shadow(0 0 18px ${accent}55)`,
          outline: "none",
          marginBottom: isExpanded ? "0.75rem" : 0,
        }}
      >
        Controls
      </motion.span>

      {/* Controls Panel */}
      <motion.div
        animate={{
          opacity: isExpanded ? 1 : 0,
          y: isExpanded ? 0 : 20,
        }}
        style={{
          padding: isExpanded ? "0 0 0.25rem" : 0,
          visibility: isExpanded ? "visible" : "hidden",
          position: "relative",
          width: "100%",
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

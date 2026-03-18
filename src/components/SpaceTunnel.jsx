import React, { useEffect, useState, useCallback, useMemo, useRef } from "react"
import styles from "./SpaceTunnel.module.css"
import { MarkdownContent } from "./markdown-content"
import { motion, AnimatePresence } from "framer-motion"
import { ExpandingControls } from "./expanding-controls"

const RING_COUNT = 15

// Pre-calculate colors for better performance
const calculateLEDColors = (progress, hueOffset) => {
  return Array.from({ length: RING_COUNT }).map((_, stripIndex) => {
    const hue = ((stripIndex / RING_COUNT) * 360 + progress * 360) % 360
    const mappedHue = hueOffset + (hue % 120)
    return `hsl(${mappedHue}, 100%, 50%)`
  });
}

const SpaceTunnel = ({ onZoomChange }) => {
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0.2)
  const [hueOffset, setHueOffset] = useState(180)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [markdownContent, setMarkdownContent] = useState("")
  const targetProgressRef = useRef(0)
  const smoothedProgressRef = useRef(0)

  useEffect(() => {
    fetch('/content/bebop-description.md')
      .then(response => response.text())
      .then(text => setMarkdownContent(text))
      .catch(error => console.error('Error loading markdown content:', error))
  }, [])

  // Call onZoomChange whenever isZoomedIn changes
  useEffect(() => {
    if (onZoomChange) {
      onZoomChange(isZoomedIn)
    }
  }, [isZoomedIn, onZoomChange])

  // Memoize LED colors calculation with progress
  const ledColors = useMemo(() => calculateLEDColors(progress, hueOffset), [hueOffset, progress])
  const accentColor = ledColors[0]

  const ringLayout = useMemo(() => {
    return Array.from({ length: RING_COUNT }).map((_, index) => {
      const depth = index / (RING_COUNT - 1)
      return {
        z: -depth * 1000,
        scale: 1 - depth * 0.6
      }
    })
  }, [])

  // Debounced mouse movement handler
  const handleMouseMove = useCallback((e) => {
    requestAnimationFrame(() => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = (e.clientY / window.innerHeight) * 2 - 1
      setMousePosition({ x, y })
    })
  }, [])

  // Optimized mouse tracking
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Optimized animation frame effect with smoothing
  useEffect(() => {
    if (isZoomedIn) return

    let lastTime = performance.now()
    let animationId

    const animate = (currentTime) => {
      let deltaTime = currentTime - lastTime
      lastTime = currentTime
      deltaTime = Math.min(deltaTime, 32)

      // Advance the target progress
      const target = (targetProgressRef.current + speed * deltaTime * 0.001) % 1
      targetProgressRef.current = target

      // Smoothly follow the target to avoid abrupt jumps
      const smoothingStrength = 1 - Math.pow(0.15, deltaTime / 16.67)
      let current = smoothedProgressRef.current
      let diff = target - current

      if (diff > 0.5) diff -= 1
      if (diff < -0.5) diff += 1

      const next = (current + diff * smoothingStrength + 1) % 1
      smoothedProgressRef.current = next

      setProgress(next)

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [speed, isZoomedIn])

  // Memoized rotation calculation
  const rotation = useMemo(() => {
    const maxRotation = 10
    return {
      rotateX: -mousePosition.y * maxRotation,
      rotateY: mousePosition.x * maxRotation
    }
  }, [mousePosition.x, mousePosition.y])

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Controls - Only visible when not zoomed in */}
      <AnimatePresence>
        {!isZoomedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 50,
            }}
          >
            <ExpandingControls
              speed={speed}
              hueOffset={hueOffset}
              onSpeedChange={setSpeed}
              onHueOffsetChange={setHueOffset}
              accentColor={accentColor}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tunnel */}
      <motion.div
        style={{
          position: "relative",
          width: "min(80vh, 80vw)",
          height: "min(80vh, 80vw)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: "1000px",
          transformStyle: "preserve-3d",
          perspectiveOrigin: "50% 50%",
          willChange: "transform",
        }}
        animate={{
          scale: isZoomedIn ? 10 : 1,
          opacity: isZoomedIn ? 0 : 1,
          filter: `blur(${isZoomedIn ? 8 : 0}px)`,
          z: isZoomedIn ? 500 : 0,
          rotateX: rotation.rotateX,
          rotateY: rotation.rotateY,
        }}
        transition={{
          duration: 0.8,
          scale: {
            type: "spring",
            damping: 25,
            stiffness: 100,
          },
          opacity: { duration: 0.6 },
          filter: { duration: 0.6 },
          z: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
          },
          rotateX: { duration: 0.2, ease: "linear" },
          rotateY: { duration: 0.2, ease: "linear" }
        }}
      >
        <div 
          className={styles.tunnelContainer}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
            willChange: "transform",
          }}
        >
          {ringLayout.map(({ z, scale }, index) => {
            const color = ledColors[index]

            return (
              <motion.div
                key={index}
                style={{
                  position: "absolute",
                  inset: 0,
                  margin: "auto",
                  width: "100%",
                  height: "100%",
                  transform: `translate3d(0, 0, ${z}px) scale3d(${scale}, ${scale}, 1)`,
                  border: "5px solid transparent",
                  willChange: "transform, border-color, box-shadow",
                }}
                animate={{
                  borderColor: color,
                  boxShadow: `0 0 25px 15px ${color}`,
                }}
                transition={{
                  duration: 0.25,
                  ease: "linear",
                }}
              />
            )
          })}
        </div>
      </motion.div>

      {/* Glass Button positioned in the center - Now outside the tunnel container */}
      <AnimatePresence mode="wait">
        {!isZoomedIn && (
          <motion.div
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.1, // Quick fade in/out
              delay: isZoomedIn ? 0 : 0.8 // Only delay when fading in after zoom out
            }}
          >
            <motion.span
              role="button"
              tabIndex={0}
              onClick={() => setIsZoomedIn(true)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  setIsZoomedIn(true)
                }
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0.3rem 0.6rem",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.92)",
                cursor: "pointer",
                textAlign: "center",
                lineHeight: 1,
                textShadow: `0 0 12px ${accentColor}, 0 0 30px ${accentColor}66`,
                outline: "none",
                filter: `drop-shadow(0 0 18px ${accentColor}55)`
              }}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
            >
              Enter
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Markdown Content */}
      <AnimatePresence>
        {isZoomedIn && (
          <motion.div
            className="absolute inset-0 z-20"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{
              duration: 0.5,
              ease: [0.4, 0, 0.2, 1],
              scale: {
                type: "spring",
                damping: 20,
                stiffness: 100
              }
            }}
          >
            <MarkdownContent 
              content={markdownContent} 
              onZoomOut={() => setIsZoomedIn(false)} 
              accentColor={accentColor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpaceTunnel

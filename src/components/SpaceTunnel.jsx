import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import styles from "./SpaceTunnel.module.css"
import { GlassButton } from "./glass-button.tsx"
import { MarkdownContent } from "./markdown-content.tsx"
import { motion, AnimatePresence } from "framer-motion"
import { ExpandingControls } from "./expanding-controls.tsx"

// Pre-calculate colors for better performance
const calculateLEDColors = (stripCount, hueOffset) => {
  const colors = new Array(stripCount).fill(0).map((_, stripIndex) => {
    const baseHue = ((stripIndex / stripCount) * 360) % 360
    const mappedHue = hueOffset + (baseHue % 120)
    return `hsl(${mappedHue}, 100%, 50%)`
  })
  return colors
}

const SpaceTunnel = () => {
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0.2)
  const [hueOffset, setHueOffset] = useState(180)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [markdownContent] = useState(`Welcome to the Space Tunnel project! This interactive visualization combines sleek design with cutting-edge web technologies to create an immersive experience. The project features a dynamic color-changing tunnel effect, interactive glass button with cursor-following reflections, and smooth zoom transitions between views. Built with React, Next.js, Tailwind CSS, and Framer Motion for animations. Feel free to explore the code and experiment with the effects!`)

  // Memoize LED colors calculation
  const ledColors = useMemo(() => calculateLEDColors(15, hueOffset), [hueOffset])

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

  // Optimized animation frame effect
  useEffect(() => {
    if (isZoomedIn) return

    let lastTime = performance.now()
    let animationId

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime
      lastTime = currentTime

      setProgress((prev) => {
        const next = (prev + (speed * deltaTime * 0.001)) % 1
        return Number.isFinite(next) ? next : prev
      })

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
          {Array.from({ length: 15 }).map((_, index) => {
            const depth = index / 14
            const z = -depth * 1000
            const scale = 1 - depth * 0.6
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
                  border: "5px solid",
                  borderColor: color,
                  boxShadow: `0 0 25px 15px ${color}`,
                  willChange: "transform",
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
              zIndex: 10 
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.1, // Quick fade in/out
              delay: isZoomedIn ? 0 : 0.8 // Only delay when fading in after zoom out
            }}
          >
            <GlassButton 
              text="Enter Space" 
              accentColor={ledColors[0]}
              onClick={() => setIsZoomedIn(true)} 
            />
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
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SpaceTunnel


import { useEffect, useState } from "react"
import styles from "./SpaceTunnel.module.css"
import { GlassButton } from "./glass-button.tsx"
import { MarkdownContent } from "./markdown-content.tsx"
import { motion, AnimatePresence } from "framer-motion"

const SpaceTunnel = () => {
  const [progress, setProgress] = useState(0)
  const [speed, setSpeed] = useState(0.2)
  const [hueOffset, setHueOffset] = useState(180)
  const [isControlOpen, setIsControlOpen] = useState(false)
  const [isZoomedIn, setIsZoomedIn] = useState(false)
  const [markdownContent] = useState(`# Space Tunnel Project

Welcome to the Space Tunnel project! This interactive visualization combines sleek design with cutting-edge web technologies to create an immersive experience.

## Key Features

- Dynamic color-changing tunnel effect
- Interactive glass button with cursor-following reflections
- Smooth zoom transitions between views

## Technologies Used

- React
- Next.js
- Tailwind CSS
- Framer Motion (for animations)

## Learn More

- [React Documentation](https://reactjs.org/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion/)

Feel free to explore the code and experiment with the effects!`)

  useEffect(() => {
    if (isZoomedIn) return // Stop animation when zoomed in
    
    let animationId
    const animate = () => {
      setProgress((prev) => (prev + speed * 0.005) % 1)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [speed, isZoomedIn])

  const getLEDColor = (stripIndex, progress) => {
    const hue = ((stripIndex / 15) * 360 + progress * 360) % 360
    const mappedHue = hueOffset + (hue % 120)
    return `hsl(${mappedHue}, 100%, 50%)`
  }

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
              top: "1rem",
              right: "1rem",
              zIndex: 50,
            }}
          >
            <button
              onClick={() => setIsControlOpen(!isControlOpen)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#1a1a1a",
                color: "white",
                border: "none",
                borderRadius: "0.25rem",
                cursor: "pointer",
              }}
            >
              Controls
            </button>

            {isControlOpen && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "1rem",
                  backgroundColor: "rgba(26, 26, 26, 0.9)",
                  borderRadius: "0.25rem",
                  color: "white",
                  minWidth: "200px",
                }}
              >
                <div style={{ marginBottom: "1rem" }}>
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
                        width: "100%",
                        marginTop: "0.5rem",
                      }}
                    />
                  </label>
                </div>

                <div>
                  <label>
                    Color: {hueOffset}°
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={hueOffset}
                      onChange={(e) => setHueOffset(Number(e.target.value))}
                      style={{
                        width: "100%",
                        marginTop: "0.5rem",
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
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
        }}
        animate={{
          scale: isZoomedIn ? 10 : 1,
          opacity: isZoomedIn ? 0 : 1,
          filter: `blur(${isZoomedIn ? 8 : 0}px)`,
          z: isZoomedIn ? 500 : 0,
        }}
        transition={{
          duration: 0.8,
          scale: {
            type: "spring",
            damping: 25,
            stiffness: 100,
          },
          opacity: {
            duration: 0.6,
            ease: "easeOut"
          },
          filter: {
            duration: 0.6,
            ease: "easeOut"
          },
          z: {
            duration: 0.8,
            ease: [0.4, 0, 0.2, 1]
          }
        }}
      >
        <div 
          className={styles.tunnelContainer}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            transformStyle: "preserve-3d",
          }}
        >
          {Array.from({ length: 15 }).map((_, index) => {
            const depth = index / 14
            const z = -depth * 1000
            const scale = 1 - depth * 0.6
            const color = getLEDColor(index, progress)

            return (
              <motion.div
                key={index}
                style={{
                  position: "absolute",
                  inset: 0,
                  margin: "auto",
                  width: "100%",
                  height: "100%",
                  transform: `translateZ(${z}px) scale(${scale})`,
                  border: "5px solid",
                  borderColor: color,
                  boxShadow: `0 0 25px 15px ${color}`,
                  opacity: 1 - depth * 0.3,
                  transformStyle: "preserve-3d",
                }}
                animate={{
                  scale: isZoomedIn ? scale * 1.2 : scale,
                  z: isZoomedIn ? z * 1.5 : z,
                }}
                transition={{
                  duration: 0.8,
                  ease: [0.4, 0, 0.2, 1]
                }}
              />
            )
          })}
        </div>

        {/* Glass Button positioned in the center */}
        <motion.div 
          style={{ 
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10 
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: isZoomedIn ? 0 : 1 }}
          transition={{ duration: 0.1 }}
        >
          <GlassButton 
            text="Enter Space" 
            accentColor={getLEDColor(0, progress)}
            onClick={() => setIsZoomedIn(true)} 
          />
        </motion.div>
      </motion.div>

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


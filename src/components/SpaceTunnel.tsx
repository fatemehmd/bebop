"use client"

import React, { useEffect, useState } from "react"
import styles from "./SpaceTunnel.module.css"
import { GlassButton } from "./glass-button"

interface SpaceTunnelProps {}

export const SpaceTunnel: React.FC<SpaceTunnelProps> = () => {
  const [progress, setProgress] = useState<number>(0)
  const [speed, setSpeed] = useState<number>(0.2)
  const [hueOffset, setHueOffset] = useState<number>(180)
  const [isControlOpen, setIsControlOpen] = useState<boolean>(false)

  useEffect(() => {
    let animationId: number
    const animate = (): void => {
      setProgress((prev: number) => (prev + speed * 0.005) % 1)
      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [speed])

  const getLEDColor = (stripIndex: number, progress: number): string => {
    const hue: number = ((stripIndex / 15) * 360 + progress * 360) % 360
    const mappedHue: number = hueOffset + (hue % 120)
    return `hsl(${mappedHue}, 100%, 50%)`
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      {/* Controls */}
      <div
        style={{
          position: "absolute",
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setSpeed(Number(e.target.value))
                  }
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    setHueOffset(Number(e.target.value))
                  }
                  style={{
                    width: "100%",
                    marginTop: "0.5rem",
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Tunnel */}
      <div
        style={{
          position: "absolute",
          inset: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          perspective: "1000px",
        }}
      >
        <div className={styles.tunnelContainer}>
          {Array.from({ length: 15 }).map((_, index) => {
            const depth: number = index / 14
            const z: number = -depth * 1000
            const scale: number = 1 - depth * 0.6
            const color: string = getLEDColor(index, progress)

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: "100%",
                  height: "100%",
                  transform: `translate(-50%, -50%) translateZ(${z}px) scale(${scale})`,
                  border: "5px solid",
                  borderColor: color,
                  boxShadow: `0 0 25px 15px ${color}`,
                  opacity: 1 - depth * 0.3,
                }}
              />
            )
          })}
        </div>

        {/* Glass Button positioned in the center */}
        <div style={{ position: "absolute", zIndex: 10 }}>
          <GlassButton 
            text="Enter Space" 
            accentColor={getLEDColor(0, progress)}
            onClick={() => setSpeed((prev: number) => prev < 1.5 ? prev + 0.5 : 0.2)} 
          />
        </div>
      </div>
    </div>
  )
}


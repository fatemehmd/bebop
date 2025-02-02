"use client"

import React, { useState, useEffect, useCallback } from "react"

/**
 * GlassButton Component Props
 * @property text - Button text content
 * @property accentColor - Color used for button glow and reflections
 * @property onClick - Click handler function
 */
interface GlassButtonProps {
  text?: string
  accentColor?: string
  onClick?: () => void
}

/**
 * GlassButton Component
 * Creates a translucent button with dynamic reflections that follow the cursor
 */
export const GlassButton = ({ text = "Enter", accentColor = "hsl(180, 100%, 50%)", onClick }: GlassButtonProps) => {
  // Track mouse position for reflection effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Update mouse position on move
  const handleMouseMove = useCallback((e: MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }, [])

  // Set up mouse tracking
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [handleMouseMove])

  // Calculate reflection position based on cursor location
  const getReflectionPosition = () => {
    const x = (mousePosition.x / window.innerWidth) * 100
    const y = (mousePosition.y / window.innerHeight) * 100
    return `${x}% ${y}%`
  }

  return (
    <button
      onClick={onClick}
      className="group relative px-16 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 overflow-hidden"
    >
      {/* Base glass effect layer */}
      <div className="absolute inset-0 rounded-full bg-white/5 backdrop-blur-md" />

      {/* Dynamic reflection layer that follows cursor */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at ${getReflectionPosition()}, ${accentColor}40, transparent 15%)`,
        }}
      />

      {/* Static inner glow effect */}
      <div
        className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30"
        style={{
          background: `radial-gradient(circle at center, ${accentColor}, transparent 100%)`,
        }}
      />

      {/* Glass edge highlights and shadows */}
      <div className="absolute inset-0 rounded-full shadow-inner" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-white/5" />
      <div className="absolute inset-0 rounded-full border border-white/20" />

      {/* Button text with glow effect */}
      <span
        className="relative font-bold tracking-wider text-white/90"
        style={{
          textShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}40`,
        }}
      >
        {text}
      </span>
    </button>
  )
} 
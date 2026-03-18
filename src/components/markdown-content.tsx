import React, { FC } from 'react'
import Markdown from 'markdown-to-jsx'
import { motion } from 'framer-motion'

interface MarkdownContentProps {
  content: string
  onZoomOut: () => void
  accentColor?: string
}

/**
 * MarkdownContent Component
 * Displays markdown content with space-themed styling and a zoom out button
 */
export const MarkdownContent: FC<MarkdownContentProps> = ({ content, onZoomOut, accentColor }) => {
  const accent = accentColor ?? "hsl(180, 100%, 50%)"

  return (
    <div className="relative w-full h-full bg-black text-white p-8 overflow-auto">
      {/* Zoom out button */}
      <div className="absolute top-4 right-4 z-10">
        <motion.button
          type="button"
          onClick={onZoomOut}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="uppercase tracking-[0.25em] font-semibold text-white/90"
          style={{
            padding: "0.25rem 0.75rem",
            letterSpacing: "0.25em",
            color: "rgba(255, 255, 255, 0.9)",
            textShadow: `0 0 12px ${accent}, 0 0 30px ${accent}66`,
            filter: `drop-shadow(0 0 18px ${accent}55)`,
          }}
        >
          Zoom Out
        </motion.button>
      </div>

      {/* Markdown content */}
      <div className="mx-auto max-w-[700px] w-full pt-32">
        <div className="prose prose-invert prose-pre:bg-white/5 prose-pre:backdrop-blur-md max-w-none font-mono text-[15px] leading-relaxed">
          <Markdown>{content}</Markdown>
        </div>
      </div>
    </div>
  )
}

export default MarkdownContent 

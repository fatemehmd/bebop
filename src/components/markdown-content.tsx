import React, { FC } from 'react'
import Markdown from 'markdown-to-jsx'
import { GlassButton } from './glass-button.tsx'

interface MarkdownContentProps {
  content: string
  onZoomOut: () => void
}

/**
 * MarkdownContent Component
 * Displays markdown content with space-themed styling and a zoom out button
 */
export const MarkdownContent: FC<MarkdownContentProps> = ({ content, onZoomOut }) => {
  return (
    <div className="relative w-full h-full bg-black text-white p-8 overflow-auto">
      {/* Zoom out button */}
      <div className="absolute top-4 right-4 z-10">
        <GlassButton text="Zoom Out" onClick={onZoomOut} accentColor="hsl(180, 100%, 50%)" />
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
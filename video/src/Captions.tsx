import React from 'react'
import { interpolate, useCurrentFrame } from 'remotion'
import { SubtitleCue } from './scenes'

export const Captions: React.FC<{ subtitles: SubtitleCue[] }> = ({ subtitles }) => {
  const frame = useCurrentFrame()

  const activeCue = subtitles.find(
    (cue) => frame >= cue.startFrame && frame < cue.endFrame
  )

  if (!activeCue) {
    return null
  }

  // Subtle fade in
  const opacity = interpolate(
    frame,
    [activeCue.startFrame, activeCue.startFrame + 5, activeCue.endFrame - 5, activeCue.endFrame],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  )

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 50,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: '0 80px',
        zIndex: 50,
        opacity
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.88)',
          color: '#ffffff',
          padding: '14px 28px',
          borderRadius: 12,
          fontSize: 26,
          fontWeight: 600,
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          maxWidth: 1400,
          lineHeight: 1.4
        }}
      >
        {activeCue.text}
      </div>
    </div>
  )
}

import React from 'react'
import {
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile
} from 'remotion'
import { SceneConfig } from './scenes'
import { Captions } from './Captions'

export const Scene: React.FC<{ scene: SceneConfig }> = ({ scene }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // Spring animation for card entry
  const entranceProgress = spring({
    frame,
    fps,
    config: {
      damping: 14,
      mass: 0.8,
      stiffness: 90
    }
  })

  const opacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateRight: 'clamp'
  })

  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: scene.bgGradient,
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Top Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '40px 80px 20px 80px',
          zIndex: 10,
          opacity
        }}
      >
        <div>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#38bdf8',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 8
            }}
          >
            {scene.category}
          </div>
          <h1
            style={{
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0
            }}
          >
            {scene.title}
          </h1>
        </div>

        {scene.badge && (
          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38bdf8',
              color: '#38bdf8',
              padding: '10px 20px',
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}
          >
            {scene.badge}
          </div>
        )}
      </div>

      {/* Main Content Body */}
      <div
        style={{
          flex: 1,
          padding: '20px 80px 140px 80px',
          display: 'flex',
          gap: 40,
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          opacity
        }}
      >
        {/* Real Screenshot / Media if available */}
        {scene.mediaFile && (
          <div
            style={{
              flex: 1.2,
              height: '100%',
              maxHeight: 620,
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
              border: '2px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Img
              src={staticFile(scene.mediaFile)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
            />
          </div>
        )}

        {/* Bullet Points / Context Card */}
        {scene.bulletPoints && (
          <div
            style={{
              flex: scene.mediaFile ? 0.8 : 1,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              borderRadius: 20,
              padding: '36px 40px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4)',
              transform: `translateY(${(1 - entranceProgress) * 30}px)`
            }}
          >
            <div
              style={{
                fontSize: 20,
                color: '#cbd5e1',
                lineHeight: 1.6,
                marginBottom: 24
              }}
            >
              {scene.caption}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {scene.bulletPoints.map((point, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    fontSize: 20,
                    color: '#f8fafc',
                    lineHeight: 1.5
                  }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: '#38bdf8',
                      marginTop: 9,
                      flexShrink: 0
                    }}
                  />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Narration Captions at Bottom */}
      <Captions subtitles={scene.subtitles} />
    </div>
  )
}

import React from 'react'
import { Composition } from 'remotion'
import { WalkthroughComposition } from './Composition'
import { TOTAL_DURATION_IN_FRAMES, FPS } from './scenes'

export const Root: React.FC = () => {
  return (
    <>
      <Composition
        id="Walkthrough"
        component={WalkthroughComposition}
        durationInFrames={TOTAL_DURATION_IN_FRAMES}
        fps={FPS}
        width={1920}
        height={1080}
      />
    </>
  )
}

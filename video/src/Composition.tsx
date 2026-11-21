import React from 'react'
import { Series, Audio, staticFile } from 'remotion'
import { SCENES } from './scenes'
import { Scene } from './Scene'

export const WalkthroughComposition: React.FC = () => {
  return (
    <>
      <Series>
        {SCENES.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.durationInFrames}
          >
            <Scene scene={scene} />
            <Audio src={staticFile(`audio_${scene.id}.mp3`)} />
          </Series.Sequence>
        ))}
      </Series>
    </>
  )
}

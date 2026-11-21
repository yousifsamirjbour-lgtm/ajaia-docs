# Ajaia Docs Walkthrough Video (Remotion)

This directory contains the complete Remotion programmatic video project that generates the official product walkthrough video (`deliverables/walkthrough.mp4`).

## Video Specifications
- **Resolution**: 1920x1080 (Full HD, 16:9)
- **Frame Rate**: 30 frames per second
- **Total Duration**: 6,750 frames = 225 seconds = 3 minutes 45 seconds (within the required 3:30–4:30 range)
- **Format**: H.264 MP4 (`--codec=h264`)
- **Audio Track**: Includes a high-clarity **synthetic voiceover** (generated using `edge-tts` with the `en-US-AndrewNeural` voice) synchronized across all 10 scenes
- **Captions**: Frame-accurate synchronized subtitle overlay matching the spoken narration word-for-word

---

## Voiceover Audio

The video is rendered with an integrated **synthetic voiceover** by default:
- **TTS Engine**: `edge-tts` (open-source, trusted PyPI package, zero account/API keys required)
- **Voice Selected**: `en-US-AndrewNeural` (clear, articulate, natural presenter voice)
- **Per-Scene Synchronization**: Each scene sequence in `video/src/Composition.tsx` mounts `<Audio src={staticFile(`audio_${scene.id}.mp3`)} />`, guaranteeing that each scene's spoken audio starts at the exact beginning of that scene and never drifts or bleeds across scene boundaries.
- **Attribution & Transparency**: As instructed in the guidelines, this track is explicitly labeled as a **synthetic voiceover**.

If you wish to replace this with your own human voice recording:
1. Record your voiceover matching the scene timings in [narration.md](file:///C:/Users/Al-Qema/ajaia-docs-submission/video/narration.md).
2. Save your scene audio files in `video/public/` (or a single `voiceover.mp3`).
3. Run `npm run build` to re-render.

---

## Directory Structure

```text
video/
├── public/                 # Static assets embedded in the video
│   ├── audio_intro.mp3     # Synthetic voiceover per scene
│   ├── audio_main-flow.mp3
│   ├── audio_persistence.mp3
│   ├── audio_sharing.mp3
│   ├── audio_import.mp3
│   ├── audio_architecture.mp3
│   ├── audio_tradeoffs.mp3
│   ├── audio_ai-workflow.mp3
│   ├── audio_self-review.mp3
│   ├── audio_next-steps.mp3
│   ├── screenshot_01_editor_overview.png
│   ├── screenshot_02_rich_formatting.png
│   ├── screenshot_03_autosave_indicator.png
│   ├── screenshot_04_share_modal.png
│   ├── screenshot_05_shared_with_me.png
│   ├── screenshot_06_import_modal.png
│   ├── screenshot_07_invalid_import_error.png
│   └── screenshot_08_access_denied.png
├── src/
│   ├── Captions.tsx        # Synchronized subtitle cue renderer with smooth fade
│   ├── Composition.tsx     # Sequential composition series with audio integration
│   ├── Root.tsx            # Remotion root registration
│   ├── Scene.tsx           # Individual scene layout with spring animations
│   ├── index.ts            # Entrypoint
│   └── scenes.ts           # Central scene configuration and subtitle timestamps
├── narration.md            # Timed script and transcript for all scenes
└── package.json            # Remotion CLI and rendering scripts
```

---

## Interactive Preview & Studio

To open the interactive Remotion Studio in your browser:

```bash
cd video
npm run start
# Or directly:
npx remotion preview src/index.ts
```

This launches the Remotion web UI at `http://localhost:3000`, allowing frame-by-frame scrubbing, layer inspection, and live parameter tuning.

---

## Rendering the Video

To re-render the final production video to `deliverables/walkthrough.mp4`:

```bash
cd video
npm run build
# Or directly:
npx remotion render src/index.ts Walkthrough ../deliverables/walkthrough.mp4 --codec=h264
```

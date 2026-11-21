# Ajaia Docs Walkthrough Video (Remotion)

This directory contains the complete Remotion programmatic video project that generates the official product walkthrough video (`deliverables/walkthrough.mp4`).

## Video Specifications
- **Resolution**: 1920x1080 (Full HD, 16:9)
- **Frame Rate**: 30 frames per second
- **Total Duration**: 6,750 frames = 225 seconds = 3 minutes 45 seconds (within the required 3:30–4:30 range)
- **Format**: H.264 MP4 (`--codec=h264`)
- **Captions**: Standard synchronized caption overlay for all scenes

---

## Structure

```text
video/
├── public/                 # Static assets embedded in the video
│   ├── screenshot_01_editor_overview.png
│   ├── screenshot_02_rich_formatting.png
│   ├── screenshot_03_autosave_indicator.png
│   ├── screenshot_04_share_modal.png
│   ├── screenshot_05_shared_with_me.png
│   ├── screenshot_06_import_modal.png
│   ├── screenshot_07_invalid_import_error.png
│   ├── screenshot_08_access_denied.png
│   └── recordings/         # Raw browser recordings captured during Playwright demo
├── src/
│   ├── Captions.tsx        # Synchronized subtitle cue renderer with smooth fade
│   ├── Composition.tsx     # Sequential composition series
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

---

## Adding or Swapping Voiceover Audio

The video is configured with synchronous captions by default. If you wish to provide a spoken narration audio track:

1. Record or generate your voiceover matching the scene timings in [narration.md](file:///C:/Users/Al-Qema/ajaia-docs-submission/video/narration.md).
2. Save the audio file as `video/public/voiceover.mp3` or `video/public/voiceover.wav`.
3. In `video/src/Composition.tsx`, uncomment the `<Audio src={staticFile('voiceover.mp3')} />` tag.
4. Run `npm run build` to re-render.

*Note: If synthetic text-to-speech audio is used, label it "synthetic voiceover" in presentation notes as specified in project guidelines.*

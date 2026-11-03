# Gestu Reverse AI

An immersive React and Three.js experiment for controlling a real-time 3D particle system with hand gestures. The project is being delivered in independent, verifiable phases.

## Current status: Phase 2 — AI Hand Tracking

The Phase 1 particle engine remains intact and the current build now adds:

- Camera activation only after an explicit user action.
- MediaPipe Hand Landmarker detection for up to two hands.
- 21 normalized landmarks and 21 world landmarks per detected hand.
- Left/right handedness and an approximate palm center for Phase 3.
- A mirrored 640 × 480 preview with a Canvas 2D skeleton overlay.
- GPU initialization with automatic CPU fallback.
- Camera, model, tracking, no-hands, and error states.
- Stream interruption handling and complete track/model cleanup.
- Detection capped at 30 FPS without processing the same video frame twice.
- High-frequency tracking data stored in a ref instead of React state.

Gesture classification and particle control are intentionally outside Phase 2.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- A modern browser with WebGL support
- Camera access requires HTTPS or `localhost`

## Local development

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Testing the camera

1. Open the app in Chrome or Safari on macOS.
2. Select **Enable Camera** and approve the browser permission prompt.
3. Place one hand in frame and confirm that 21 points, connections, and a handedness label follow it.
4. Add a second hand and confirm that both skeletons are visible with different colors.
5. Move both hands out of frame and confirm the **No Hands Detected** state.
6. Select **Disable Camera** and confirm that the browser camera indicator turns off.

Physical camera and one/two-hand detection must be validated manually because they require a real camera and browser permission.

## Verification

```bash
npm run lint
npm run build
```

## Architecture

```text
src/
├── components/
│   ├── CameraPreview.tsx        Camera panel and explicit controls
│   ├── HandLandmarkOverlay.tsx Canvas 2D hand skeleton rendering
│   ├── HandTrackingStatus.tsx  Model and tracking status
│   └── ParticleScene.tsx       Particle lifecycle and performance overlay
├── engine/
│   ├── ParticleEngine.ts       Three.js renderer and animation orchestration
│   ├── ParticleFormations.ts   Reusable particle target generation
│   └── ParticlePhysics.ts      Spring/damping simulation
├── hooks/
│   └── useHandTracking.ts      Camera and inference lifecycle
├── services/
│   └── handTrackingService.ts  MediaPipe initialization and result mapping
├── types/
│   ├── handTracking.ts         Phase 3-ready tracking contracts
│   └── particles.ts            Interaction and performance contracts
├── utils/
│   └── landmarkUtils.ts        Palm and relative-distance geometry
├── App.tsx
└── App.css
```

The MediaPipe module is loaded lazily only after camera permission is granted. Inference results update a mutable ref every processed frame; React state changes only when the tracking status, hand count, or handedness changes.

## Interaction contract

`useHandTracking()` exposes a `latestFrameRef` containing normalized landmarks, world landmarks, handedness, palm position, hand count, and the last detection timestamp. Phase 3 can consume this data without coupling gesture recognition to camera or rendering code.

## MediaPipe assets

- Package: `@mediapipe/tasks-vision` version `1.2.0` (pinned).
- Official model source: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`
- Model SHA-256: `fbc2a30080c3c557093b5ddfc334698132eb341044ccee322ccf8bcf3607cde1`
- Runtime model: `public/models/hand_landmarker.task`
- Runtime WASM: copied from the installed package into `public/mediapipe/wasm/`.

The checked-in model and WASM files allow the tracking runtime to load without a CDN. Installing dependencies still requires registry access. Video frames are processed in the browser and are not recorded, stored, or sent to an application server.

## Dependencies

- `react` / `react-dom`: interface and lifecycle.
- `three`: WebGL rendering, buffers, shaders, and camera math.
- `@mediapipe/tasks-vision`: on-device hand landmark inference.
- Vite, TypeScript, and ESLint: development, compilation, and static checks.

## Roadmap

1. **Particle Engine** — complete.
2. **Hand Tracking** — current phase.
3. **Gesture Recognition** — robust landmark geometry, smoothing, and hysteresis.
4. **Advanced Visual Effects** — galaxy, heart, spiral, wave, burst, and implosion.
5. **UI/UX Dashboard** — controls, preview, gesture state, and demo mode.
6. **Testing & Optimization** — cross-browser validation, profiling, and security review.

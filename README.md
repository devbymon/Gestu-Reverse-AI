# Gestu Reverse AI

An immersive React and Three.js experiment for controlling a real-time 3D particle system with hand gestures. The project is being delivered in independent, verifiable phases.

## Current status: Phase 3 — Gesture Recognition & Particle Interaction

The particle engine and hand-tracking system remain intact. Phase 3 adds:

- Orientation- and scale-aware finger classification using joint angles and relative distances.
- Closed Fist, Open Palm, Index Point, Peace Sign, Pinch, Hand Swipe, and Two-Hand Expansion.
- Exponential landmark smoothing, three-frame confirmation, pinch hysteresis, and swipe cooldown.
- A decoupled `GestureCommand` contract between computer vision and Three.js.
- Compact sphere, controlled expansion, vortex, wave, implosion, and directional impulse effects.
- A live gesture panel showing effect, interaction intensity, candidate, and stabilization state.
- Immediate reset when hand tracking is lost, while the ambient particle animation continues.
- Synthetic unit tests for classification, scale invariance, transitions, swipe, cooldown, and tracking loss.

Advanced Phase 4 formations and the full Phase 5 dashboard are intentionally not included.

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
6. Exercise each gesture listed below and verify that the gesture label stabilizes before the effect changes.
7. Swipe once, verify the directional impulse, and confirm it does not repeatedly fire during cooldown.
8. Select **Disable Camera** and confirm that the browser camera indicator turns off.

Physical camera and one/two-hand detection must be validated manually because they require a real camera and browser permission.

## Verification

```bash
npm run lint
npm run build
npm test
```

## Architecture

```text
src/
├── components/
│   ├── CameraPreview.tsx        Camera panel and explicit controls
│   ├── GestureIndicator.tsx     Stable gesture and active-effect display
│   ├── GestureDebugPanel.tsx    Candidate and interaction diagnostics
│   ├── HandLandmarkOverlay.tsx Canvas 2D hand skeleton rendering
│   ├── HandTrackingStatus.tsx  Model and tracking status
│   └── ParticleScene.tsx       Particle lifecycle and performance overlay
├── engine/
│   ├── ParticleEngine.ts       Three.js renderer and animation orchestration
│   ├── ParticleFormations.ts   Reusable particle target generation
│   └── ParticlePhysics.ts      Spring/damping simulation
├── hooks/
│   ├── useGestureRecognition.ts Gesture controller bridge and UI throttling
│   └── useHandTracking.ts       Camera and inference lifecycle
├── services/
│   ├── gestureController.ts     Temporal classification and command generation
│   └── handTrackingService.ts   MediaPipe initialization and result mapping
├── types/
│   ├── gestures.ts              Gesture, command, and UI contracts
│   ├── handTracking.ts          Tracking contracts
│   └── particles.ts            Interaction and performance contracts
├── utils/
│   ├── gestureGeometry.ts       Angles, hand scale, finger and pinch geometry
│   ├── gestureRecognition.ts    Pure single-hand classification
│   ├── gestureSmoothing.ts      Landmark smoothing and gesture stabilization
│   └── landmarkUtils.ts         Palm and relative-distance geometry
├── App.tsx
└── App.css
```

The MediaPipe module is loaded lazily only after camera permission is granted. Inference results update a mutable ref every processed frame; React state changes only when the tracking status, hand count, or handedness changes.

## Gestures and particle actions

| Gesture | Action |
| --- | --- |
| Closed Fist | Compact rotating sphere |
| Open Palm | Controlled radial expansion |
| Index Point | Hand-positioned vortex |
| Peace Sign | Animated 3D particle wave |
| Pinch | Continuous implosion toward the hand |
| Hand Swipe | One-shot directional velocity impulse |
| Two-Hand Expansion | High-energy expansion controlled by palm distance |

`GestureCommand` contains only gesture, intensity, normalized position/direction, and timestamp. The particle engine never imports MediaPipe types and consumes commands independently from the 30 FPS inference cadence.

Priority is Two-Hand Expansion → Swipe → Pinch → Peace → Index Point → Open Palm → Closed Fist → Unknown. Swipe is a transient event; all other gestures are continuous and stabilized before activation.

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
- `vitest`: TypeScript unit tests for deterministic gesture logic.
- Vite, TypeScript, and ESLint: development, compilation, and static checks.

## Roadmap

1. **Particle Engine** — complete.
2. **Hand Tracking** — complete.
3. **Gesture Recognition** — current phase.
4. **Advanced Visual Effects** — galaxy, heart, spiral, wave, burst, and implosion.
5. **UI/UX Dashboard** — controls, preview, gesture state, and demo mode.
6. **Testing & Optimization** — cross-browser validation, profiling, and security review.

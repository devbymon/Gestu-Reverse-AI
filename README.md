# Gestu Reverse AI

An immersive React and Three.js experiment for controlling a real-time 3D particle system with hand gestures. The project is being delivered in independent, verifiable phases.

## Current status: Phase 5 — Futuristic UI/UX Dashboard

The particle engine, hand tracking, gesture recognition, and advanced effects remain intact. Phase 5 adds:

- A responsive creative-technology workspace with a particle-first viewport, control sidebar, header, and live status bar.
- Explicit AI Gesture and Manual modes with a single command source active at a time.
- Real controls for all eight existing formations, particle count, size, animation speed, sensitivity, and palettes.
- Camera preview and landmark visibility controls that do not stop the underlying tracking session.
- Live measured FPS, particle count, renderer state, camera state, and MediaPipe state.
- First-use onboarding, a reusable gesture guide, fullscreen support, and an in-app presentation mode.
- Keyboard focus states, accessible labels, reduced decorative motion, and desktop/tablet/mobile layouts.
- No additional runtime dependencies and no automatic camera activation.

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
8. Use **Manual Mode** to select each of the eight effects, including Burst and Implosion.
9. Change effects rapidly and confirm each transition starts from the currently visible positions.
10. Select **Reset**, then **AI Gesture** to return priority to camera gestures.
11. Select **Disable Camera** and confirm that the browser camera indicator turns off.

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
│   ├── ParticleScene.tsx       Particle lifecycle and performance bridge
│   ├── controls/               Formation, mode, palette, and particle controls
│   ├── help/                   Reopenable gesture and usage guide
│   ├── layout/                 Header, sidebar, viewport overlay, and status bar
│   ├── onboarding/             First-use camera/manual choice
│   └── presentation/           Essential presentation-mode actions
├── engine/
│   ├── EffectPresets.ts         Visual and transition configurations
│   ├── FormationRegistry.ts     Extensible formation lookup
│   ├── FormationTransition.ts   Interruptible eased interpolation
│   ├── ParticleEngine.ts        Three.js rendering and effect orchestration
│   ├── ParticleForces.ts        Bounded procedural forces
│   ├── ParticleFormations.ts    Deterministic startup distribution
│   └── ParticlePhysics.ts       Spring/damping simulation
├── formations/
│   ├── SphereFormation.ts       Volumetric Fibonacci sphere
│   ├── GalaxyFormation.ts       Four-arm 3D galaxy
│   ├── HeartFormation.ts        Parametric volumetric heart
│   ├── SpiralFormation.ts       Configurable helix
│   ├── WaveFormation.ts         Dynamic sine/cosine field
│   ├── BurstFormation.ts        Radial supernova targets
│   ├── ImplosionFormation.ts    Stable point attraction
│   └── VortexFormation.ts       Three-dimensional funnel
├── hooks/
│   ├── useGestureRecognition.ts Gesture controller bridge and UI throttling
│   ├── useParticleEffects.ts    Manual/gesture priority and effect commands
│   ├── useHandTracking.ts       Camera and inference lifecycle
│   ├── useDashboardState.ts     UI settings and visibility
│   └── usePresentationMode.ts   Fullscreen and presentation state
├── services/
│   ├── gestureController.ts     Temporal classification and command generation
│   └── handTrackingService.ts   MediaPipe initialization and result mapping
├── types/
│   ├── gestures.ts              Gesture, command, and UI contracts
│   ├── handTracking.ts          Tracking contracts
│   ├── particleEffects.ts       Formations, presets, and engine commands
│   └── particles.ts            Interaction and performance contracts
├── utils/
│   ├── coordinateMapping.ts     Normalized camera-to-world mapping
│   ├── easing.ts                Clamped transition curves
│   ├── gestureGeometry.ts       Angles, hand scale, finger and pinch geometry
│   ├── gestureRecognition.ts    Pure single-hand classification
│   ├── gestureSmoothing.ts      Landmark smoothing and gesture stabilization
│   └── landmarkUtils.ts         Palm and relative-distance geometry
├── styles/                      Tokens, dashboard, and responsive rules
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

`GestureCommand` remains independent from MediaPipe. `useParticleEffects()` maps it into a generic `ParticleEffectCommand`, which is the only interaction contract consumed by the renderer. The manual source has explicit priority while Manual Mode is active; selecting **AI Gesture** restores the gesture source.

Priority is Two-Hand Expansion → Swipe → Pinch → Peace → Index Point → Open Palm → Closed Fist → Unknown. Swipe is a transient event; all other gestures are continuous and stabilized before activation.

## Formation mathematics

- **Sphere:** Fibonacci directions with cube-root radial sampling for volumetric density.
- **Galaxy:** four logarithmic-style arms, deterministic jitter, dense core, and vertical depth.
- **Heart:** the classic parametric heart curve with deterministic radial fill and Z thickness.
- **Spiral/Vortex:** helical equations with progressive radius, height, and orbital force.
- **Wave:** organized grid with animated sine/cosine displacement and per-particle variation.
- **Burst:** deterministic spherical directions combined with a one-shot radial velocity impulse.
- **Implosion:** bounded attraction targets around a movable hand-controlled center.

Transitions snapshot the current particle positions once, interpolate toward stable destination buffers with cubic easing, and can be interrupted without resetting geometry. Dynamic formations update their reused destination buffer only when needed.

## Dashboard controls and command priority

The application starts in gesture-priority mode without requesting camera access. Selecting any preset enables manual priority, so camera gestures cannot compete with the selected effect. **Reset** restores default particle settings and the resting sphere while preserving the user's explicit camera state; **AI Gesture** returns authority to recognized gestures. Supernova Burst is a temporary action and returns to the previous persistent formation. Expensive particle-count changes are applied only after the slider interaction completes.

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
3. **Gesture Recognition** — complete.
4. **Advanced Visual Effects** — complete.
5. **UI/UX Dashboard** — complete.
6. **Testing & Optimization** — cross-browser validation, profiling, and security review.

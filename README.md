# Gestu Reverse AI

An immersive React and Three.js experiment for controlling a real-time 3D particle system with hand gestures. The project is being delivered in independent, verifiable phases.

## Current status: Phase 4 — Advanced Visual Effects & Particle Physics

The particle engine, hand tracking, and gesture recognition remain intact. Phase 4 adds:

- Eight procedural formations: Sphere, Galaxy, Heart, Spiral, Wave, Energy Burst, Implosion, and Vortex.
- Interruptible, eased transitions captured from current visual particle positions.
- Lightweight radial, directional, orbital, repulsion, spring, and damping forces.
- Effect-specific palettes, particle sizes, rotation, glow energy, heart beat, and sphere pulse.
- Consistent mirrored hand-to-world coordinate mapping with finite input validation.
- A manual demo mode that works without camera access and explicitly overrides gesture commands.
- Reusable presets and a registry that supports adding formations without changing the renderer.
- WebGL context-loss handling and the existing one-way adaptive quality fallback.
- Automated validation for all formations, transitions, easing, forces, mapping, and gestures.

The full Phase 5 dashboard is intentionally not included; Phase 4 provides only compact demo controls.

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
8. Use **Demo Mode** to select each of the eight effects, including Burst and Implosion.
9. Change effects rapidly and confirm each transition starts from the currently visible positions.
10. Select **Reset Sphere**, then **Gesture Control** to return priority to camera gestures.
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
│   ├── DemoControls.tsx         Minimal no-camera effect selection
│   ├── GestureIndicator.tsx     Stable gesture and active-effect display
│   ├── GestureDebugPanel.tsx    Candidate and interaction diagnostics
│   ├── HandLandmarkOverlay.tsx Canvas 2D hand skeleton rendering
│   ├── HandTrackingStatus.tsx  Model and tracking status
│   └── ParticleScene.tsx       Particle lifecycle and performance overlay
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
│   └── useHandTracking.ts       Camera and inference lifecycle
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

`GestureCommand` remains independent from MediaPipe. `useParticleEffects()` maps it into a generic `ParticleEffectCommand`, which is the only interaction contract consumed by the renderer. The manual source has explicit priority while Demo Mode is active; selecting **Gesture Control** restores the gesture source.

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

## Manual demo mode

The application starts in gesture-priority mode. Selecting any preset enables manual priority, so camera gestures cannot compete with the selected effect. **Reset Sphere** restores the resting formation while keeping manual control; **Gesture Control** returns authority to recognized gestures. The camera is optional for all manual effects.

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
4. **Advanced Visual Effects** — current phase.
5. **UI/UX Dashboard** — controls, preview, gesture state, and demo mode.
6. **Testing & Optimization** — cross-browser validation, profiling, and security review.

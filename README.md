# Gestu Reverse AI

An immersive React and Three.js experiment for controlling a real-time 3D particle system with hand gestures. The project is being delivered in independent, verifiable phases.

## Current status: Phase 1 — Particle Engine

The current build includes:

- 10,000 particles arranged on an even Fibonacci sphere.
- Custom GLSL point sprites with a soft core and additive glow.
- Cyan, electric-blue, and violet particle palette.
- Frame-rate-independent spring physics for smooth formation transitions.
- Ambient rotation, pulse, camera parallax, and micro-turbulence.
- Automatic balanced mode (7,500 particles and reduced pixel ratio) after sustained low performance.
- A typed `ParticleInteraction` input ready for future hand-tracking data.
- Pause/resume when the tab visibility changes.
- Full Three.js geometry, material, renderer, animation-frame, and WebGL context cleanup.
- Responsive interface and live FPS/particle-quality indicators.

Camera access, MediaPipe, gesture classification, and advanced formations are intentionally outside Phase 1.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- A modern browser with WebGL support

## Local development

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Verification

```bash
npm run lint
npm run build
```

## Architecture

```text
src/
├── components/
│   └── ParticleScene.tsx       React lifecycle and performance overlay
├── engine/
│   ├── ParticleEngine.ts       Three.js renderer and animation orchestration
│   ├── ParticleFormations.ts   Reusable particle target generation
│   └── ParticlePhysics.ts      Spring/damping simulation
├── types/
│   └── particles.ts            Interaction and performance contracts
├── App.tsx
└── App.css
```

The render loop lives outside React state. React receives only a performance sample approximately once per second, avoiding component updates on every frame.

## Interaction contract

`ParticleEngine.setInteraction()` accepts normalized position, expansion, and motion energy. Phase 2 and Phase 3 can feed smoothed MediaPipe output into this contract without coupling camera logic to WebGL rendering.

## Dependencies

- `react` / `react-dom`: interface and lifecycle.
- `three`: WebGL rendering, buffers, shaders, and camera math.
- Vite, TypeScript, and ESLint: development, compilation, and static checks.

No camera data is captured or transmitted in the current phase.

## Roadmap

1. **Particle Engine** — current phase.
2. **Hand Tracking** — explicit camera permission and MediaPipe Hand Landmarker.
3. **Gesture Recognition** — robust landmark geometry, smoothing, and hysteresis.
4. **Advanced Visual Effects** — galaxy, heart, spiral, wave, burst, and implosion.
5. **UI/UX Dashboard** — controls, preview, gesture state, and demo mode.
6. **Testing & Optimization** — cross-browser validation, profiling, and security review.

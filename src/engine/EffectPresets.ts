import type { EffectPreset, FormationType } from '../types/particleEffects'

export const EFFECT_PRESETS: readonly EffectPreset[] = [
  {
    id: 'FALCON', name: 'ULACIT Falcon', description: 'Particle falcon resting formation',
    transitionDuration: 0.85, particleSize: 1.95, rotationSpeed: 0.006,
    colors: ['#8b5cf6', '#ffffff', '#ff8a00'],
  },
  {
    id: 'SPHERE', name: 'Cosmic Sphere', description: 'Volumetric resting formation',
    transitionDuration: 0.9, particleSize: 1, rotationSpeed: 0.12,
    colors: ['#00e5ff', '#2563eb', '#a855f7'],
  },
  {
    id: 'GALAXY', name: 'Spiral Galaxy', description: 'Four-arm orbital galaxy',
    transitionDuration: 1.2, particleSize: 0.92, rotationSpeed: 0.2,
    colors: ['#f8fafc', '#00e5ff', '#a855f7'],
  },
  {
    id: 'HEART', name: 'Neon Heart', description: 'Procedural volumetric heart',
    transitionDuration: 1, particleSize: 1.05, rotationSpeed: 0.06,
    colors: ['#a855f7', '#ec4899', '#f8fafc'],
  },
  {
    id: 'SPIRAL', name: 'Energy Helix', description: 'Dynamic three-dimensional helix',
    transitionDuration: 0.85, particleSize: 0.94, rotationSpeed: 0.42,
    colors: ['#00e5ff', '#2563eb', '#a855f7'],
  },
  {
    id: 'WAVE', name: 'Quantum Wave', description: 'Responsive oscillating field',
    transitionDuration: 0.75, particleSize: 0.88, rotationSpeed: 0.04,
    colors: ['#2563eb', '#00e5ff', '#f8fafc'],
  },
  {
    id: 'ENERGY_BURST', name: 'Supernova Burst', description: 'Radial energy explosion',
    transitionDuration: 0.65, particleSize: 1.15, rotationSpeed: 0.08,
    colors: ['#f8fafc', '#00e5ff', '#ec4899'],
  },
  {
    id: 'IMPLOSION', name: 'Gravity Collapse', description: 'Progressive point attraction',
    transitionDuration: 0.7, particleSize: 1.18, rotationSpeed: 0.16,
    colors: ['#ec4899', '#a855f7', '#f8fafc'],
  },
  {
    id: 'VORTEX', name: 'Cosmic Vortex', description: 'Orbital three-dimensional funnel',
    transitionDuration: 0.8, particleSize: 0.96, rotationSpeed: 0.68,
    colors: ['#00e5ff', '#2563eb', '#a855f7'],
  },
] as const

const PRESETS_BY_ID = new Map(EFFECT_PRESETS.map((preset) => [preset.id, preset]))

export function getEffectPreset(type: FormationType): EffectPreset {
  return PRESETS_BY_ID.get(type) ?? EFFECT_PRESETS[1]
}

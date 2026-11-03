export type FormationType =
  | 'SPHERE'
  | 'GALAXY'
  | 'HEART'
  | 'SPIRAL'
  | 'WAVE'
  | 'ENERGY_BURST'
  | 'IMPLOSION'
  | 'VORTEX'

export type EffectSource = 'GESTURE' | 'MANUAL'
export type EffectTrigger = 'BURST' | 'DIRECTIONAL_IMPULSE' | 'RADIAL_PUSH'

export interface EffectVector {
  x: number
  y: number
}

export interface FormationContext {
  count: number
  time: number
  intensity: number
  position: EffectVector
}

export interface ParticleFormation {
  readonly id: FormationType
  readonly dynamic?: boolean
  generate(targets: Float32Array, context: FormationContext): void
  update?(targets: Float32Array, context: FormationContext): void
}

export interface ParticleEffectCommand {
  effect: FormationType
  source: EffectSource
  intensity: number
  position?: EffectVector
  direction?: EffectVector
  trigger?: EffectTrigger
  triggerId: number
  timestamp: number
}

export interface EffectPreset {
  id: FormationType
  name: string
  description: string
  transitionDuration: number
  particleSize: number
  rotationSpeed: number
  colors: readonly string[]
}

export const DEFAULT_EFFECT_COMMAND: ParticleEffectCommand = {
  effect: 'SPHERE',
  source: 'GESTURE',
  intensity: 0,
  triggerId: 0,
  timestamp: 0,
}

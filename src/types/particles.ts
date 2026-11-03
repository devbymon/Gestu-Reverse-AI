export interface ParticleInteraction {
  /** Normalized horizontal hand position, from -1 to 1. */
  x: number
  /** Normalized vertical hand position, from -1 to 1. */
  y: number
  /** Expansion pressure, where 0 is neutral and 1 is fully expanded. */
  expansion: number
  /** Motion intensity, where 0 is still and 1 is a fast movement. */
  energy: number
}

export interface ParticlePerformance {
  fps: number
  particleCount: number
  quality: 'high' | 'balanced'
}

export type ParticlePaletteId = 'COSMIC' | 'PLASMA' | 'AURORA' | 'MONOCHROME' | 'CUSTOM'

export interface ParticleSettings {
  particleCount: number
  particleSize: number
  animationSpeed: number
  interactionSensitivity: number
  palette: ParticlePaletteId
  customColors: [string, string, string]
  revision: number
}

export const DEFAULT_PARTICLE_SETTINGS: ParticleSettings = {
  particleCount: 10_000,
  particleSize: 1,
  animationSpeed: 1,
  interactionSensitivity: 1,
  palette: 'COSMIC',
  customColors: ['#00e5ff', '#2563eb', '#a855f7'],
  revision: 0,
}

export const NEUTRAL_PARTICLE_INTERACTION: ParticleInteraction = {
  x: 0,
  y: 0,
  expansion: 0,
  energy: 0,
}

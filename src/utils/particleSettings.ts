import type { ParticleSettings } from '../types/particles'
import { DEFAULT_PARTICLE_SETTINGS } from '../types/particles'

export function normalizeParticleSettings(settings: ParticleSettings): ParticleSettings {
  return {
    ...settings,
    particleCount: Math.round(Math.min(15_000, Math.max(3_000, settings.particleCount)) / 500) * 500,
    particleSize: Math.min(1.8, Math.max(0.6, settings.particleSize)),
    animationSpeed: Math.min(1.8, Math.max(0.4, settings.animationSpeed)),
    interactionSensitivity: Math.min(1.5, Math.max(0.5, settings.interactionSensitivity)),
  }
}

export function createDefaultParticleSettings(revision = 0): ParticleSettings {
  return { ...DEFAULT_PARTICLE_SETTINGS, revision }
}

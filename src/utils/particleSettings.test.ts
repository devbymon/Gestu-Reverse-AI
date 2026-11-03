import { describe, expect, it } from 'vitest'
import { DEFAULT_PARTICLE_SETTINGS } from '../types/particles'
import { createDefaultParticleSettings, normalizeParticleSettings } from './particleSettings'

describe('particle settings', () => {
  it('clamps unsafe values and rounds particle count to safe increments', () => {
    expect(normalizeParticleSettings({
      ...DEFAULT_PARTICLE_SETTINGS,
      particleCount: 15_249,
      particleSize: 8,
      animationSpeed: 0,
      interactionSensitivity: -1,
    })).toMatchObject({
      particleCount: 15_000,
      particleSize: 1.8,
      animationSpeed: 0.4,
      interactionSensitivity: 0.5,
    })
  })

  it('creates an independent default configuration with the requested revision', () => {
    const settings = createDefaultParticleSettings(4)
    expect(settings).toEqual({ ...DEFAULT_PARTICLE_SETTINGS, revision: 4 })
    expect(settings).not.toBe(DEFAULT_PARTICLE_SETTINGS)
  })

  it('keeps valid custom colors and replaces invalid values safely', () => {
    const settings = normalizeParticleSettings({
      ...DEFAULT_PARTICLE_SETTINGS,
      palette: 'CUSTOM',
      customColors: ['#123456', 'invalid', '#abcdef'],
    })
    expect(settings.customColors).toEqual(['#123456', '#2563eb', '#abcdef'])
  })
})

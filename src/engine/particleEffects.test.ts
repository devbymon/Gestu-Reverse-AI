import { describe, expect, it } from 'vitest'
import { FormationRegistry } from './FormationRegistry'
import { FormationTransition } from './FormationTransition'
import {
  applyDirectionalImpulse,
  applyOrbitalForce,
  applyRadialImpulse,
  applyRepulsion,
  limitVelocities,
} from './ParticleForces'
import type { FormationContext, FormationType } from '../types/particleEffects'
import { normalizedHandToWorld } from '../utils/coordinateMapping'
import { easeInOutCubic, smoothstep } from '../utils/easing'

const FORMATIONS: FormationType[] = [
  'FALCON',
  'SPHERE',
  'GALAXY',
  'HEART',
  'SPIRAL',
  'WAVE',
  'ENERGY_BURST',
  'IMPLOSION',
  'VORTEX',
]

function context(count: number, intensity = 0.7): FormationContext {
  return { count, time: 1.25, intensity, position: { x: 0.3, y: -0.2 } }
}

describe('procedural formations', () => {
  const registry = new FormationRegistry()

  it.each(FORMATIONS)('%s generates the correct number of finite coordinates', (formation) => {
    const targets = new Float32Array(128 * 3)
    registry.generate(formation, targets, context(128))
    expect(targets).toHaveLength(384)
    expect(Array.from(targets).every(Number.isFinite)).toBe(true)
  })

  it.each(FORMATIONS)('%s is deterministic for the same inputs', (formation) => {
    const first = new Float32Array(96 * 3)
    const second = new Float32Array(96 * 3)
    registry.generate(formation, first, context(96))
    registry.generate(formation, second, context(96))
    expect(second).toEqual(first)
  })

  it('produces distinct falcon, sphere, galaxy, and heart geometry', () => {
    const falcon = new Float32Array(64 * 3)
    const sphere = new Float32Array(64 * 3)
    const galaxy = new Float32Array(64 * 3)
    const heart = new Float32Array(64 * 3)
    registry.generate('FALCON', falcon, context(64))
    registry.generate('SPHERE', sphere, context(64))
    registry.generate('GALAXY', galaxy, context(64))
    registry.generate('HEART', heart, context(64))
    expect(falcon).not.toEqual(sphere)
    expect(galaxy).not.toEqual(sphere)
    expect(heart).not.toEqual(galaxy)
  })

  it('keeps extreme finite parameters numerically safe', () => {
    for (const intensity of [-10, 10]) {
      const targets = new Float32Array(32 * 3)
      registry.generate('IMPLOSION', targets, context(32, intensity))
      expect(Array.from(targets).every(Number.isFinite)).toBe(true)
    }
  })
})

describe('formation transitions', () => {
  it('eases from a captured start and reaches the target', () => {
    const transition = new FormationTransition()
    const start = new Float32Array([0, 0, 0, 2, 2, 2])
    const target = new Float32Array([10, 10, 10, 6, 6, 6])
    const output = new Float32Array(6)
    transition.begin(start, target, 1, 0)
    transition.update(output, 0.5)
    expect(output[0]).toBeCloseTo(5)
    transition.update(output, 1)
    expect(output).toEqual(target)
    expect(transition.isActive).toBe(false)
  })

  it('can be interrupted from the current visual positions', () => {
    const transition = new FormationTransition()
    const output = new Float32Array(3)
    transition.begin(new Float32Array([0, 0, 0]), new Float32Array([10, 10, 10]), 1, 0)
    transition.update(output, 0.4)
    const interruptedAt = output.slice()
    transition.begin(interruptedAt, new Float32Array([-5, -5, -5]), 1, 0.4)
    transition.update(output, 0.4)
    expect(output).toEqual(interruptedAt)
    transition.update(output, 1.4)
    expect(output).toEqual(new Float32Array([-5, -5, -5]))
  })

  it('clamps easing outside the valid range', () => {
    expect(smoothstep(-2)).toBe(0)
    expect(smoothstep(2)).toBe(1)
    expect(easeInOutCubic(0.5)).toBe(0.5)
  })
})

describe('particle forces and mapping', () => {
  it('keeps combined forces finite and velocity-limited', () => {
    const positions = new Float32Array([0, 0, 0, 1, 0.5, -1, -0.5, 1, 0.2])
    const velocities = new Float32Array(positions.length)
    applyRadialImpulse(positions, velocities, { x: 0, y: 0 }, 0.2)
    applyDirectionalImpulse(velocities, { x: 1, y: -0.5 }, 0.15)
    applyOrbitalForce(positions, velocities, { x: 0, y: 0 }, 0.01, 1 / 60)
    applyRepulsion(positions, velocities, { x: 0, y: 0 }, 2, 0.01, 1 / 60)
    limitVelocities(velocities, 0.25)
    expect(Array.from(velocities).every(Number.isFinite)).toBe(true)
    for (let offset = 0; offset < velocities.length; offset += 3) {
      expect(Math.hypot(velocities[offset], velocities[offset + 1], velocities[offset + 2]))
        .toBeLessThanOrEqual(0.250001)
    }
  })

  it('clamps normalized hand coordinates to the visible world area', () => {
    expect(normalizedHandToWorld({ x: 8, y: -8 }, 3)).toEqual({ x: 2.8, y: -2 })
    expect(normalizedHandToWorld(undefined, 1)).toEqual({ x: 0, y: 0 })
  })
})

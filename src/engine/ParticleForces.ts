import { fibonacciDirection } from '../utils/particleMath'

export interface ForcePoint {
  x: number
  y: number
  z?: number
}

export function applyRadialImpulse(
  positions: Float32Array,
  velocities: Float32Array,
  center: ForcePoint,
  strength: number,
): void {
  const count = positions.length / 3
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    let x = positions[offset] - center.x
    let y = positions[offset + 1] - center.y
    let z = positions[offset + 2] - (center.z ?? 0)
    let distance = Math.hypot(x, y, z)
    if (distance < 0.001) {
      const fallback = fibonacciDirection(index, count)
      x = fallback.x
      y = fallback.y
      z = fallback.z
      distance = 1
    }
    const variation = 0.65 + ((index * 31) % 47) / 100
    velocities[offset] += (x / distance) * strength * variation
    velocities[offset + 1] += (y / distance) * strength * variation
    velocities[offset + 2] += (z / distance) * strength * variation
  }
}

export function applyDirectionalImpulse(
  velocities: Float32Array,
  direction: { x: number; y: number },
  strength: number,
): void {
  for (let offset = 0; offset < velocities.length; offset += 3) {
    const index = offset / 3
    const variation = 0.72 + ((index * 31) % 47) / 100
    velocities[offset] += direction.x * strength * variation
    velocities[offset + 1] += direction.y * strength * variation
    velocities[offset + 2] += Math.sin(index * 0.17) * strength * 0.18
  }
}

export function applyOrbitalForce(
  positions: Float32Array,
  velocities: Float32Array,
  center: ForcePoint,
  strength: number,
  deltaSeconds: number,
): void {
  const frameScale = Math.min(deltaSeconds * 60, 2)
  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = positions[offset] - center.x
    const z = positions[offset + 2] - (center.z ?? 0)
    const radius = Math.max(0.25, Math.hypot(x, z))
    const force = strength * frameScale / Math.sqrt(radius)
    velocities[offset] += (-z / radius) * force
    velocities[offset + 2] += (x / radius) * force
  }
}

export function applyRepulsion(
  positions: Float32Array,
  velocities: Float32Array,
  center: ForcePoint,
  radius: number,
  strength: number,
  deltaSeconds: number,
): void {
  const frameScale = Math.min(deltaSeconds * 60, 2)
  for (let offset = 0; offset < positions.length; offset += 3) {
    const x = positions[offset] - center.x
    const y = positions[offset + 1] - center.y
    const z = positions[offset + 2] - (center.z ?? 0)
    const distance = Math.max(0.08, Math.hypot(x, y, z))
    if (distance >= radius) continue
    const force = (1 - distance / radius) * strength * frameScale
    velocities[offset] += (x / distance) * force
    velocities[offset + 1] += (y / distance) * force
    velocities[offset + 2] += (z / distance) * force
  }
}

export function limitVelocities(velocities: Float32Array, maxSpeed: number): void {
  for (let offset = 0; offset < velocities.length; offset += 3) {
    const speed = Math.hypot(
      velocities[offset],
      velocities[offset + 1],
      velocities[offset + 2],
    )
    if (speed <= maxSpeed || speed === 0) continue
    const scale = maxSpeed / speed
    velocities[offset] *= scale
    velocities[offset + 1] *= scale
    velocities[offset + 2] *= scale
  }
}

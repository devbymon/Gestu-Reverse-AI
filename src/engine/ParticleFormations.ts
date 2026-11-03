const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Creates an even sphere with a small radial variation for visual depth. */
export function createSphereTargets(
  count: number,
  radius: number,
): Float32Array {
  const targets = new Float32Array(count * 3)
  writeSphereTargets(targets, count, radius)
  return targets
}

export function writeSphereTargets(
  targets: Float32Array,
  count: number,
  radius: number,
): void {

  for (let index = 0; index < count; index += 1) {
    const normalizedIndex = (index + 0.5) / count
    const y = 1 - normalizedIndex * 2
    const ringRadius = Math.sqrt(1 - y * y)
    const angle = index * GOLDEN_ANGLE
    const depthVariation = radius * (0.9 + ((index * 37) % 101) / 1_000)
    const offset = index * 3

    targets[offset] = Math.cos(angle) * ringRadius * depthVariation
    targets[offset + 1] = y * depthVariation
    targets[offset + 2] = Math.sin(angle) * ringRadius * depthVariation
  }

}

export function writeExpandedSphereTargets(
  targets: Float32Array,
  count: number,
  radius: number,
): void {
  writeSphereTargets(targets, count, radius)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    const variation = 0.72 + ((index * 53) % 101) / 160
    targets[offset] *= variation
    targets[offset + 1] *= variation
    targets[offset + 2] *= variation
  }
}

export function writeVortexTargets(
  targets: Float32Array,
  count: number,
  centerX: number,
  centerY: number,
): void {
  for (let index = 0; index < count; index += 1) {
    const progress = index / count
    const angle = progress * Math.PI * 30
    const radius = 0.22 + progress * 2.25
    const offset = index * 3
    targets[offset] = centerX + Math.cos(angle) * radius
    targets[offset + 1] = centerY + (progress - 0.5) * 5
    targets[offset + 2] = Math.sin(angle) * radius
  }
}

export function writeWaveTargets(
  targets: Float32Array,
  count: number,
  elapsed: number,
  amplitude: number,
): void {
  const side = Math.ceil(Math.sqrt(count))
  for (let index = 0; index < count; index += 1) {
    const column = index % side
    const row = Math.floor(index / side)
    const x = (column / (side - 1) - 0.5) * 6.2
    const z = (row / (side - 1) - 0.5) * 6.2
    const offset = index * 3
    targets[offset] = x
    targets[offset + 1] = Math.sin(x * 1.65 + elapsed * 2.1) *
      Math.cos(z * 1.4 + elapsed * 1.5) * amplitude
    targets[offset + 2] = z
  }
}

export function writeImplosionTargets(
  targets: Float32Array,
  count: number,
  centerX: number,
  centerY: number,
  intensity: number,
): void {
  const remainingRadius = Math.max(0.025, (1 - intensity) * 0.8)
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    const phase = index * GOLDEN_ANGLE
    const radius = remainingRadius * ((index % 29) / 29)
    targets[offset] = centerX + Math.cos(phase) * radius
    targets[offset + 1] = centerY + Math.sin(phase) * radius
    targets[offset + 2] = Math.sin(phase * 0.7) * radius
  }
}

export function createInitialCloud(
  targets: Float32Array,
  spread: number,
): Float32Array {
  const positions = new Float32Array(targets.length)

  for (let index = 0; index < targets.length; index += 3) {
    const scale = 0.2 + Math.random() * spread
    positions[index] = targets[index] * scale
    positions[index + 1] = targets[index + 1] * scale
    positions[index + 2] = targets[index + 2] * scale
  }

  return positions
}

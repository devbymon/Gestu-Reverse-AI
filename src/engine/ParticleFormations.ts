const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** Creates an even sphere with a small radial variation for visual depth. */
export function createSphereTargets(
  count: number,
  radius: number,
): Float32Array {
  const targets = new Float32Array(count * 3)

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

  return targets
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

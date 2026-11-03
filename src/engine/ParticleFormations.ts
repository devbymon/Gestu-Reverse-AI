/** Creates a deterministic target-relative startup cloud without object allocations. */
export function createInitialCloud(
  targets: Float32Array,
  spread: number,
): Float32Array {
  const positions = new Float32Array(targets.length)

  for (let index = 0; index < targets.length; index += 3) {
    const particleIndex = index / 3
    const pseudoRandom = Math.sin((particleIndex + 1) * 91.345) * 47_358.5453
    const normalized = pseudoRandom - Math.floor(pseudoRandom)
    const scale = 0.25 + normalized * spread
    positions[index] = targets[index] * scale
    positions[index + 1] = targets[index + 1] * scale
    positions[index + 2] = targets[index + 2] * scale
  }

  return positions
}

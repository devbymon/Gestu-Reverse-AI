export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

export function hash01(index: number, seed = 0): number {
  const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43_758.5453
  return value - Math.floor(value)
}

export function fibonacciDirection(index: number, count: number): {
  x: number
  y: number
  z: number
} {
  const normalized = (index + 0.5) / Math.max(count, 1)
  const y = 1 - normalized * 2
  const ring = Math.sqrt(Math.max(0, 1 - y * y))
  const angle = index * GOLDEN_ANGLE
  return { x: Math.cos(angle) * ring, y, z: Math.sin(angle) * ring }
}

export function writePosition(
  targets: Float32Array,
  index: number,
  x: number,
  y: number,
  z: number,
): void {
  const offset = index * 3
  targets[offset] = Number.isFinite(x) ? x : 0
  targets[offset + 1] = Number.isFinite(y) ? y : 0
  targets[offset + 2] = Number.isFinite(z) ? z : 0
}

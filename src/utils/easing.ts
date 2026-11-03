export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

export function smoothstep(progress: number): number {
  const value = clamp01(progress)
  return value * value * (3 - 2 * value)
}

export function easeInOutCubic(progress: number): number {
  const value = clamp01(progress)
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2
}

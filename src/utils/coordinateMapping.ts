import type { EffectVector } from '../types/particleEffects'

export function normalizedHandToWorld(
  position: EffectVector | undefined,
  aspect: number,
): EffectVector {
  if (!position) return { x: 0, y: 0 }
  const safeAspect = Math.min(2, Math.max(0.5, aspect))
  const horizontalScale = Math.max(1, safeAspect)
  return {
    x: Math.min(2.8, Math.max(-2.8, position.x * 2.2 * horizontalScale)),
    y: Math.min(2, Math.max(-2, position.y * 1.55)),
  }
}

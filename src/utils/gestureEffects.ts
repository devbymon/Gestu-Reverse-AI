import type { GestureType } from '../types/gestures'
import type { FormationType } from '../types/particleEffects'

const GESTURE_EFFECTS: Record<Exclude<GestureType, 'SNAP'>, FormationType> = {
  FIST: 'SPHERE',
  OPEN_PALM: 'ENERGY_BURST',
  INDEX_POINT: 'VORTEX',
  PEACE: 'WAVE',
  PINCH: 'IMPLOSION',
  TWO_HAND_EXPANSION: 'ENERGY_BURST',
  UNKNOWN: 'SPHERE',
}

export function getGestureFormation(gesture: GestureType, fallback: GestureType = 'UNKNOWN'): FormationType {
  const resolved = gesture === 'SNAP' ? fallback : gesture
  return resolved === 'SNAP' ? 'SPHERE' : GESTURE_EFFECTS[resolved]
}

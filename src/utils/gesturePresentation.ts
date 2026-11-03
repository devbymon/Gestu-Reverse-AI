import type { GestureType } from '../types/gestures'

interface GesturePresentation {
  label: string
  action: string
  symbol: string
  color: string
}

export const GESTURE_PRESENTATION: Record<GestureType, GesturePresentation> = {
  FIST: { label: 'Fist', action: 'Sphere', symbol: 'FI', color: '#67d5e4' },
  OPEN_PALM: { label: 'Open', action: 'Burst', symbol: 'OP', color: '#fbbf24' },
  INDEX_POINT: { label: 'Point', action: 'Vortex', symbol: 'PT', color: '#a78bfa' },
  PEACE: { label: 'Peace', action: 'Wave', symbol: 'PE', color: '#60a5fa' },
  PINCH: { label: 'Pinch', action: 'Implode', symbol: 'PI', color: '#f472b6' },
  SWIPE: { label: 'Swipe', action: 'Push', symbol: 'SW', color: '#34d399' },
  TWO_HAND_EXPANSION: { label: 'Two hands', action: 'Expand', symbol: '2H', color: '#fb923c' },
  UNKNOWN: { label: 'Waiting', action: 'Sphere', symbol: '—', color: '#64748b' },
}

export function getDisplayedGesture(gesture: GestureType, candidate: GestureType): GestureType {
  return gesture === 'UNKNOWN' && candidate !== 'UNKNOWN' ? candidate : gesture
}

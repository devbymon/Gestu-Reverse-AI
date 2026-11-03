import type { GestureType } from '../types/gestures'

interface GesturePresentation {
  label: string
  action: string
  symbol: string
  color: string
}

export const GESTURE_PRESENTATION: Record<GestureType, GesturePresentation> = {
  FIST: { label: 'Fist', action: 'Sphere', symbol: '✊', color: '#67d5e4' },
  OPEN_PALM: { label: 'Open', action: 'Burst', symbol: '🖐', color: '#fbbf24' },
  INDEX_POINT: { label: 'Point', action: 'Vortex', symbol: '☝', color: '#a78bfa' },
  PEACE: { label: 'Peace', action: 'Wave', symbol: '✌', color: '#60a5fa' },
  PINCH: { label: 'Pinch', action: 'Implode', symbol: '🤏', color: '#f472b6' },
  SWIPE: { label: 'Swipe', action: 'Push', symbol: '👋', color: '#34d399' },
  TWO_HAND_EXPANSION: { label: 'Two hands', action: 'Expand', symbol: '🙌', color: '#fb923c' },
  UNKNOWN: { label: 'Waiting', action: 'Sphere', symbol: '·', color: '#64748b' },
}

export function getDisplayedGesture(gesture: GestureType, candidate: GestureType): GestureType {
  return gesture === 'UNKNOWN' && candidate !== 'UNKNOWN' ? candidate : gesture
}

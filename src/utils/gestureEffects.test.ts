import { describe, expect, it } from 'vitest'
import { getGestureFormation } from './gestureEffects'
import { getDisplayedGesture } from './gesturePresentation'

describe('gesture effect mapping', () => {
  it('maps stable gestures to the formations consumed by the engine', () => {
    expect(getGestureFormation('FIST')).toBe('SPHERE')
    expect(getGestureFormation('OPEN_PALM')).toBe('ENERGY_BURST')
    expect(getGestureFormation('INDEX_POINT')).toBe('VORTEX')
    expect(getGestureFormation('PEACE')).toBe('WAVE')
    expect(getGestureFormation('PINCH')).toBe('IMPLOSION')
  })

  it('keeps the underlying candidate visible during a transient snap', () => {
    expect(getGestureFormation('SNAP', 'PEACE')).toBe('WAVE')
  })

  it('shows the candidate while a gesture is stabilizing', () => {
    expect(getDisplayedGesture('UNKNOWN', 'PINCH')).toBe('PINCH')
    expect(getDisplayedGesture('FIST', 'OPEN_PALM')).toBe('FIST')
  })
})

import { useCallback, useRef } from 'react'
import type { RefObject } from 'react'
import type { GestureCommand, GestureType } from '../types/gestures'
import type { ParticleEffectCommand } from '../types/particleEffects'
import { DEFAULT_EFFECT_COMMAND } from '../types/particleEffects'
import { getGestureFormation } from '../utils/gestureEffects'

export function useParticleEffects(gestureCommandRef: RefObject<GestureCommand>) {
  const gestureEffectRef = useRef<ParticleEffectCommand>(DEFAULT_EFFECT_COMMAND)
  const lastGestureTimestampRef = useRef(Number.NEGATIVE_INFINITY)
  const lastGestureTypeRef = useRef<GestureType>('UNKNOWN')
  const triggerIdRef = useRef(0)

  const getEffectCommand = useCallback((): ParticleEffectCommand => {
    const gestureCommand = gestureCommandRef.current
    if (gestureCommand.timestamp === lastGestureTimestampRef.current) return gestureEffectRef.current
    lastGestureTimestampRef.current = gestureCommand.timestamp

    const effect = getGestureFormation(gestureCommand.gesture)
    const gestureChanged = gestureCommand.gesture !== lastGestureTypeRef.current
    if (gestureChanged) triggerIdRef.current += 1
    lastGestureTypeRef.current = gestureCommand.gesture
    gestureEffectRef.current = {
      effect,
      source: 'GESTURE',
      intensity: gestureCommand.intensity,
      position: gestureCommand.position,
      direction: undefined,
      trigger: gestureChanged && effect === 'ENERGY_BURST' ? 'BURST' : undefined,
      triggerId: triggerIdRef.current,
      timestamp: gestureCommand.timestamp,
    }
    return gestureEffectRef.current
  }, [gestureCommandRef])

  return { getEffectCommand }
}

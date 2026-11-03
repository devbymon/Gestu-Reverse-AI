import { useCallback, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { GestureCommand, GestureType } from '../types/gestures'
import type {
  FormationType,
  ParticleEffectCommand,
} from '../types/particleEffects'
import { DEFAULT_EFFECT_COMMAND } from '../types/particleEffects'

const GESTURE_EFFECTS: Record<Exclude<GestureType, 'SWIPE'>, FormationType> = {
  FIST: 'SPHERE',
  OPEN_PALM: 'ENERGY_BURST',
  INDEX_POINT: 'VORTEX',
  PEACE: 'WAVE',
  PINCH: 'IMPLOSION',
  TWO_HAND_EXPANSION: 'ENERGY_BURST',
  UNKNOWN: 'SPHERE',
}

export function useParticleEffects(gestureCommandRef: RefObject<GestureCommand>) {
  const [manualMode, setManualMode] = useState(false)
  const [selectedEffect, setSelectedEffect] = useState<FormationType>('SPHERE')
  const manualModeRef = useRef(false)
  const manualCommandRef = useRef<ParticleEffectCommand>({
    ...DEFAULT_EFFECT_COMMAND,
    source: 'MANUAL',
  })
  const gestureEffectRef = useRef<ParticleEffectCommand>(DEFAULT_EFFECT_COMMAND)
  const lastGestureTimestampRef = useRef(Number.NEGATIVE_INFINITY)
  const lastGestureTypeRef = useRef<GestureType>('UNKNOWN')
  const triggerIdRef = useRef(0)

  const selectEffect = useCallback((effect: FormationType) => {
    manualModeRef.current = true
    setManualMode(true)
    setSelectedEffect(effect)
    triggerIdRef.current += 1
    manualCommandRef.current = {
      effect,
      source: 'MANUAL',
      intensity: effect === 'IMPLOSION' ? 1 : 0.85,
      trigger: effect === 'ENERGY_BURST' ? 'BURST' : undefined,
      triggerId: triggerIdRef.current,
      timestamp: performance.now(),
    }
  }, [])

  const resetSphere = useCallback(() => selectEffect('SPHERE'), [selectEffect])

  const enableGestureControl = useCallback(() => {
    manualModeRef.current = false
    setManualMode(false)
  }, [])

  const getEffectCommand = useCallback((): ParticleEffectCommand => {
    if (manualModeRef.current) return manualCommandRef.current
    const gestureCommand = gestureCommandRef.current
    if (gestureCommand.timestamp === lastGestureTimestampRef.current) {
      return gestureEffectRef.current
    }
    lastGestureTimestampRef.current = gestureCommand.timestamp

    if (gestureCommand.gesture === 'SWIPE') {
      if (lastGestureTypeRef.current !== 'SWIPE') triggerIdRef.current += 1
      lastGestureTypeRef.current = 'SWIPE'
      gestureEffectRef.current = {
        ...gestureEffectRef.current,
        source: 'GESTURE',
        intensity: gestureCommand.intensity,
        position: gestureCommand.position,
        direction: gestureCommand.direction,
        trigger: 'DIRECTIONAL_IMPULSE',
        triggerId: triggerIdRef.current,
        timestamp: gestureCommand.timestamp,
      }
      return gestureEffectRef.current
    }

    const effect = GESTURE_EFFECTS[gestureCommand.gesture]
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

  return {
    manualMode,
    selectedEffect,
    selectEffect,
    resetSphere,
    enableGestureControl,
    getEffectCommand,
  }
}

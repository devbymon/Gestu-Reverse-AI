import { useCallback, useRef, useState } from 'react'
import { GestureController } from '../services/gestureController'
import type { HandTrackingFrame } from '../types/handTracking'
import type {
  GestureCommand,
  GestureRecognitionState,
} from '../types/gestures'
import { UNKNOWN_GESTURE_COMMAND } from '../types/gestures'

const INITIAL_STATE: GestureRecognitionState = {
  gesture: 'UNKNOWN',
  candidate: 'UNKNOWN',
  effect: 'Ambient Sphere',
  intensity: 0,
  stability: 0,
  handCount: 0,
  tracking: false,
  isTransient: false,
}

const UI_UPDATE_INTERVAL_MS = 100

export function useGestureRecognition() {
  const controllerRef = useRef(new GestureController())
  const commandRef = useRef<GestureCommand>(UNKNOWN_GESTURE_COMMAND)
  const [state, setState] = useState<GestureRecognitionState>(INITIAL_STATE)
  const publishedGestureRef = useRef(state.gesture)
  const lastUiUpdateRef = useRef(0)

  const processFrame = useCallback((frame: HandTrackingFrame) => {
    const result = controllerRef.current.process(frame)
    commandRef.current = result.command
    const gestureChanged = result.state.gesture !== publishedGestureRef.current
    if (gestureChanged || frame.timestamp - lastUiUpdateRef.current >= UI_UPDATE_INTERVAL_MS) {
      publishedGestureRef.current = result.state.gesture
      lastUiUpdateRef.current = frame.timestamp
      setState(result.state)
    }
  }, [])

  const reset = useCallback(() => {
    controllerRef.current.reset()
    commandRef.current = { ...UNKNOWN_GESTURE_COMMAND, timestamp: performance.now() }
    publishedGestureRef.current = 'UNKNOWN'
    setState(INITIAL_STATE)
  }, [])

  return { state, commandRef, processFrame, reset }
}

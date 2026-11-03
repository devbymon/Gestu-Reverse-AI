import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { HandLandmarkOverlayHandle } from '../components/HandLandmarkOverlay'
import { handTrackingService } from '../services/handTrackingService'
import type {
  HandTrackingFrame,
  HandTrackingState,
  TrackingBackend,
} from '../types/handTracking'

const INFERENCE_INTERVAL_MS = 1_000 / 30

const INITIAL_STATE: HandTrackingState = {
  status: 'off',
  modelStatus: 'idle',
  backend: null,
  handCount: 0,
  handedness: [],
  error: null,
}

function cameraErrorMessage(error: unknown): string {
  if (!(error instanceof DOMException)) return 'Unable to initialize hand tracking.'
  if (error.name === 'NotAllowedError') return 'Camera permission was denied. Enable it in browser settings.'
  if (error.name === 'NotFoundError') return 'No camera was found on this device.'
  if (error.name === 'NotReadableError') return 'The camera is already in use or unavailable.'
  if (error.name === 'SecurityError') return 'Camera access requires HTTPS or localhost.'
  return error.message || 'Unable to access the camera.'
}

function waitForVideo(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup()
      reject(new Error('Camera metadata timed out.'))
    }, 10_000)
    const cleanup = () => {
      window.clearTimeout(timeout)
      video.removeEventListener('loadedmetadata', handleReady)
      video.removeEventListener('error', handleError)
    }
    const handleReady = () => {
      cleanup()
      resolve()
    }
    const handleError = () => {
      cleanup()
      reject(new Error('The camera stream could not be loaded.'))
    }
    video.addEventListener('loadedmetadata', handleReady, { once: true })
    video.addEventListener('error', handleError, { once: true })
  })
}

export function useHandTracking(
  videoRef: RefObject<HTMLVideoElement | null>,
  overlayRef: RefObject<HandLandmarkOverlayHandle | null>,
  onFrame?: (frame: HandTrackingFrame) => void,
  onReset?: () => void,
) {
  const [state, setState] = useState<HandTrackingState>(INITIAL_STATE)
  const latestFrameRef = useRef<HandTrackingFrame | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef(0)
  const sessionRef = useRef(0)
  const startPromiseRef = useRef<Promise<void> | null>(null)
  const mountedRef = useRef(true)
  const backendRef = useRef<TrackingBackend | null>(null)
  const resultSignatureRef = useRef('')
  const onFrameRef = useRef(onFrame)
  const onResetRef = useRef(onReset)
  onFrameRef.current = onFrame
  onResetRef.current = onReset

  const stopLoop = useCallback(() => {
    cancelAnimationFrame(animationFrameRef.current)
    animationFrameRef.current = 0
  }, [])

  const releaseStream = useCallback(() => {
    const stream = streamRef.current
    streamRef.current = null
    stream?.getTracks().forEach((track) => {
      track.onended = null
      track.stop()
    })
    const video = videoRef.current
    if (video) {
      video.pause()
      video.srcObject = null
    }
  }, [videoRef])

  const disableCamera = useCallback(() => {
    sessionRef.current += 1
    startPromiseRef.current = null
    stopLoop()
    releaseStream()
    overlayRef.current?.clear()
    latestFrameRef.current = null
    resultSignatureRef.current = ''
    onResetRef.current?.()
    if (mountedRef.current) {
      setState({
        ...INITIAL_STATE,
        modelStatus: handTrackingService.isReady ? 'ready' : 'idle',
        backend: backendRef.current,
      })
    }
  }, [overlayRef, releaseStream, stopLoop])

  const beginTracking = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new DOMException('Camera access is not supported.', 'NotSupportedError')
    }

    const session = ++sessionRef.current
    let modelInitializationStarted = false
    setState({ ...INITIAL_STATE, status: 'requesting-permission' })

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user',
        },
      })
      if (session !== sessionRef.current || !mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }

      const video = videoRef.current
      if (!video) throw new Error('Camera preview is unavailable.')
      streamRef.current = stream
      video.srcObject = stream
      await waitForVideo(video)
      await video.play()

      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          if (session !== sessionRef.current || !mountedRef.current) return
          disableCamera()
          setState((current) => ({
            ...current,
            status: 'error',
            error: 'The camera stream was interrupted.',
          }))
        }
      })

      modelInitializationStarted = true
      setState((current) => ({
        ...current,
        status: 'initializing',
        modelStatus: 'loading',
      }))
      const backend = await handTrackingService.initialize()
      if (session !== sessionRef.current || !mountedRef.current) return
      backendRef.current = backend
      setState((current) => ({
        ...current,
        status: 'active',
        modelStatus: 'ready',
        backend,
      }))

      let lastVideoTime = -1
      let lastInferenceTime = 0
      const detectFrame = (timestamp: number) => {
        if (session !== sessionRef.current || !mountedRef.current) return
        animationFrameRef.current = requestAnimationFrame(detectFrame)
        if (
          video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
          video.currentTime === lastVideoTime ||
          timestamp - lastInferenceTime < INFERENCE_INTERVAL_MS
        ) return

        lastVideoTime = video.currentTime
        lastInferenceTime = timestamp
        try {
          const frame = handTrackingService.detect(video, timestamp)
          latestFrameRef.current = frame
          overlayRef.current?.draw(frame)
          onFrameRef.current?.(frame)
          const signature = frame.hands.map((hand) => hand.handedness).join('|') || 'none'
          if (signature !== resultSignatureRef.current) {
            resultSignatureRef.current = signature
            setState((current) => ({
              ...current,
              status: frame.hands.length > 0 ? 'active' : 'no-hands',
              handCount: frame.hands.length,
              handedness: frame.hands.map((hand) => hand.handedness),
              error: null,
            }))
          }
        } catch (error) {
          stopLoop()
          releaseStream()
          setState((current) => ({
            ...current,
            status: 'error',
            error: cameraErrorMessage(error),
          }))
        }
      }
      animationFrameRef.current = requestAnimationFrame(detectFrame)
    } catch (error) {
      if (session !== sessionRef.current || !mountedRef.current) return
      stopLoop()
      releaseStream()
      overlayRef.current?.clear()
      onResetRef.current?.()
      setState({
        ...INITIAL_STATE,
        status: 'error',
        modelStatus: modelInitializationStarted ? 'error' : 'idle',
        error: cameraErrorMessage(error),
      })
    }
  }, [disableCamera, overlayRef, releaseStream, stopLoop, videoRef])

  const enableCamera = useCallback(() => {
    if (startPromiseRef.current) return startPromiseRef.current
    const promise = beginTracking().finally(() => {
      if (startPromiseRef.current === promise) startPromiseRef.current = null
    })
    startPromiseRef.current = promise
    return promise
  }, [beginTracking])

  useEffect(() => {
    mountedRef.current = true
    const overlay = overlayRef.current
    return () => {
      mountedRef.current = false
      sessionRef.current += 1
      stopLoop()
      releaseStream()
      overlay?.clear()
      handTrackingService.close()
    }
  }, [overlayRef, releaseStream, stopLoop])

  return { state, latestFrameRef, enableCamera, disableCamera }
}

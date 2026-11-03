import type {
  HandLandmarker as MediaPipeHandLandmarker,
  HandLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type {
  HandTrackingFrame,
  HandTrackingThresholds,
  Handedness,
  TrackingBackend,
  TrackedHand,
} from '../types/handTracking'
import { calculatePalmPosition } from '../utils/landmarkUtils'

const WASM_ROOT = `${import.meta.env.BASE_URL}mediapipe/wasm`
const MODEL_PATH = `${import.meta.env.BASE_URL}models/hand_landmarker.task`

export const DEFAULT_TRACKING_THRESHOLDS: HandTrackingThresholds = {
  minHandDetectionConfidence: 0.55,
  minHandPresenceConfidence: 0.55,
  minTrackingConfidence: 0.5,
}

function normalizeHandedness(value?: string): Handedness {
  if (value === 'Left' || value === 'Right') return value
  return 'Unknown'
}

function mapResult(result: HandLandmarkerResult, timestamp: number): HandTrackingFrame {
  const hands: TrackedHand[] = result.landmarks.map((landmarks, index) => {
    const category = result.handedness[index]?.[0]
    return {
      handedness: normalizeHandedness(category?.categoryName),
      handednessScore: category?.score ?? null,
      landmarks,
      worldLandmarks: result.worldLandmarks[index] ?? [],
      palmPosition: calculatePalmPosition(landmarks),
    }
  })

  return { hands, timestamp }
}

class HandTrackingService {
  private landmarker: MediaPipeHandLandmarker | null = null
  private initialization: Promise<TrackingBackend> | null = null
  private backend: TrackingBackend | null = null
  private generation = 0

  get isReady(): boolean {
    return this.landmarker !== null
  }

  initialize(
    thresholds: HandTrackingThresholds = DEFAULT_TRACKING_THRESHOLDS,
  ): Promise<TrackingBackend> {
    if (this.landmarker && this.backend) return Promise.resolve(this.backend)
    if (this.initialization) return this.initialization

    const generation = this.generation
    this.initialization = this.createLandmarker(thresholds, generation)
      .finally(() => {
        this.initialization = null
      })
    return this.initialization
  }

  detect(video: HTMLVideoElement, timestamp: number): HandTrackingFrame {
    if (!this.landmarker) throw new Error('Hand tracking model is not ready.')
    return mapResult(this.landmarker.detectForVideo(video, timestamp), timestamp)
  }

  close(): void {
    this.generation += 1
    this.landmarker?.close()
    this.landmarker = null
    this.backend = null
    this.initialization = null
  }

  private async createLandmarker(
    thresholds: HandTrackingThresholds,
    generation: number,
  ): Promise<TrackingBackend> {
    const { FilesetResolver, HandLandmarker } = await import('@mediapipe/tasks-vision')
    const vision = await FilesetResolver.forVisionTasks(WASM_ROOT)
    const commonOptions = {
      runningMode: 'VIDEO' as const,
      numHands: 2,
      ...thresholds,
    }

    try {
      const gpuLandmarker = await HandLandmarker.createFromOptions(vision, {
        ...commonOptions,
        canvas: document.createElement('canvas'),
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'GPU' },
      })
      this.acceptLandmarker(gpuLandmarker, generation)
      this.backend = 'GPU'
      return 'GPU'
    } catch (gpuError) {
      if (generation !== this.generation) throw gpuError
      const cpuLandmarker = await HandLandmarker.createFromOptions(vision, {
        ...commonOptions,
        baseOptions: { modelAssetPath: MODEL_PATH, delegate: 'CPU' },
      })
      this.acceptLandmarker(cpuLandmarker, generation)
      this.backend = 'CPU'
      return 'CPU'
    }
  }

  private acceptLandmarker(landmarker: MediaPipeHandLandmarker, generation: number): void {
    if (generation !== this.generation) {
      landmarker.close()
      throw new DOMException('Hand tracking initialization was cancelled.', 'AbortError')
    }
    this.landmarker = landmarker
  }
}

export const handTrackingService = new HandTrackingService()

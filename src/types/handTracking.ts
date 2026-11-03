export type Handedness = 'Left' | 'Right' | 'Unknown'

export type TrackingStatus =
  | 'off'
  | 'requesting-permission'
  | 'initializing'
  | 'active'
  | 'no-hands'
  | 'error'

export type ModelStatus = 'idle' | 'loading' | 'ready' | 'error'
export type TrackingBackend = 'GPU' | 'CPU'

export interface NormalizedHandLandmark {
  x: number
  y: number
  z: number
  visibility?: number
  presence?: number
}

export interface WorldHandLandmark {
  x: number
  y: number
  z: number
  visibility?: number
  presence?: number
}

export interface PalmPosition {
  x: number
  y: number
  z: number
}

export interface TrackedHand {
  handedness: Handedness
  handednessScore: number | null
  landmarks: NormalizedHandLandmark[]
  worldLandmarks: WorldHandLandmark[]
  palmPosition: PalmPosition
}

export interface HandTrackingFrame {
  hands: TrackedHand[]
  timestamp: number
}

export interface HandTrackingThresholds {
  minHandDetectionConfidence: number
  minHandPresenceConfidence: number
  minTrackingConfidence: number
}

export interface HandTrackingState {
  status: TrackingStatus
  modelStatus: ModelStatus
  backend: TrackingBackend | null
  handCount: number
  handedness: Handedness[]
  error: string | null
}

import type { TrackedHand } from '../types/handTracking'
import type { GestureType } from '../types/gestures'
import { calculatePalmPosition } from './landmarkUtils'

export class LandmarkSmoother {
  private readonly landmarksByHand = new Map<string, TrackedHand['landmarks']>()
  private readonly alpha: number

  constructor(alpha = 0.38) {
    this.alpha = alpha
  }

  smooth(hand: TrackedHand): TrackedHand {
    const key = hand.handedness
    const previous = this.landmarksByHand.get(key)
    const landmarks = hand.landmarks.map((landmark, index) => {
      const oldLandmark = previous?.[index]
      if (!oldLandmark) return { ...landmark }
      return {
        ...landmark,
        x: oldLandmark.x + (landmark.x - oldLandmark.x) * this.alpha,
        y: oldLandmark.y + (landmark.y - oldLandmark.y) * this.alpha,
        z: oldLandmark.z + (landmark.z - oldLandmark.z) * this.alpha,
      }
    })
    this.landmarksByHand.set(key, landmarks)
    return { ...hand, landmarks, palmPosition: calculatePalmPosition(landmarks) }
  }

  reset(): void {
    this.landmarksByHand.clear()
  }
}

export class GestureStabilizer {
  private stable: GestureType = 'UNKNOWN'
  private candidate: GestureType = 'UNKNOWN'
  private candidateFrames = 0
  private readonly confirmationFrames: number

  constructor(confirmationFrames: number) {
    this.confirmationFrames = confirmationFrames
  }

  get current(): GestureType {
    return this.stable
  }

  update(rawGesture: GestureType): {
    stable: GestureType
    candidate: GestureType
    stability: number
  } {
    if (rawGesture === this.stable) {
      this.candidate = rawGesture
      this.candidateFrames = this.confirmationFrames
    } else if (rawGesture === this.candidate) {
      this.candidateFrames += 1
    } else {
      this.candidate = rawGesture
      this.candidateFrames = 1
    }

    if (this.candidateFrames >= this.confirmationFrames) {
      this.stable = this.candidate
      this.candidateFrames = this.confirmationFrames
    }

    return {
      stable: this.stable,
      candidate: this.candidate,
      stability: Math.min(1, this.candidateFrames / this.confirmationFrames),
    }
  }

  reset(): void {
    this.stable = 'UNKNOWN'
    this.candidate = 'UNKNOWN'
    this.candidateFrames = 0
  }
}

import type { HandTrackingFrame, TrackedHand } from '../types/handTracking'
import type {
  GestureCommand,
  GestureControllerResult,
  GestureRecognitionState,
  GestureThresholds,
  GestureType,
} from '../types/gestures'
import { calculateSnapRatio, normalizedPalmToCommand } from '../utils/gestureGeometry'
import {
  classifyHandGesture,
  DEFAULT_GESTURE_THRESHOLDS,
} from '../utils/gestureRecognition'
import { GestureStabilizer, LandmarkSmoother } from '../utils/gestureSmoothing'

interface SnapContact {
  contactAt: number | null
  minimumRatio: number
}

const EFFECT_NAMES: Record<GestureType, string> = {
  FIST: 'Compact Sphere',
  OPEN_PALM: 'Controlled Expansion',
  INDEX_POINT: 'Particle Vortex',
  PEACE: 'Particle Wave',
  PINCH: 'Particle Implosion',
  SNAP: 'Kinetic Push',
  TWO_HAND_EXPANSION: 'Dual Energy Expansion',
  UNKNOWN: 'Ambient Sphere',
}

const SNAP_VISIBLE_MS = 320

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export class GestureController {
  private readonly smoother = new LandmarkSmoother()
  private readonly stabilizer: GestureStabilizer
  private readonly snapContacts = new Map<string, SnapContact>()
  private lastSnapAt = Number.NEGATIVE_INFINITY
  private snapUntil = Number.NEGATIVE_INFINITY
  private snapCommand: GestureCommand | null = null
  private readonly thresholds: GestureThresholds

  constructor(thresholds: GestureThresholds = DEFAULT_GESTURE_THRESHOLDS) {
    this.thresholds = thresholds
    this.stabilizer = new GestureStabilizer(thresholds.confirmationFrames)
  }

  process(frame: HandTrackingFrame): GestureControllerResult {
    if (frame.hands.length === 0) {
      this.reset()
      return this.createResult('UNKNOWN', 'UNKNOWN', 0, 0, frame.timestamp, 0)
    }

    const hands = frame.hands.map((hand) => this.smoother.smooth(hand))
    const classifications = hands.map((hand) =>
      classifyHandGesture(hand, this.stabilizer.current))
    const primaryHand = hands[0]
    const position = primaryHand
      ? normalizedPalmToCommand(primaryHand.palmPosition)
      : undefined
    const twoOpenHands = hands.length >= 2 && classifications
      .slice(0, 2)
      .every((classification) => classification.gesture === 'OPEN_PALM')
    const baseGesture = twoOpenHands
      ? 'TWO_HAND_EXPANSION'
      : classifications[0]?.gesture ?? 'UNKNOWN'
    const stabilization = this.stabilizer.update(baseGesture)
    const snapIntensity = this.detectSnap(frame.hands, frame.timestamp)

    if (
      !twoOpenHands &&
      snapIntensity !== null &&
      frame.timestamp - this.lastSnapAt >= this.thresholds.snapCooldownMs
    ) {
      this.lastSnapAt = frame.timestamp
      this.snapUntil = frame.timestamp + SNAP_VISIBLE_MS
      this.snapCommand = {
        gesture: 'SNAP',
        intensity: snapIntensity,
        position,
        timestamp: frame.timestamp,
      }
    }

    if (this.snapCommand && frame.timestamp <= this.snapUntil) {
      return {
        command: this.snapCommand,
        state: this.createState(
          'SNAP',
          stabilization.candidate,
          this.snapCommand.intensity,
          1,
          hands.length,
          true,
        ),
      }
    }

    const stableGesture = stabilization.stable
    const intensity = this.calculateIntensity(
      stableGesture,
      hands,
      classifications[0]?.pinchRatio ?? 1,
      position?.y ?? 0,
    )
    const command: GestureCommand = {
      gesture: stableGesture,
      intensity,
      position,
      timestamp: frame.timestamp,
    }
    return {
      command,
      state: this.createState(
        stableGesture,
        stabilization.candidate,
        intensity,
        stabilization.stability,
        hands.length,
        false,
      ),
    }
  }

  reset(): void {
    this.smoother.reset()
    this.stabilizer.reset()
    this.snapContacts.clear()
    this.snapCommand = null
    this.snapUntil = Number.NEGATIVE_INFINITY
    this.lastSnapAt = Number.NEGATIVE_INFINITY
  }

  private detectSnap(hands: TrackedHand[], timestamp: number): number | null {
    let strongestSnap: number | null = null
    for (const hand of hands) {
      const key = hand.handedness
      const ratio = calculateSnapRatio(hand.landmarks)
      const contact = this.snapContacts.get(key) ?? {
        contactAt: null,
        minimumRatio: Number.POSITIVE_INFINITY,
      }
      if (ratio <= this.thresholds.snapContactRatio) {
        contact.contactAt ??= timestamp
        contact.minimumRatio = Math.min(contact.minimumRatio, ratio)
      } else if (contact.contactAt !== null) {
        const elapsed = timestamp - contact.contactAt
        if (elapsed <= this.thresholds.snapWindowMs && ratio >= this.thresholds.snapReleaseRatio) {
          const releaseEnergy = clamp(
            (ratio - this.thresholds.snapReleaseRatio) /
            Math.max(0.1, 1.35 - this.thresholds.snapReleaseRatio),
          )
          const contactEnergy = clamp(
            1 - contact.minimumRatio / this.thresholds.snapContactRatio,
          )
          const intensity = 0.65 + (releaseEnergy * 0.2 + contactEnergy * 0.15)
          strongestSnap = Math.max(strongestSnap ?? 0, intensity)
          contact.contactAt = null
          contact.minimumRatio = Number.POSITIVE_INFINITY
        } else if (elapsed > this.thresholds.snapWindowMs) {
          contact.contactAt = null
          contact.minimumRatio = Number.POSITIVE_INFINITY
        }
      }
      this.snapContacts.set(key, contact)
    }
    return strongestSnap
  }

  private calculateIntensity(
    gesture: GestureType,
    hands: TrackedHand[],
    pinchRatio: number,
    verticalPosition: number,
  ): number {
    if (gesture === 'PINCH') {
      return clamp(1 - pinchRatio / this.thresholds.pinchExitRatio)
    }
    if (gesture === 'TWO_HAND_EXPANSION') {
      const first = hands[0]?.palmPosition
      const second = hands[1]?.palmPosition
      if (!first || !second) return 0.7
      return clamp(Math.hypot(first.x - second.x, first.y - second.y) * 1.6, 0.55, 1)
    }
    if (gesture === 'PEACE') return clamp(0.55 + Math.abs(verticalPosition) * 0.45)
    if (gesture === 'OPEN_PALM') return 0.72
    if (gesture === 'INDEX_POINT') return 0.68
    if (gesture === 'FIST') return 0.62
    return 0
  }

  private createResult(
    gesture: GestureType,
    candidate: GestureType,
    intensity: number,
    stability: number,
    timestamp: number,
    handCount: number,
  ): GestureControllerResult {
    return {
      command: { gesture, intensity, timestamp },
      state: this.createState(gesture, candidate, intensity, stability, handCount, false),
    }
  }

  private createState(
    gesture: GestureType,
    candidate: GestureType,
    intensity: number,
    stability: number,
    handCount: number,
    isTransient: boolean,
  ): GestureRecognitionState {
    return {
      gesture,
      candidate,
      effect: EFFECT_NAMES[gesture],
      intensity,
      stability,
      handCount,
      tracking: handCount > 0,
      isTransient,
    }
  }
}

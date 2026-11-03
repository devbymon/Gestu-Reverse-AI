import { describe, expect, it } from 'vitest'
import { GestureController } from '../services/gestureController'
import type {
  HandTrackingFrame,
  NormalizedHandLandmark,
  TrackedHand,
} from '../types/handTracking'
import type { GestureType } from '../types/gestures'
import { calculatePalmPosition } from './landmarkUtils'
import { classifyHandGesture } from './gestureRecognition'

type HandPose = 'open' | 'fist' | 'index' | 'peace' | 'pinch' | 'unknown'

const FINGERS = [
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16],
  [17, 18, 19, 20],
] as const

function point(x: number, y: number, z = 0): NormalizedHandLandmark {
  return { x, y, z }
}

function createLandmarks(pose: HandPose, scale = 1, shiftX = 0): NormalizedHandLandmark[] {
  const landmarks = Array.from({ length: 21 }, () => point(0.5, 0.85))
  landmarks[0] = point(0.5, 0.85)
  landmarks[1] = point(0.44, 0.76)
  landmarks[2] = point(0.39, 0.68)
  landmarks[3] = point(0.34, 0.6)
  landmarks[4] = point(0.28, 0.52)
  const extendedByPose: Record<HandPose, boolean[]> = {
    open: [true, true, true, true],
    fist: [false, false, false, false],
    index: [true, false, false, false],
    peace: [true, true, false, false],
    pinch: [true, true, true, true],
    unknown: [true, false, true, false],
  }

  FINGERS.forEach(([mcp, pip, dip, tip], fingerIndex) => {
    const x = 0.38 + fingerIndex * 0.08
    landmarks[mcp] = point(x, 0.68)
    if (extendedByPose[pose][fingerIndex]) {
      landmarks[pip] = point(x, 0.52)
      landmarks[dip] = point(x, 0.38)
      landmarks[tip] = point(x, 0.22)
    } else {
      landmarks[pip] = point(x, 0.59)
      landmarks[dip] = point(x + 0.06, 0.64)
      landmarks[tip] = point(x + 0.1, 0.7)
    }
  })

  if (pose === 'pinch') {
    const indexTip = landmarks[8]!
    landmarks[4] = point(indexTip.x - 0.01, indexTip.y + 0.01)
  }

  return landmarks.map((landmark) => point(
    0.5 + (landmark.x - 0.5) * scale + shiftX,
    0.85 + (landmark.y - 0.85) * scale,
    landmark.z * scale,
  ))
}

function createHand(
  pose: HandPose,
  scale = 1,
  shiftX = 0,
  handedness: TrackedHand['handedness'] = 'Right',
): TrackedHand {
  const landmarks = createLandmarks(pose, scale, shiftX)
  return {
    handedness,
    handednessScore: 1,
    landmarks,
    worldLandmarks: [],
    palmPosition: calculatePalmPosition(landmarks),
  }
}

function createSnapHand(contact: boolean): TrackedHand {
  const hand = createHand('unknown')
  const landmarks = hand.landmarks.map((landmark) => ({ ...landmark }))
  const middleTip = landmarks[12]!
  landmarks[4] = contact
    ? point(middleTip.x - 0.004, middleTip.y + 0.004)
    : point(0.18, 0.62)
  return {
    ...hand,
    landmarks,
    palmPosition: calculatePalmPosition(landmarks),
  }
}

function frame(timestamp: number, ...hands: TrackedHand[]): HandTrackingFrame {
  return { timestamp, hands }
}

function stabilize(
  controller: GestureController,
  gesture: HandPose,
  handCount = 1,
): GestureType {
  let detected: GestureType = 'UNKNOWN'
  for (let index = 0; index < 3; index += 1) {
    const hands = handCount === 2
      ? [createHand(gesture, 1, -0.18, 'Left'), createHand(gesture, 1, 0.18, 'Right')]
      : [createHand(gesture)]
    detected = controller.process(frame(index * 40, ...hands)).state.gesture
  }
  return detected
}

describe('gesture classification', () => {
  it.each<[HandPose, GestureType]>([
    ['fist', 'FIST'],
    ['open', 'OPEN_PALM'],
    ['index', 'INDEX_POINT'],
    ['peace', 'PEACE'],
    ['pinch', 'PINCH'],
    ['unknown', 'UNKNOWN'],
  ])('classifies %s landmarks as %s', (pose, expected) => {
    expect(classifyHandGesture(createHand(pose)).gesture).toBe(expected)
  })

  it('keeps classification stable at different hand scales', () => {
    expect(classifyHandGesture(createHand('open', 0.55)).gesture).toBe('OPEN_PALM')
    expect(classifyHandGesture(createHand('open', 1.45)).gesture).toBe('OPEN_PALM')
  })
})

describe('gesture controller', () => {
  it('requires three consistent frames before changing a continuous gesture', () => {
    const controller = new GestureController()
    expect(controller.process(frame(0, createHand('open'))).state.gesture).toBe('UNKNOWN')
    expect(controller.process(frame(40, createHand('open'))).state.gesture).toBe('UNKNOWN')
    expect(controller.process(frame(80, createHand('open'))).state.gesture).toBe('OPEN_PALM')
    expect(controller.process(frame(120, createHand('fist'))).state.gesture).toBe('OPEN_PALM')
    expect(controller.process(frame(160, createHand('fist'))).state.gesture).toBe('OPEN_PALM')
    let transitioned: GestureType = 'OPEN_PALM'
    for (let index = 0; index < 8; index += 1) {
      transitioned = controller.process(frame(200 + index * 40, createHand('fist'))).state.gesture
      if (transitioned === 'FIST') break
    }
    expect(transitioned).toBe('FIST')
  })

  it('recognizes two open hands after stabilization', () => {
    const controller = new GestureController()
    expect(stabilize(controller, 'open', 2)).toBe('TWO_HAND_EXPANSION')
  })

  it('emits one transient snap and respects its cooldown', () => {
    const controller = new GestureController()
    controller.process(frame(0, createSnapHand(true)))
    const snap = controller.process(frame(120, createSnapHand(false)))
    expect(snap.command.gesture).toBe('SNAP')
    expect(snap.state.isTransient).toBe(true)
    expect(snap.command.direction).toBeUndefined()

    const heldSnap = controller.process(frame(200, createSnapHand(false)))
    expect(heldSnap.command.timestamp).toBe(snap.command.timestamp)

    controller.process(frame(500, createSnapHand(true)))
    const cooldownSnap = controller.process(frame(560, createSnapHand(false)))
    expect(cooldownSnap.command.gesture).not.toBe('SNAP')

    controller.process(frame(800, createSnapHand(true)))
    const nextSnap = controller.process(frame(880, createSnapHand(false)))
    expect(nextSnap.command.gesture).toBe('SNAP')
  })

  it('does not detect a snap when the fingers separate too slowly', () => {
    const controller = new GestureController()
    controller.process(frame(0, createSnapHand(true)))
    const slowRelease = controller.process(frame(500, createSnapHand(false)))
    expect(slowRelease.command.gesture).not.toBe('SNAP')
  })

  it('resets immediately when tracking is lost', () => {
    const controller = new GestureController()
    expect(stabilize(controller, 'peace')).toBe('PEACE')
    const lost = controller.process(frame(200))
    expect(lost.state.gesture).toBe('UNKNOWN')
    expect(lost.state.tracking).toBe(false)
  })
})

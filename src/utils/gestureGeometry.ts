import type { NormalizedHandLandmark, PalmPosition } from '../types/handTracking'

export interface FingerState {
  index: boolean
  middle: boolean
  ring: boolean
  pinky: boolean
}

const FINGER_JOINTS = {
  index: [5, 6, 8],
  middle: [9, 10, 12],
  ring: [13, 14, 16],
  pinky: [17, 18, 20],
} as const

export function distance3D(
  first: NormalizedHandLandmark,
  second: NormalizedHandLandmark,
): number {
  return Math.hypot(first.x - second.x, first.y - second.y, first.z - second.z)
}

export function angleDegrees(
  first: NormalizedHandLandmark,
  vertex: NormalizedHandLandmark,
  third: NormalizedHandLandmark,
): number {
  const firstVector = {
    x: first.x - vertex.x,
    y: first.y - vertex.y,
    z: first.z - vertex.z,
  }
  const secondVector = {
    x: third.x - vertex.x,
    y: third.y - vertex.y,
    z: third.z - vertex.z,
  }
  const firstLength = Math.hypot(firstVector.x, firstVector.y, firstVector.z)
  const secondLength = Math.hypot(secondVector.x, secondVector.y, secondVector.z)
  if (firstLength === 0 || secondLength === 0) return 0
  const cosine = (
    firstVector.x * secondVector.x +
    firstVector.y * secondVector.y +
    firstVector.z * secondVector.z
  ) / (firstLength * secondLength)
  return Math.acos(Math.min(1, Math.max(-1, cosine))) * (180 / Math.PI)
}

export function estimateHandScale(landmarks: NormalizedHandLandmark[]): number {
  const wrist = landmarks[0]
  const middleMcp = landmarks[9]
  const indexMcp = landmarks[5]
  const pinkyMcp = landmarks[17]
  if (!wrist || !middleMcp || !indexMcp || !pinkyMcp) return 0.001
  return Math.max(
    distance3D(wrist, middleMcp),
    distance3D(indexMcp, pinkyMcp),
    0.001,
  )
}

export function getFingerExtensionStates(
  landmarks: NormalizedHandLandmark[],
  extensionAngleDegrees: number,
): FingerState {
  const wrist = landmarks[0]
  const getState = (joints: readonly [number, number, number]) => {
    const mcp = landmarks[joints[0]]
    const pip = landmarks[joints[1]]
    const tip = landmarks[joints[2]]
    if (!wrist || !mcp || !pip || !tip) return false
    const straightEnough = angleDegrees(mcp, pip, tip) >= extensionAngleDegrees
    const reachesAwayFromPalm = distance3D(tip, wrist) > distance3D(pip, wrist) * 1.08
    return straightEnough && reachesAwayFromPalm
  }

  return {
    index: getState(FINGER_JOINTS.index),
    middle: getState(FINGER_JOINTS.middle),
    ring: getState(FINGER_JOINTS.ring),
    pinky: getState(FINGER_JOINTS.pinky),
  }
}

export function countFlexedFingers(
  landmarks: NormalizedHandLandmark[],
  flexionAngleDegrees: number,
): number {
  const wrist = landmarks[0]
  if (!wrist) return 0
  return Object.values(FINGER_JOINTS).filter(([mcpIndex, pipIndex, tipIndex]) => {
    const mcp = landmarks[mcpIndex]
    const pip = landmarks[pipIndex]
    const tip = landmarks[tipIndex]
    if (!mcp || !pip || !tip) return false
    const bent = angleDegrees(mcp, pip, tip) <= flexionAngleDegrees
    const closeToPalm = distance3D(tip, wrist) <= distance3D(pip, wrist) * 1.12
    return bent || closeToPalm
  }).length
}

export function calculatePinchRatio(landmarks: NormalizedHandLandmark[]): number {
  const thumbTip = landmarks[4]
  const indexTip = landmarks[8]
  if (!thumbTip || !indexTip) return Number.POSITIVE_INFINITY
  return distance3D(thumbTip, indexTip) / estimateHandScale(landmarks)
}

export function calculateSnapRatio(landmarks: NormalizedHandLandmark[]): number {
  const thumbTip = landmarks[4]
  const middleTip = landmarks[12]
  if (!thumbTip || !middleTip) return Number.POSITIVE_INFINITY
  return distance3D(thumbTip, middleTip) / estimateHandScale(landmarks)
}

export function normalizedPalmToCommand(position: PalmPosition): { x: number; y: number } {
  return {
    x: Math.min(1, Math.max(-1, (0.5 - position.x) * 2)),
    y: Math.min(1, Math.max(-1, (0.5 - position.y) * 2)),
  }
}

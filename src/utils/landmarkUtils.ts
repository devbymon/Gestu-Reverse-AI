import type {
  NormalizedHandLandmark,
  PalmPosition,
} from '../types/handTracking'

export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20], [0, 17],
]

const PALM_LANDMARKS = [0, 5, 9, 13, 17] as const

export function landmarkDistance(
  first: NormalizedHandLandmark,
  second: NormalizedHandLandmark,
): number {
  return Math.hypot(
    first.x - second.x,
    first.y - second.y,
    first.z - second.z,
  )
}

export function relativeLandmarkDistance(
  landmarks: NormalizedHandLandmark[],
  firstIndex: number,
  secondIndex: number,
): number | null {
  const first = landmarks[firstIndex]
  const second = landmarks[secondIndex]
  const wrist = landmarks[0]
  const middleMcp = landmarks[9]
  if (!first || !second || !wrist || !middleMcp) return null

  const palmScale = landmarkDistance(wrist, middleMcp)
  if (palmScale === 0) return null
  return landmarkDistance(first, second) / palmScale
}

export function calculatePalmPosition(
  landmarks: NormalizedHandLandmark[],
): PalmPosition {
  const palmPoints = PALM_LANDMARKS
    .map((index) => landmarks[index])
    .filter((landmark): landmark is NormalizedHandLandmark => Boolean(landmark))

  if (palmPoints.length === 0) return { x: 0.5, y: 0.5, z: 0 }

  const sum = palmPoints.reduce(
    (position, landmark) => ({
      x: position.x + landmark.x,
      y: position.y + landmark.y,
      z: position.z + landmark.z,
    }),
    { x: 0, y: 0, z: 0 },
  )

  return {
    x: sum.x / palmPoints.length,
    y: sum.y / palmPoints.length,
    z: sum.z / palmPoints.length,
  }
}

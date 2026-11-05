export const BASE_CAMERA_DISTANCE = 7.6

const MIN_ASPECT = 0.42
const MAX_ASPECT = 2.4

function safeAspect(aspect: number): number {
  if (!Number.isFinite(aspect)) return 1
  return Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, aspect))
}

/**
 * Keeps the horizontal world-space field of view stable on portrait screens.
 * Without this compensation, a perspective camera crops wide formations when
 * its aspect ratio drops below 1.
 */
export function getResponsiveCameraDistance(aspect: number): number {
  return BASE_CAMERA_DISTANCE / Math.min(safeAspect(aspect), 1)
}

/** Compensates point size for the extra camera distance used in portrait. */
export function getResponsivePointScale(aspect: number): number {
  return Math.min(1.55, Math.sqrt(1 / Math.min(safeAspect(aspect), 1)))
}

export function getResponsivePixelRatio(
  devicePixelRatio: number,
  viewportWidth: number,
  balanced: boolean,
): number {
  const cap = balanced ? 1.25 : viewportWidth <= 700 ? 1.5 : 1.75
  return Math.min(Math.max(devicePixelRatio, 1), cap)
}

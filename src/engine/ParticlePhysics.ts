const REFERENCE_FRAME_SECONDS = 1 / 60

export interface PhysicsOptions {
  spring: number
  damping: number
  turbulence: number
}

/** Advances flat position/velocity buffers with frame-rate-independent spring physics. */
export function stepParticlePhysics(
  positions: Float32Array,
  velocities: Float32Array,
  targets: Float32Array,
  deltaSeconds: number,
  options: PhysicsOptions,
): void {
  const frameScale = Math.min(deltaSeconds / REFERENCE_FRAME_SECONDS, 2)
  const damping = Math.pow(options.damping, frameScale)
  const spring = options.spring * frameScale
  const turbulence = options.turbulence * frameScale

  for (let index = 0; index < positions.length; index += 1) {
    const noise = (Math.random() - 0.5) * turbulence
    velocities[index] =
      velocities[index] * damping +
      (targets[index] - positions[index]) * spring +
      noise
    positions[index] += velocities[index] * frameScale
  }
}

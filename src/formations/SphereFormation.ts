import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { fibonacciDirection, hash01, writePosition } from '../utils/particleMath'

export class SphereFormation implements ParticleFormation {
  readonly id = 'SPHERE' as const

  generate(targets: Float32Array, context: FormationContext): void {
    const radius = 2.45 - context.intensity * 0.65
    for (let index = 0; index < context.count; index += 1) {
      const direction = fibonacciDirection(index, context.count)
      const volumeRadius = radius * Math.cbrt(0.08 + hash01(index, 4) * 0.92)
      writePosition(
        targets,
        index,
        direction.x * volumeRadius,
        direction.y * volumeRadius,
        direction.z * volumeRadius,
      )
    }
  }
}

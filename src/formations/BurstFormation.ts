import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { fibonacciDirection, hash01, writePosition } from '../utils/particleMath'

export class BurstFormation implements ParticleFormation {
  readonly id = 'ENERGY_BURST' as const

  generate(targets: Float32Array, context: FormationContext): void {
    const reach = 3.8 + context.intensity * 2.1
    for (let index = 0; index < context.count; index += 1) {
      const direction = fibonacciDirection(index, context.count)
      const radius = reach * (0.32 + hash01(index, 41) * 0.68)
      writePosition(
        targets,
        index,
        context.position.x + direction.x * radius,
        context.position.y + direction.y * radius,
        direction.z * radius,
      )
    }
  }
}

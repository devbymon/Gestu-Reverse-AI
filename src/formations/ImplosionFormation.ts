import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { GOLDEN_ANGLE, hash01, writePosition } from '../utils/particleMath'

export class ImplosionFormation implements ParticleFormation {
  readonly id = 'IMPLOSION' as const

  generate(targets: Float32Array, context: FormationContext): void {
    const remainingRadius = Math.max(0.035, (1 - context.intensity) * 0.9)
    for (let index = 0; index < context.count; index += 1) {
      const phase = index * GOLDEN_ANGLE
      const radius = remainingRadius * hash01(index, 47)
      writePosition(
        targets,
        index,
        context.position.x + Math.cos(phase) * radius,
        context.position.y + Math.sin(phase) * radius,
        Math.sin(phase * 0.73) * radius,
      )
    }
  }
}

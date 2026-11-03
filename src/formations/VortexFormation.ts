import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class VortexFormation implements ParticleFormation {
  readonly id = 'VORTEX' as const

  generate(targets: Float32Array, context: FormationContext): void {
    for (let index = 0; index < context.count; index += 1) {
      const progress = index / context.count
      const angle = progress * Math.PI * 30 + hash01(index, 53) * 0.24
      const radius = 0.18 + progress * 2.35
      writePosition(
        targets,
        index,
        context.position.x + Math.cos(angle) * radius,
        context.position.y + (progress - 0.5) * 5.2,
        Math.sin(angle) * radius,
      )
    }
  }
}

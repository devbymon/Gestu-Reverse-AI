import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class SpiralFormation implements ParticleFormation {
  readonly id = 'SPIRAL' as const

  generate(targets: Float32Array, context: FormationContext): void {
    for (let index = 0; index < context.count; index += 1) {
      const progress = index / context.count
      const angle = progress * Math.PI * 16
      const radius = 0.35 + progress * (1.8 + context.intensity * 0.7)
      const thickness = (hash01(index, 31) - 0.5) * 0.25
      writePosition(
        targets,
        index,
        context.position.x + Math.cos(angle) * (radius + thickness),
        context.position.y + (progress - 0.5) * 5.4,
        Math.sin(angle) * (radius + thickness),
      )
    }
  }
}

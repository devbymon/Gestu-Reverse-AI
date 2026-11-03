import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

const ARM_COUNT = 4

export class GalaxyFormation implements ParticleFormation {
  readonly id = 'GALAXY' as const

  generate(targets: Float32Array, context: FormationContext): void {
    for (let index = 0; index < context.count; index += 1) {
      const progress = index / Math.max(1, context.count - 1)
      const radius = Math.pow(progress, 1.55) * 4.2
      const arm = index % ARM_COUNT
      const jitter = (hash01(index, 8) - 0.5) * (0.16 + radius * 0.13)
      const angle = (arm / ARM_COUNT) * Math.PI * 2 + radius * 1.65 + jitter
      const coreHeight = (hash01(index, 15) - 0.5) * (0.5 + radius * 0.12)
      const radialNoise = (hash01(index, 19) - 0.5) * 0.32
      writePosition(
        targets,
        index,
        Math.cos(angle) * (radius + radialNoise),
        coreHeight,
        Math.sin(angle) * (radius + radialNoise),
      )
    }
  }
}

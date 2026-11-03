import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class FalconFormation implements ParticleFormation {
  readonly id = 'FALCON' as const

  generate(targets: Float32Array, context: FormationContext): void {
    const wingLimit = Math.floor(context.count * 0.38)
    const bodyLimit = Math.floor(context.count * 0.67)
    const headLimit = Math.floor(context.count * 0.82)
    const beakLimit = Math.floor(context.count * 0.87)

    for (let index = 0; index < context.count; index += 1) {
      const depth = (hash01(index, 71) - 0.5) * 0.38

      if (index < wingLimit) {
        const side = index % 2 === 0 ? -1 : 1
        const span = Math.sqrt(hash01(index, 73))
        const centerY = 0.15 + span * 1.42 - span * span * 0.28
        const halfThickness = 0.14 + Math.pow(1 - span, 0.8) * 0.48
        const feather = span > 0.48
          ? Math.sin(span * 40 + hash01(index, 79) * 4) * 0.14 * span
          : 0
        const x = side * (0.34 + span * 2.45)
        const y = centerY + (hash01(index, 83) * 2 - 1) * halfThickness + feather
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < bodyLimit) {
        const vertical = hash01(index, 89)
        const normalizedY = vertical * 2 - 1
        const y = -1.2 + vertical * 2.18
        const halfWidth = 0.18 + Math.sqrt(Math.max(0, 1 - normalizedY * normalizedY)) * 0.55
        const x = (hash01(index, 97) * 2 - 1) * halfWidth
        writePosition(targets, index, x, y, depth * 1.5)
        continue
      }

      if (index < headLimit) {
        const angle = hash01(index, 101) * Math.PI * 2
        const radius = Math.sqrt(hash01(index, 103))
        const x = Math.cos(angle) * radius * 0.62
        const y = 1.1 + Math.sin(angle) * radius * 0.56
        writePosition(targets, index, x, y, depth * 1.25)
        continue
      }

      if (index < beakLimit) {
        const height = Math.sqrt(hash01(index, 107))
        const x = (hash01(index, 109) * 2 - 1) * (0.42 * (1 - height) + 0.06)
        const y = 1.12 - height * 0.58
        writePosition(targets, index, x, y, depth * 0.7 + 0.18)
        continue
      }

      const side = index % 2 === 0 ? -1 : 1
      const footParticle = hash01(index, 113) > 0.48
      if (footParticle) {
        const x = side * 0.34 + (hash01(index, 127) * 2 - 1) * 0.42
        const y = -1.87 + (hash01(index, 131) - 0.5) * 0.2
        writePosition(targets, index, x, y, depth * 0.8)
      } else {
        const length = hash01(index, 137)
        const x = side * 0.34 + (hash01(index, 139) - 0.5) * 0.13
        const y = -1.06 - length * 0.78
        writePosition(targets, index, x, y, depth * 0.7)
      }
    }
  }
}

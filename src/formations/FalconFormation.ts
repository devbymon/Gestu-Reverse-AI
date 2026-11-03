import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class FalconFormation implements ParticleFormation {
  readonly id = 'FALCON' as const
  readonly dynamic = true

  generate(targets: Float32Array, context: FormationContext): void {
    this.writeFalcon(targets, context)
  }

  update(targets: Float32Array, context: FormationContext): void {
    this.writeFalcon(targets, context)
  }

  private writeFalcon(targets: Float32Array, context: FormationContext): void {
    const upperWingLimit = Math.floor(context.count * 0.3)
    const lowerWingLimit = Math.floor(context.count * 0.58)
    const bodyLimit = Math.floor(context.count * 0.7)
    const tailLimit = Math.floor(context.count * 0.78)
    const headLimit = Math.floor(context.count * 0.94)
    const flap = Math.sin(context.time * 1.35) * 0.1

    for (let index = 0; index < context.count; index += 1) {
      const depth = (hash01(index, 71) - 0.5) * 0.28

      if (index < upperWingLimit) {
        const reach = Math.sqrt(hash01(index, 73))
        const halfWidth = 0.1 + Math.pow(1 - reach, 0.72) * 0.53
        const feather = reach > 0.5
          ? Math.sin(reach * 44 + hash01(index, 79) * 4) * 0.12 * reach
          : 0
        const x = 0.04 + Math.sin(reach * Math.PI) * 0.58 +
          (hash01(index, 83) * 2 - 1) * halfWidth + feather
        const y = 0.08 + reach * (2.18 + flap)
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < lowerWingLimit) {
        const reach = Math.sqrt(hash01(index, 89))
        const halfWidth = 0.09 + Math.pow(1 - reach, 0.7) * 0.44
        const offset = (hash01(index, 97) * 2 - 1) * halfWidth
        const feather = reach > 0.48
          ? Math.sin(reach * 47 + hash01(index, 101) * 5) * 0.1 * reach
          : 0
        const x = -0.06 - reach * 2.08 + offset * 0.56
        const y = -0.04 - reach * (1.52 - flap) - offset * 0.83 + feather
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < bodyLimit) {
        const length = hash01(index, 103)
        const normalized = length * 2 - 1
        const halfHeight = 0.13 + Math.sqrt(Math.max(0, 1 - normalized * normalized)) * 0.32
        const x = -0.58 + length * 1.85
        const y = 0.06 - length * 0.18 + (hash01(index, 107) * 2 - 1) * halfHeight
        writePosition(targets, index, x, y, depth * 1.4)
        continue
      }

      if (index < tailLimit) {
        const length = hash01(index, 109)
        const split = index % 3 - 1
        const x = 1.02 + length * 1.12
        const y = -0.06 + split * length * 0.34 + (hash01(index, 113) - 0.5) * 0.17
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < headLimit) {
        const angle = hash01(index, 127) * Math.PI * 2
        const radius = Math.sqrt(hash01(index, 131))
        const x = -0.66 + Math.cos(angle) * radius * 0.48
        const y = 0.12 + Math.sin(angle) * radius * 0.4
        writePosition(targets, index, x, y, depth * 1.2)
        continue
      }

      const length = Math.sqrt(hash01(index, 137))
      const x = -0.94 - length * 0.62
      const y = 0.12 + (hash01(index, 139) * 2 - 1) * (0.2 * (1 - length) + 0.03)
      writePosition(targets, index, x, y, depth * 0.55 + 0.12)
    }
  }
}

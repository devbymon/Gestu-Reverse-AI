import type { FormationContext, ParticleFormation } from '../types/particleEffects'
import { hash01, writePosition } from '../utils/particleMath'

export class FalconFormation implements ParticleFormation {
  readonly id = 'FALCON' as const

  generate(targets: Float32Array, context: FormationContext): void {
    this.writeFalcon(targets, context)
  }

  private writeFalcon(targets: Float32Array, context: FormationContext): void {
    const upperWingLimit = Math.floor(context.count * 0.31)
    const sideWingLimit = Math.floor(context.count * 0.54)
    const tailLimit = Math.floor(context.count * 0.68)
    const bodyLimit = Math.floor(context.count * 0.8)
    const headLimit = Math.floor(context.count * 0.92)
    const legLimit = Math.floor(context.count * 0.97)

    for (let index = 0; index < context.count; index += 1) {
      const depth = (hash01(index, 71) - 0.5) * 0.28

      if (index < upperWingLimit) {
        const reach = Math.sqrt(hash01(index, 73))
        const halfWidth = 0.1 + Math.pow(1 - reach, 0.68) * 0.5
        const offset = (hash01(index, 79) * 2 - 1) * halfWidth
        const feather = reach > 0.48
          ? Math.sin(reach * 48 + hash01(index, 83) * 4) * 0.11 * reach
          : 0
        const x = -0.16 + reach * 1.28 + Math.sin(reach * Math.PI) * 0.22 - offset * 0.8
        const y = 0.18 + reach * 1.78 + offset * 0.6 + feather
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < sideWingLimit) {
        const reach = Math.sqrt(hash01(index, 89))
        const halfWidth = 0.1 + Math.pow(1 - reach, 0.74) * 0.42
        const offset = (hash01(index, 97) * 2 - 1) * halfWidth
        const feather = reach > 0.48
          ? Math.sin(reach * 52 + hash01(index, 101) * 5) * 0.11 * reach
          : 0
        const x = -0.08 + reach * 2.16
        const y = 0.22 - reach * 0.16 + offset + feather
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < tailLimit) {
        const length = Math.sqrt(hash01(index, 103))
        const split = index % 3 - 1
        const x = -0.02 + length * (0.72 + split * 0.11) + (hash01(index, 107) - 0.5) * 0.16
        const y = -0.02 - length * 1.58 + split * length * 0.09
        writePosition(targets, index, x, y, depth)
        continue
      }

      if (index < bodyLimit) {
        const length = hash01(index, 109)
        const normalized = length * 2 - 1
        const halfHeight = 0.15 + Math.sqrt(Math.max(0, 1 - normalized * normalized)) * 0.34
        const x = -0.72 + length * 1.18
        const y = 0.08 - length * 0.13 + (hash01(index, 113) * 2 - 1) * halfHeight
        writePosition(targets, index, x, y, depth * 1.4)
        continue
      }

      if (index < headLimit) {
        const beakParticle = hash01(index, 127) > 0.84
        if (beakParticle) {
          const length = Math.sqrt(hash01(index, 131))
          const x = -0.92 - length * 0.52
          const y = 0.22 + (hash01(index, 137) * 2 - 1) * (0.16 * (1 - length) + 0.025)
          writePosition(targets, index, x, y, depth * 0.55 + 0.1)
        } else {
          const angle = hash01(index, 139) * Math.PI * 2
          const radius = Math.sqrt(hash01(index, 149))
          const x = -0.82 + Math.cos(angle) * radius * 0.42
          const y = 0.18 + Math.sin(angle) * radius * 0.37
          writePosition(targets, index, x, y, depth * 1.2)
        }
        continue
      }

      if (index < legLimit) {
        const side = index % 2 === 0 ? -1 : 1
        const length = hash01(index, 151)
        const x = -0.5 + side * 0.13 - length * (0.22 + side * 0.08)
        const y = -0.18 - length * 0.66
        writePosition(targets, index, x, y, depth * 0.65)
        continue
      }

      const toe = index % 3 - 1
      const length = hash01(index, 157)
      const x = -0.72 + toe * length * 0.3 + (hash01(index, 163) - 0.5) * 0.08
      const y = -0.82 - length * 0.08 + Math.abs(toe) * length * 0.04
      writePosition(targets, index, x, y, depth * 0.45)
    }
  }
}

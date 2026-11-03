import type { ParticlePaletteId } from '../types/particles'

export interface ParticlePalette {
  id: ParticlePaletteId
  name: string
  colors: readonly string[]
}

export const PARTICLE_PALETTES: readonly ParticlePalette[] = [
  { id: 'COSMIC', name: 'Cosmic', colors: ['#00e5ff', '#2563eb', '#a855f7'] },
  { id: 'PLASMA', name: 'Plasma', colors: ['#f8fafc', '#ec4899', '#a855f7'] },
  { id: 'AURORA', name: 'Aurora', colors: ['#00e5ff', '#22c55e', '#2563eb'] },
  { id: 'MONOCHROME', name: 'Starlight', colors: ['#f8fafc', '#94a3b8', '#00e5ff'] },
] as const

const PALETTES_BY_ID = new Map(PARTICLE_PALETTES.map((palette) => [palette.id, palette]))

export function getParticlePalette(id: ParticlePaletteId): ParticlePalette {
  return PALETTES_BY_ID.get(id) ?? PARTICLE_PALETTES[0]
}

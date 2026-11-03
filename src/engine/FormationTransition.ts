import { easeInOutCubic } from '../utils/easing'

export class FormationTransition {
  private start = new Float32Array()
  private end = new Float32Array()
  private startedAt = 0
  private duration = 1
  private active = false

  get isActive(): boolean {
    return this.active
  }

  resize(length: number): void {
    this.start = new Float32Array(length)
    this.end = new Float32Array(length)
    this.active = false
  }

  begin(
    currentPositions: Float32Array,
    targetPositions: Float32Array,
    durationSeconds: number,
    currentTime: number,
  ): void {
    if (this.start.length !== currentPositions.length) this.resize(currentPositions.length)
    this.start.set(currentPositions)
    this.end.set(targetPositions)
    this.duration = Math.max(0.05, durationSeconds)
    this.startedAt = currentTime
    this.active = true
  }

  update(output: Float32Array, currentTime: number): boolean {
    if (!this.active) return false
    const progress = (currentTime - this.startedAt) / this.duration
    const eased = easeInOutCubic(progress)
    for (let index = 0; index < output.length; index += 1) {
      output[index] = this.start[index] + (this.end[index] - this.start[index]) * eased
    }
    if (progress >= 1) {
      output.set(this.end)
      this.active = false
    }
    return this.active
  }
}

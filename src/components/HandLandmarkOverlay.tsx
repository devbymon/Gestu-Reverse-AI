import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react'
import type { HandTrackingFrame, TrackedHand } from '../types/handTracking'
import { HAND_CONNECTIONS } from '../utils/landmarkUtils'

export interface HandLandmarkOverlayHandle {
  draw: (frame: HandTrackingFrame) => void
  clear: () => void
}

const HAND_COLORS = {
  Left: '#00e5ff',
  Right: '#a855f7',
  Unknown: '#2563eb',
} as const

interface HandLandmarkOverlayProps {
  visible?: boolean
}

function resizeCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const context = canvas.getContext('2d')
  if (!context) return null
  const rect = canvas.getBoundingClientRect()
  const pixelRatio = Math.min(window.devicePixelRatio, 2)
  const width = Math.max(1, Math.round(rect.width * pixelRatio))
  const height = Math.max(1, Math.round(rect.height * pixelRatio))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
  }
  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  return context
}

function drawHand(
  context: CanvasRenderingContext2D,
  hand: TrackedHand,
  width: number,
  height: number,
): void {
  const color = HAND_COLORS[hand.handedness]
  const point = (index: number) => {
    const landmark = hand.landmarks[index]
    if (!landmark) return null
    return { x: (1 - landmark.x) * width, y: landmark.y * height }
  }

  context.strokeStyle = color
  context.lineWidth = 1.5
  context.globalAlpha = 0.72
  for (const [startIndex, endIndex] of HAND_CONNECTIONS) {
    const start = point(startIndex)
    const end = point(endIndex)
    if (!start || !end) continue
    context.beginPath()
    context.moveTo(start.x, start.y)
    context.lineTo(end.x, end.y)
    context.stroke()
  }

  context.globalAlpha = 1
  for (let index = 0; index < hand.landmarks.length; index += 1) {
    const position = point(index)
    if (!position) continue
    const radius = index === 0 || index === 4 || index % 4 === 0 ? 3.7 : 2.4
    context.beginPath()
    context.arc(position.x, position.y, radius, 0, Math.PI * 2)
    context.fillStyle = index % 4 === 0 ? '#f8fafc' : color
    context.shadowColor = color
    context.shadowBlur = 8
    context.fill()
  }
  context.shadowBlur = 0

  const wrist = point(0)
  if (!wrist) return
  const label = `${hand.handedness} Hand`
  context.font = '600 10px SFMono-Regular, Consolas, monospace'
  const labelWidth = context.measureText(label).width + 14
  const labelX = Math.min(Math.max(wrist.x - labelWidth / 2, 6), width - labelWidth - 6)
  const labelY = Math.min(Math.max(wrist.y + 15, 18), height - 7)
  context.fillStyle = 'rgba(5, 5, 16, 0.8)'
  context.fillRect(labelX, labelY - 13, labelWidth, 18)
  context.strokeStyle = color
  context.strokeRect(labelX, labelY - 13, labelWidth, 18)
  context.fillStyle = color
  context.fillText(label, labelX + 7, labelY)
}

const HandLandmarkOverlay = forwardRef<HandLandmarkOverlayHandle, HandLandmarkOverlayProps>(
  function HandLandmarkOverlay({ visible = true }, forwardedRef) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const clear = useCallback(() => {
      const canvas = canvasRef.current
      const context = canvas?.getContext('2d')
      if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height)
    }, [])

    const draw = useCallback((frame: HandTrackingFrame) => {
      if (!visible) return
      const canvas = canvasRef.current
      if (!canvas) return
      const context = resizeCanvas(canvas)
      if (!context) return
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      context.clearRect(0, 0, width, height)
      frame.hands.forEach((hand) => drawHand(context, hand, width, height))
    }, [visible])

    useEffect(() => {
      if (!visible) clear()
    }, [clear, visible])

    useImperativeHandle(forwardedRef, () => ({ draw, clear }), [clear, draw])

    return (
      <canvas
        ref={canvasRef}
        className="landmark-overlay"
        aria-hidden="true"
        hidden={!visible}
      />
    )
  },
)

export default HandLandmarkOverlay

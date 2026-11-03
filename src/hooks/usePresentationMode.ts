import { useCallback, useEffect, useState } from 'react'

export function usePresentationMode() {
  const [presentationMode, setPresentationMode] = useState(false)
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement))

  useEffect(() => {
    const handleFullscreenChange = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const requestFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.().catch(() => undefined)
    } else {
      await document.exitFullscreen?.().catch(() => undefined)
    }
  }, [])

  const enterPresentation = useCallback(async () => {
    setPresentationMode(true)
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen?.().catch(() => undefined)
    }
  }, [])

  const exitPresentation = useCallback(async () => {
    setPresentationMode(false)
    if (document.fullscreenElement) await document.exitFullscreen?.().catch(() => undefined)
  }, [])

  return {
    presentationMode,
    fullscreen,
    requestFullscreen,
    enterPresentation,
    exitPresentation,
  }
}

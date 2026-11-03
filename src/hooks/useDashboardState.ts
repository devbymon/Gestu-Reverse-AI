import { useCallback, useEffect, useRef, useState } from 'react'
import type { DashboardVisibility } from '../types/dashboard'
import type { ParticleSettings } from '../types/particles'
import { createDefaultParticleSettings, normalizeParticleSettings } from '../utils/particleSettings'

function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem('gestu-onboarding-complete') !== 'true'
  } catch {
    return true
  }
}

const INITIAL_VISIBILITY: DashboardVisibility = {
  sidebar: true,
  cameraPreview: true,
  landmarks: true,
  help: false,
  welcome: isFirstVisit(),
}

export function useDashboardState() {
  const [settings, setSettings] = useState<ParticleSettings>(() => createDefaultParticleSettings())
  const settingsRef = useRef(settings)
  const [visibility, setVisibility] = useState(INITIAL_VISIBILITY)
  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const updateSettings = useCallback((changes: Partial<Omit<ParticleSettings, 'revision'>>) => {
    setSettings((current) => normalizeParticleSettings({
      ...current,
      ...changes,
      revision: current.revision + 1,
    }))
  }, [])

  const resetSettings = useCallback(() => {
    setSettings((current) => createDefaultParticleSettings(current.revision + 1))
  }, [])

  const getSettings = useCallback(() => settingsRef.current, [])

  const setVisible = useCallback((key: keyof DashboardVisibility, value: boolean) => {
    setVisibility((current) => ({ ...current, [key]: value }))
  }, [])

  const dismissWelcome = useCallback(() => {
    try {
      window.localStorage.setItem('gestu-onboarding-complete', 'true')
    } catch {
      // The experience still works when storage is blocked.
    }
    setVisible('welcome', false)
  }, [setVisible])

  return {
    settings,
    visibility,
    updateSettings,
    resetSettings,
    getSettings,
    setVisible,
    dismissWelcome,
  }
}

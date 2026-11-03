import { useCallback, useEffect, useRef, useState } from 'react'
import type { DashboardVisibility } from '../types/dashboard'
import type { ParticleSettings } from '../types/particles'
import { createDefaultParticleSettings, normalizeParticleSettings } from '../utils/particleSettings'

const INITIAL_VISIBILITY: DashboardVisibility = {
  help: false,
  welcome: true,
}

export function useDashboardState() {
  const [settings, setSettings] = useState<ParticleSettings>(() => createDefaultParticleSettings())
  const settingsRef = useRef(settings)
  const [visibility, setVisibility] = useState(INITIAL_VISIBILITY)
  useEffect(() => { settingsRef.current = settings }, [settings])
  const getSettings = useCallback(() => settingsRef.current, [])

  const updateSettings = useCallback((changes: Partial<Omit<ParticleSettings, 'revision'>>) => {
    setSettings((current) => normalizeParticleSettings({
      ...current,
      ...changes,
      revision: current.revision + 1,
    }))
  }, [])

  const setVisible = useCallback((key: keyof DashboardVisibility, value: boolean) => {
    setVisibility((current) => ({ ...current, [key]: value }))
  }, [])

  const dismissWelcome = useCallback(() => {
    setVisible('welcome', false)
  }, [setVisible])

  return {
    settings,
    visibility,
    getSettings,
    updateSettings,
    setVisible,
    dismissWelcome,
  }
}

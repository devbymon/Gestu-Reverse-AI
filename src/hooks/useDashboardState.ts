import { useCallback, useState } from 'react'
import type { DashboardVisibility } from '../types/dashboard'
import { DEFAULT_PARTICLE_SETTINGS } from '../types/particles'

function isFirstVisit(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem('gestu-onboarding-complete') !== 'true'
  } catch {
    return true
  }
}

const INITIAL_VISIBILITY: DashboardVisibility = {
  help: false,
  welcome: isFirstVisit(),
}

export function useDashboardState() {
  const [visibility, setVisibility] = useState(INITIAL_VISIBILITY)
  const getSettings = useCallback(() => DEFAULT_PARTICLE_SETTINGS, [])

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
    visibility,
    getSettings,
    setVisible,
    dismissWelcome,
  }
}

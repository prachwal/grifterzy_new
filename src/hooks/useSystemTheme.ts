import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import { setSystemTheme } from '../store/slices/appSlice'

/**
 * Hook do synchronizacji motywu z systemem
 * Nasłuchuje zmian motywu systemowego i aktualizuje Redux state
 */
export const useSystemTheme = () => {
  const dispatch = useAppDispatch()
  const { settings, systemTheme } = useAppSelector(state => state.app)

  useEffect(() => {
    // Check initial system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const updateSystemTheme = (e: MediaQueryListEvent | MediaQueryList) => {
      dispatch(setSystemTheme(e.matches ? 'dark' : 'light'))
    }

    // Set initial theme
    updateSystemTheme(mediaQuery)

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => updateSystemTheme(e)
    mediaQuery.addEventListener('change', listener)

    return () => {
      mediaQuery.removeEventListener('change', listener)
    }
  }, [dispatch])

  // Calculate actual theme to use
  const actualTheme = settings.theme === 'system' ? systemTheme : settings.theme

  return {
    actualTheme,
    systemTheme,
    isSystemTheme: settings.theme === 'system',
  }
}

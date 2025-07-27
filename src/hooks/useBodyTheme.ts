import { useEffect } from 'react'
import { useSystemTheme } from './useSystemTheme'

/**
 * Hook do zarządzania motywem na poziomie body
 * Dodaje odpowiednie klasy CSS do elementu body
 */
export const useBodyTheme = () => {
    const { actualTheme } = useSystemTheme()

    useEffect(() => {
        const body = document.body

        // Usuń poprzednie klasy motywu
        body.classList.remove('theme-light', 'theme-dark')

        // Dodaj aktualną klasę motywu
        body.classList.add(`theme-${actualTheme}`)

        // Opcjonalnie: ustaw atrybut data-theme dla CSS selektorów
        body.setAttribute('data-theme', actualTheme)

        // Cleanup nie jest potrzebny, ponieważ kolejny useEffect nadpisze klasy
    }, [actualTheme])

    return { actualTheme }
}

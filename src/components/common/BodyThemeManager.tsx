import type { ReactNode } from 'react'
import { useBodyTheme } from '../../hooks/useBodyTheme'

interface BodyThemeManagerProps {
    children: ReactNode
}

/**
 * Komponent zarządzający motywem na poziomie body
 * Automatycznie dodaje odpowiednie klasy CSS do body
 */
export const BodyThemeManager = ({ children }: BodyThemeManagerProps) => {
    useBodyTheme() // Hook automatycznie zarządza klasami body

    return <>{children}</>
}

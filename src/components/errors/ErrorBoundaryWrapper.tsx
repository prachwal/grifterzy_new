import type { ReactNode } from 'react'
import { useSystemTheme } from '../../hooks/useSystemTheme'
import { ErrorBoundary } from './ErrorBoundary'

interface ErrorBoundaryWrapperProps {
    children: ReactNode
}

export const ErrorBoundaryWrapper = ({ children }: ErrorBoundaryWrapperProps) => {
    const { actualTheme } = useSystemTheme()

    return (
        <ErrorBoundary isDarkTheme={actualTheme === 'dark'}>
            {children}
        </ErrorBoundary>
    )
}

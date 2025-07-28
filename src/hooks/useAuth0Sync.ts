import { useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useAppDispatch, useAppSelector } from '../store'
import {
    setAccessToken,
    setIdToken,
    setIdTokenClaims,
    setUser,
    setLoading,
    setError,
    setAuthenticated,
    clearAuth,
    selectAccessToken,
    selectIsTokenValid
} from '../store/slices/authSlice'

/**
 * Hook do synchronizacji stanu Auth0 z Redux store
 * Automatycznie aktualizuje store z tokenami i danymi użytkownika
 */
export const useAuth0Sync = () => {
    const dispatch = useAppDispatch()
    const {
        user,
        isAuthenticated,
        isLoading,
        error,
        getAccessTokenSilently,
        getIdTokenClaims
    } = useAuth0()

    const storedAccessToken = useAppSelector(selectAccessToken)
    const isTokenValid = useAppSelector(selectIsTokenValid)

    // Synchronizuj podstawowe dane Auth0 z store
    useEffect(() => {
        dispatch(setUser(user || null))
        dispatch(setAuthenticated(isAuthenticated))
        dispatch(setLoading(isLoading))

        if (error) {
            dispatch(setError(error.message))
        }

        // Clear auth data when not authenticated
        if (!isAuthenticated) {
            dispatch(clearAuth())
        }
    }, [user, isAuthenticated, isLoading, error, dispatch])

    // Pobierz i zapisz tokeny gdy użytkownik jest zalogowany
    useEffect(() => {
        if (isAuthenticated && (!storedAccessToken || !isTokenValid)) {
            console.log('🔄 Synchronizing tokens with Redux store...')

            // Pobierz Access Token
            getAccessTokenSilently()
                .then(token => {
                    console.log('✅ Access Token retrieved and stored in Redux')

                    // Dekoduj token żeby pobrać expiry
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]))
                        dispatch(setAccessToken({
                            token,
                            expiry: payload.exp
                        }))
                    } catch {
                        dispatch(setAccessToken({ token }))
                    }
                })
                .catch(tokenError => {
                    console.error('❌ Failed to get access token:', tokenError)
                    dispatch(setError(tokenError.message))
                })

            // Pobierz ID Token Claims
            getIdTokenClaims()
                .then(claims => {
                    console.log('✅ ID Token Claims retrieved and stored in Redux')
                    dispatch(setIdTokenClaims(claims))

                    if (claims?.__raw) {
                        dispatch(setIdToken(claims.__raw))
                    }
                })
                .catch(claimsError => {
                    console.error('❌ Failed to get ID token claims:', claimsError)
                    dispatch(setError(claimsError.message))
                })
        }
    }, [isAuthenticated, storedAccessToken, isTokenValid, getAccessTokenSilently, getIdTokenClaims, dispatch])

    return {
        // Re-export Auth0 data for convenience
        user,
        isAuthenticated,
        isLoading,
        error
    }
}

/**
 * Hook do pobierania tokenów z Redux store
 * Używaj tego do wywołań API
 */
export const useAuthTokens = () => {
    const accessToken = useAppSelector(selectAccessToken)
    const isTokenValid = useAppSelector(selectIsTokenValid)
    const { getAccessTokenSilently } = useAuth0()
    const dispatch = useAppDispatch()

    /**
     * Pobiera ważny access token - z store lub odświeża przez Auth0
     */
    const getValidAccessToken = async (): Promise<string | null> => {
        // Jeśli mamy ważny token w store, użyj go
        if (accessToken && isTokenValid) {
            return accessToken
        }

        // Inaczej pobierz nowy token
        try {
            console.log('🔄 Refreshing access token...')
            const newToken = await getAccessTokenSilently()

            // Dekoduj token żeby pobrać expiry
            try {
                const payload = JSON.parse(atob(newToken.split('.')[1]))
                dispatch(setAccessToken({
                    token: newToken,
                    expiry: payload.exp
                }))
            } catch {
                dispatch(setAccessToken({ token: newToken }))
            }

            return newToken
        } catch (error: any) {
            console.error('❌ Failed to refresh access token:', error)
            dispatch(setError(error.message))
            return null
        }
    }

    return {
        accessToken,
        isTokenValid,
        getValidAccessToken
    }
}

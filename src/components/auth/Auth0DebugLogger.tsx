import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useRef } from 'react'

export const Auth0DebugLogger = () => {
    const {
        isLoading,
        isAuthenticated,
        user,
        error,
        getAccessTokenSilently,
        getIdTokenClaims
    } = useAuth0()

    const previousValues = useRef({
        isLoading,
        isAuthenticated,
        user,
        error
    })

    useEffect(() => {
        const prev = previousValues.current
        const hasChanged = {
            isLoading: prev.isLoading !== isLoading,
            isAuthenticated: prev.isAuthenticated !== isAuthenticated,
            user: prev.user !== user,
            error: prev.error !== error
        }

        if (Object.values(hasChanged).some(Boolean)) {
            console.group('🔍 Auth0 State Change Detected')
            console.log('📊 Previous State:', prev)
            console.log('📊 Current State:', { isLoading, isAuthenticated, user, error })
            console.log('🔄 Changes:', hasChanged)

            // Szczegółowe logowanie błędów
            if (error && hasChanged.error) {
                console.group('🚨 NEW ERROR DETECTED')
                console.error('Error Type:', error.constructor.name)
                console.error('Error Name:', error.name)
                console.error('Error Message:', error.message)
                console.error('Error Stack:', error.stack)
                console.error('Full Error Object:', error)

                // Sprawdź czy to Auth0 error z dodatkowymi properties
                if ('error' in error) {
                    console.error('Auth0 Error Code:', (error as any).error)
                }
                if ('error_description' in error) {
                    console.error('Auth0 Error Description:', (error as any).error_description)
                }
                if ('state' in error) {
                    console.error('Auth0 State:', (error as any).state)
                }

                console.groupEnd()
            }

            // Logowanie gdy użytkownik się zaloguje
            if (isAuthenticated && !prev.isAuthenticated) {
                console.group('✅ USER AUTHENTICATED')
                console.log('👤 User Details:', user)

                // Spróbuj pobrać token dostępu
                getAccessTokenSilently()
                    .then(token => {
                        console.log('🎫 Access Token Retrieved:', token.substring(0, 50) + '...')
                    })
                    .catch(tokenError => {
                        console.error('❌ Failed to get access token:', tokenError)
                    })

                // Spróbuj pobrać ID token claims
                getIdTokenClaims()
                    .then(claims => {
                        console.log('🆔 ID Token Claims:', claims)
                    })
                    .catch(claimsError => {
                        console.error('❌ Failed to get ID token claims:', claimsError)
                    })

                console.groupEnd()
            }

            // Logowanie gdy użytkownik się wyloguje
            if (!isAuthenticated && prev.isAuthenticated) {
                console.group('👋 USER LOGGED OUT')
                console.log('Previous user was:', prev.user)
                console.groupEnd()
            }

            console.groupEnd()

            // Update previous values
            previousValues.current = { isLoading, isAuthenticated, user, error }
        }
    }, [isLoading, isAuthenticated, user, error, getAccessTokenSilently, getIdTokenClaims])

    // Logowanie wszystkich Network requests
    useEffect(() => {
        const originalFetch = window.fetch

        window.fetch = async (...args) => {
            const [url, options] = args

            // Loguj tylko Auth0 requests
            if (typeof url === 'string' && url.includes('auth0')) {
                console.group('🌐 Auth0 Network Request')
                console.log('📍 URL:', url)
                console.log('⚙️ Options:', options)
                console.log('🕒 Timestamp:', new Date().toISOString())

                try {
                    const response = await originalFetch(...args)
                    console.log('✅ Response Status:', response.status)
                    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()))

                    // Clone response to read body
                    const clonedResponse = response.clone()
                    const contentType = response.headers.get('content-type')

                    if (contentType?.includes('application/json')) {
                        try {
                            const responseBody = await clonedResponse.json()
                            console.log('📄 Response Body:', responseBody)
                        } catch {
                            console.log('📄 Response Body: [Could not parse as JSON]')
                        }
                    }

                    console.groupEnd()
                    return response
                } catch (error) {
                    console.error('❌ Network Error:', error)
                    console.groupEnd()
                    throw error
                }
            }

            return originalFetch(...args)
        }

        return () => {
            window.fetch = originalFetch
        }
    }, [])

    return null // Ten komponent nie renderuje nic, tylko loguje
}

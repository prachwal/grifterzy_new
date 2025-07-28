import type { ReactNode } from 'react'
import { Auth0Provider } from '@auth0/auth0-react'

interface Auth0ProviderWrapperProps {
    children: ReactNode
}

export const Auth0ProviderWrapper = ({ children }: Auth0ProviderWrapperProps) => {
    const domain = import.meta.env.VITE_AUTH0_DOMAIN
    const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID
    const redirectUri = import.meta.env.VITE_AUTH0_REDIRECT_URI
    const audience = import.meta.env.VITE_AUTH0_AUDIENCE

    console.group('🔐 Auth0 Configuration')
    console.log('📍 Current URL:', window.location.href)
    console.log('🔑 Domain:', domain)
    console.log('🆔 Client ID:', clientId)
    console.log('🔄 Redirect URI:', redirectUri)
    console.log('👤 Audience:', audience || 'None')
    console.log('🌐 Window Origin:', window.location.origin)
    console.log('📊 Query Params:', window.location.search)
    console.groupEnd()

    if (!domain || !clientId) {
        console.error('❌ Auth0 environment variables not configured')
        console.log('Missing:', { domain: !domain, clientId: !clientId })
        return <>{children}</>
    }

    // Aggressive cache clearing - remove ALL Auth0 related data
    const clearAuth0Cache = () => {
        console.group('🧹 Clearing Auth0 Cache')
        let localStorageKeys: string[] = []
        let sessionStorageKeys: string[] = []

        // Log localStorage keys
        Object.keys(localStorage).forEach(key => {
            if (key.includes('@@auth0') || key.includes('auth0') || key.includes(clientId)) {
                localStorageKeys.push(key)
                localStorage.removeItem(key)
            }
        })

        // Log sessionStorage keys
        Object.keys(sessionStorage).forEach(key => {
            if (key.includes('@@auth0') || key.includes('auth0') || key.includes(clientId)) {
                sessionStorageKeys.push(key)
                sessionStorage.removeItem(key)
            }
        })

        console.log('🗑️ Removed localStorage keys:', localStorageKeys)
        console.log('🗑️ Removed sessionStorage keys:', sessionStorageKeys)
        console.groupEnd()
    }

    // Check if this is an Auth0 callback
    const urlParams = new URLSearchParams(window.location.search)
    const isAuth0Callback = urlParams.has('code') && urlParams.has('state')

    console.group('🔍 Auth0 Callback Detection')
    console.log('📊 URL Params:', Object.fromEntries(urlParams.entries()))
    console.log('🎯 Is Auth0 Callback:', isAuth0Callback)
    console.log('📄 Has code:', urlParams.has('code'))
    console.log('📄 Has state:', urlParams.has('state'))
    console.groupEnd()

    // Only clear cache if it's NOT an Auth0 callback
    if (window.location.search && !isAuth0Callback) {
        console.log('🔍 Non-Auth0 URL parameters detected, clearing cache')
        clearAuth0Cache()
        // Clean URL
        console.log('🧼 Cleaning URL from:', window.location.href)
        window.history.replaceState({}, document.title, window.location.pathname)
        console.log('✨ URL cleaned to:', window.location.href)
    } else if (isAuth0Callback) {
        console.log('🔐 Auth0 callback detected - preserving URL parameters for processing')
    }

    console.group('🚀 Initializing Auth0Provider')
    console.log('📦 Provider Config:')
    console.table({
        domain,
        clientId,
        redirectUri: redirectUri || window.location.origin,
        audience: audience || 'undefined',
        cacheLocation: 'memory',
        useRefreshTokens: false,
        scope: 'openid profile email'
    })
    console.groupEnd()

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={{
                redirect_uri: redirectUri || window.location.origin,
                scope: "openid profile email",
                ...(audience && { audience }),
            }}
            useRefreshTokens={false}
            cacheLocation="memory"
            onRedirectCallback={(appState) => {
                console.group('🔄 Auth0 Redirect Callback')
                console.log('📊 App State:', appState)
                console.log('🌐 Current URL:', window.location.href)
                console.log('📍 Redirect Target:', appState?.returnTo || window.location.origin)
                console.log('🔍 Search Params:', window.location.search)
                console.log('🔗 Hash:', window.location.hash)
                console.groupEnd()

                // Navigate to the intended URL or home
                window.location.assign(appState?.returnTo || window.location.origin)
            }}
        >
            {children}
        </Auth0Provider>
    )
}

import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
    accessToken: string | null
    idToken: string | null
    idTokenClaims: any | null
    user: any | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
    tokenExpiry: number | null
}

const initialState: AuthState = {
    accessToken: null,
    idToken: null,
    idTokenClaims: null,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    tokenExpiry: null
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAccessToken: (state, action: PayloadAction<{ token: string; expiry?: number }>) => {
            state.accessToken = action.payload.token
            state.tokenExpiry = action.payload.expiry || null
            state.error = null
        },

        setIdToken: (state, action: PayloadAction<string>) => {
            state.idToken = action.payload
            state.error = null
        },

        setIdTokenClaims: (state, action: PayloadAction<any>) => {
            state.idTokenClaims = action.payload
            state.error = null
        },

        setUser: (state, action: PayloadAction<any>) => {
            state.user = action.payload
            state.isAuthenticated = !!action.payload
            state.error = null
        },

        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload
        },

        setError: (state, action: PayloadAction<string>) => {
            state.error = action.payload
        },

        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload
            if (!action.payload) {
                // Clear tokens when not authenticated
                state.accessToken = null
                state.idToken = null
                state.idTokenClaims = null
                state.user = null
                state.tokenExpiry = null
            }
        },

        clearTokens: (state) => {
            state.accessToken = null
            state.idToken = null
            state.idTokenClaims = null
            state.tokenExpiry = null
            state.error = null
        },

        clearAuth: (state) => {
            Object.assign(state, initialState)
        }
    }
})

export const {
    setAccessToken,
    setIdToken,
    setIdTokenClaims,
    setUser,
    setLoading,
    setError,
    setAuthenticated,
    clearTokens,
    clearAuth
} = authSlice.actions

// Selectors - funkcje do pobierania określonych części stanu autoryzacji z globalnego Redux store
// Każdy selektor to pure function, która pobiera konkretną część stanu bez side effects

/**
 * Pobiera token dostępu Auth0 (JWT)
 * @returns string | null - Używany do autoryzacji API calls, dodawany jako Bearer token w headers
 */
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken

/**
 * Pobiera token tożsamości Auth0 (zawiera dane użytkownika)
 * @returns string | null - Do weryfikacji tożsamości użytkownika, rzadziej używany w API calls
 */
export const selectIdToken = (state: { auth: AuthState }) => state.auth.idToken

/**
 * Pobiera zdekodowane dane z ID Token (payload JWT)
 * @returns any | null - Zawiera: sub, email, name, picture, iss, aud, exp, etc.
 */
export const selectIdTokenClaims = (state: { auth: AuthState }) => state.auth.idTokenClaims

/**
 * Pobiera kompletne dane użytkownika z Auth0
 * @returns any | null - Profil użytkownika, metadane, custom claims
 */
export const selectUser = (state: { auth: AuthState }) => state.auth.user

/**
 * Pobiera status autoryzacji
 * @returns boolean - Do conditional rendering (pokazuj/ukryj komponenty)
 */
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated

/**
 * Pobiera stan ładowania Auth0
 * @returns boolean - Do wyświetlania spinnerów/loading states
 */
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading

/**
 * Pobiera komunikaty błędów autoryzacji
 * @returns string | null - Do wyświetlania error messages użytkownikowi
 */
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error

/**
 * Pobiera timestamp wygaśnięcia tokenu
 * @returns number | null - Unix timestamp do sprawdzania czy token jest aktualny
 */
export const selectTokenExpiry = (state: { auth: AuthState }) => state.auth.tokenExpiry

/**
 * Helper selector - sprawdza czy token jest aktualny (nie wygasł)
 * @returns boolean - false jeśli brak tokenu lub wygasł, true jeśli aktualny
 */
export const selectIsTokenValid = (state: { auth: AuthState }) => {
    const { accessToken, tokenExpiry } = state.auth
    if (!accessToken) return false
    if (!tokenExpiry) return true // No expiry info, assume valid
    return Date.now() < tokenExpiry * 1000 // Convert to milliseconds
}

export default authSlice.reducer

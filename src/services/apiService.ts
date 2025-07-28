import { store } from '../store'
import { selectAccessToken, selectIsTokenValid } from '../store/slices/authSlice'

/**
 * Serwis API z automatycznym dodawaniem Auth0 tokenów
 */
class ApiService {
    private baseURL: string

    constructor(baseURL: string = '') {
        this.baseURL = baseURL
    }

    /**
     * Pobiera ważny access token z Redux store
     */
    private getAuthToken(): string | null {
        const state = store.getState()
        const accessToken = selectAccessToken(state)
        const isTokenValid = selectIsTokenValid(state)

        if (!accessToken || !isTokenValid) {
            console.warn('⚠️ No valid access token available for API call')
            return null
        }

        return accessToken
    }

    /**
     * Wykonuje authenticated request z automatycznym dodaniem Bearer token
     */
    private async authenticatedFetch(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<Response> {
        const token = this.getAuthToken()

        if (!token) {
            throw new Error('No valid authentication token available')
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        }

        const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint

        console.log('🌐 Making authenticated API call:', { url, method: options.method || 'GET' })

        return fetch(url, {
            ...options,
            headers,
        })
    }

    /**
     * GET request z automatyczną autoryzacją
     */
    async get<T = any>(endpoint: string): Promise<T> {
        const response = await this.authenticatedFetch(endpoint, {
            method: 'GET',
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    /**
     * POST request z automatyczną autoryzacją
     */
    async post<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.authenticatedFetch(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    /**
     * PUT request z automatyczną autoryzacją
     */
    async put<T = any>(endpoint: string, data?: any): Promise<T> {
        const response = await this.authenticatedFetch(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    /**
     * DELETE request z automatyczną autoryzacją
     */
    async delete<T = any>(endpoint: string): Promise<T> {
        const response = await this.authenticatedFetch(endpoint, {
            method: 'DELETE',
        })

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`)
        }

        return response.json()
    }

    /**
     * Test endpoint - sprawdza czy token działa
     */
    async testAuth(): Promise<{ valid: boolean; token?: string; userInfo?: any }> {
        const token = this.getAuthToken()

        if (!token) {
            return { valid: false }
        }

        try {
            // Użyj mock serwera lub lokalnej funkcji Netlify do walidacji
            const baseUrl = import.meta.env.VITE_USE_MOCK_SERVER === 'true'
                ? 'http://localhost:8888'
                : ''
            const response = await fetch(`${baseUrl}/.netlify/functions/validate-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            })

            if (response.ok) {
                const result = await response.json()
                return {
                    valid: result.success,
                    token: token.substring(0, 20) + '...',
                    userInfo: result.payload
                }
            } else {
                const errorResult = await response.json()
                console.error('Token validation failed:', errorResult)
                return {
                    valid: false,
                    token: token.substring(0, 20) + '...',
                    userInfo: errorResult
                }
            }
        } catch (error) {
            console.error('Auth test failed:', error)
            return { valid: false }
        }
    }

    /**
     * Test różnych metod walidacji tokenu
     */
    async testAllAuthMethods(): Promise<{
        netlifyFunction: { valid: boolean; response?: any }
        authorizationHeader: { valid: boolean; response?: any }
        queryParameter: { valid: boolean; response?: any }
    }> {
        const token = this.getAuthToken()

        if (!token) {
            return {
                netlifyFunction: { valid: false },
                authorizationHeader: { valid: false },
                queryParameter: { valid: false }
            }
        }

        const results = {
            netlifyFunction: { valid: false, response: undefined as any },
            authorizationHeader: { valid: false, response: undefined as any },
            queryParameter: { valid: false, response: undefined as any }
        }

        const baseUrl = import.meta.env.VITE_USE_MOCK_SERVER === 'true'
            ? 'http://localhost:8888'
            : ''

        try {
            // Test 1: POST body
            const postResponse = await fetch(`${baseUrl}/.netlify/functions/validate-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token })
            })
            results.netlifyFunction = {
                valid: postResponse.ok,
                response: await postResponse.json()
            }
        } catch (error) {
            results.netlifyFunction = { valid: false, response: { error: String(error) } }
        }

        try {
            // Test 2: Authorization header
            const headerResponse = await fetch(`${baseUrl}/.netlify/functions/validate-token`, {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${token}` }
            })
            results.authorizationHeader = {
                valid: headerResponse.ok,
                response: await headerResponse.json()
            }
        } catch (error) {
            results.authorizationHeader = { valid: false, response: { error: String(error) } }
        }

        try {
            // Test 3: Query parameter
            const queryResponse = await fetch(`${baseUrl}/.netlify/functions/validate-token?token=${encodeURIComponent(token)}`)
            results.queryParameter = {
                valid: queryResponse.ok,
                response: await queryResponse.json()
            }
        } catch (error) {
            results.queryParameter = { valid: false, response: { error: String(error) } }
        }

        return results
    }
}

// Eksportuj gotowe instancje dla różnych API
export const apiService = new ApiService()

// Przykład dla różnych backend API
export const backendAPI = new ApiService(import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api')
export const auth0ManagementAPI = new ApiService(`https://${import.meta.env.VITE_AUTH0_DOMAIN}`)

export default ApiService

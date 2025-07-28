# 🔐 Infrastruktura Autoryzacji JWT

## Przegląd

Kompletny system zarządzania tokenami JWT w aplikacji React z Auth0, Redux Store i Netlify Functions.

## 📁 Architektura Plików

### Komponenty UI
- `src/components/AuthTestPanel.tsx` - Panel do testowania różnych metod autoryzacji
- `src/pages/ProfilePage.tsx` - Strona profilu z pełnymi danymi użytkownika i JWT

### Zarządzanie Stanem
- `src/store/slices/authSlice.ts` - Redux slice z tokenami i synchronizacją Auth0
- `src/hooks/useAuth0Sync.ts` - Hook synchronizujący Auth0 z Redux store

### Usługi API
- `src/services/apiService.ts` - Serwis z automatyczną autoryzacją Bearer token
- `netlify/functions/validate-token.mts` - Serverless funkcja walidacji JWT

## 🔄 Przepływ Autoryzacji

### 1. Logowanie
```typescript
// Auth0 automatycznie zarządza procesem OAuth
const { loginWithRedirect } = useAuth0()
await loginWithRedirect()
```

### 2. Synchronizacja z Redux
```typescript
// Hook automatycznie pobiera tokeny z Auth0 i zapisuje w Redux
const { accessToken, idToken } = useAuthTokens()
```

### 3. Wywołania API
```typescript
// Automatyczna autoryzacja z Redux store
import { apiService } from '../services/apiService'

// Token jest automatycznie dodawany do nagłówków
const data = await apiService.get('/api/protected-endpoint')
const result = await apiService.post('/api/save-data', { name: 'test' })
```

### 4. Walidacja po stronie serwera
```typescript
// Netlify function waliduje token JWT
// Obsługuje 3 metody przekazywania tokenu:
// 1. POST body: { "token": "..." }
// 2. Authorization header: "Bearer ..."
// 3. Query parameter: ?token=...
```

## 🛠️ Komponenty Systemu

### AuthTestPanel

Interaktywny panel do testowania autoryzacji:

```tsx
import AuthTestPanel from '../components/AuthTestPanel'

<AuthTestPanel />
```

**Funkcje:**
- Test podstawowy (POST JSON)
- Test Authorization Header (Bearer)
- Test Query Parameter
- Wyświetlanie wyników z payload JWT
- Status każdej metody autoryzacji

### ApiService

Centralna klasa do wywołań API z automatyczną autoryzacją:

```typescript
class ApiService {
    // Automatyczne dodawanie Bearer token z Redux store
    private getAuthToken(): string | null
    
    // Uniwersalne wywołania z autoryzacją
    async get<T>(endpoint: string): Promise<T>
    async post<T>(endpoint: string, data?: any): Promise<T>
    async put<T>(endpoint: string, data?: any): Promise<T>
    async delete<T>(endpoint: string): Promise<T>
    
    // Testowanie autoryzacji
    async testAuth(): Promise<AuthTestResult>
    async testAllAuthMethods(): Promise<AllAuthMethodsResult>
}
```

### Redux AuthSlice

Zarządzanie stanem autoryzacji:

```typescript
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

// Selektory Redux - funkcje do pobierania określonych części stanu autoryzacji
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken
export const selectIdToken = (state: { auth: AuthState }) => state.auth.idToken
export const selectIdTokenClaims = (state: { auth: AuthState }) => state.auth.idTokenClaims
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectTokenExpiry = (state: { auth: AuthState }) => state.auth.tokenExpiry
export const selectIsTokenValid = (state: { auth: AuthState }) => {
    const { accessToken, tokenExpiry } = state.auth
    if (!accessToken) return false
    if (!tokenExpiry) return true // No expiry info, assume valid
    return Date.now() < tokenExpiry * 1000 // Convert to milliseconds
}

// Użycie w komponentach
const accessToken = useAppSelector(selectAccessToken)      // string | null - Token dostępu Auth0 (JWT)
const idToken = useAppSelector(selectIdToken)              // string | null - Token tożsamości Auth0
const idTokenClaims = useAppSelector(selectIdTokenClaims)  // any | null - Zdekodowane dane z ID Token
const user = useAppSelector(selectUser)                    // any | null - Kompletne dane użytkownika
const isAuthenticated = useAppSelector(selectIsAuthenticated) // boolean - Status autoryzacji
const isLoading = useAppSelector(selectIsLoading)          // boolean - Stan ładowania Auth0
const error = useAppSelector(selectAuthError)              // string | null - Komunikaty błędów
const tokenExpiry = useAppSelector(selectTokenExpiry)      // number | null - Timestamp wygaśnięcia
const isTokenValid = useAppSelector(selectIsTokenValid)    // boolean - Czy token jest aktualny
```

#### 🔍 Szczegóły selektorów:

- **`selectAccessToken`** - Pobiera token dostępu Auth0 (JWT) używany do autoryzacji API calls
- **`selectIdToken`** - Pobiera token tożsamości Auth0 zawierający dane użytkownika  
- **`selectIdTokenClaims`** - Pobiera zdekodowane dane z ID Token (payload JWT): `sub`, `email`, `name`, `picture`, etc.
- **`selectUser`** - Pobiera kompletne dane użytkownika z Auth0 (profil, metadane, custom claims)
- **`selectIsAuthenticated`** - Pobiera status autoryzacji (boolean) do conditional rendering
- **`selectIsLoading`** - Pobiera stan ładowania Auth0 do wyświetlania spinnerów
- **`selectAuthError`** - Pobiera komunikaty błędów autoryzacji do wyświetlania użytkownikowi
- **`selectTokenExpiry`** - Pobiera timestamp wygaśnięcia tokenu (Unix timestamp)
- **`selectIsTokenValid`** - Helper sprawdzający czy token jest aktualny (nie wygasł)

### Netlify Validation Function

Serverless funkcja do walidacji JWT:

```typescript
// URL: /.netlify/functions/validate-token
// Metody: POST, GET, OPTIONS (CORS)

// Obsługiwane formaty:
// 1. POST { "token": "eyJ..." }
// 2. GET ?token=eyJ...
// 3. GET headers: { "Authorization": "Bearer eyJ..." }

// Zwraca:
{
    "success": true,
    "valid": true,
    "payload": { /* dekodowany JWT */ },
    "token": "eyJ...",
    "method": "POST"
}
```

## 🔧 Konfiguracja

### Environment Variables

```env
# Auth0 konfiguracja
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=https://your-api.com

# API endpoints (opcjonalne)
VITE_API_BASE_URL=http://localhost:8000/api
```

### Package Dependencies

```json
{
    "@auth0/auth0-react": "^2.4.0",
    "@reduxjs/toolkit": "^2.3.0",
    "react-redux": "^9.1.2",
    "antd": "^5.21.6"
}
```

## 📋 Użycie w Kodzie

### 1. Sprawdzanie autoryzacji

```tsx
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated, selectIsTokenValid } from '../store/slices/authSlice'

const isAuthenticated = useAppSelector(selectIsAuthenticated)
const isTokenValid = useAppSelector(selectIsTokenValid)

if (isAuthenticated && isTokenValid) {
    // Użytkownik zalogowany z ważnym tokenem
}
```

### 2. Dostęp do danych użytkownika

```tsx
import { selectUser, selectIdTokenClaims } from '../store/slices/authSlice'

const user = useAppSelector(selectUser)
const claims = useAppSelector(selectIdTokenClaims)

// Wyświetl dane użytkownika
console.log('User email:', user?.email)
console.log('User name:', claims?.name)
console.log('Token issuer:', claims?.iss)
```

### 3. Obsługa stanów ładowania i błędów

```tsx
import { selectIsLoading, selectAuthError } from '../store/slices/authSlice'

const isLoading = useAppSelector(selectIsLoading)
const error = useAppSelector(selectAuthError)

if (isLoading) {
    return <Spinner />
}

if (error) {
    return <Alert type="error" message={error} />
}
```

### 2. Dostęp do tokenów

```tsx
import { useAuthTokens } from '../hooks/useAuth0Sync'

const { accessToken, idToken } = useAuthTokens()

// Lub z Redux selektorów
const accessToken = useAppSelector(selectAccessToken)
```

### 3. Wywołania API

```tsx
import { apiService } from '../services/apiService'

// Automatyczna autoryzacja
try {
    const userData = await apiService.get('/api/user/profile')
    const updateResult = await apiService.put('/api/user/profile', newData)
} catch (error) {
    // Obsługa błędów (401, 403, itd.)
}
```

### 4. Testowanie autoryzacji

```tsx
import { apiService } from '../services/apiService'

// Test podstawowy
const result = await apiService.testAuth()
console.log('Token valid:', result.valid)

// Test wszystkich metod
const allResults = await apiService.testAllAuthMethods()
console.log('POST method:', allResults.netlifyFunction.valid)
console.log('Bearer header:', allResults.authorizationHeader.valid)
console.log('Query param:', allResults.queryParameter.valid)
```

## 🔍 Debugging

### Logowanie Auth0

System zawiera kompletne logowanie Auth0 w `src/components/Auth0DebugLogger.tsx`:

- Stan autoryzacji w czasie rzeczywistym
- Szczegóły tokenów JWT
- Błędy i ostrzeżenia Auth0
- Monitoring zmian stanu

### Network Requests

Wszystkie wywołania API są logowane z detalami:

```typescript
console.log('🌐 Making authenticated API call:', { 
    url, 
    method, 
    hasToken: !!token 
})
```

### Token Validation

Panel testowy pokazuje:
- Status walidacji każdej metody
- Payload dekodowanego JWT
- Błędy komunikacji z serverem
- Czas odpowiedzi funkcji Netlify

## 🚀 Deployment

### Netlify

```bash
# Build i deploy
npm run build
netlify deploy --prod

# Deploy tylko funkcji
netlify functions:deploy
```

### Environment Production

```env
# Production Auth0
VITE_AUTH0_DOMAIN=production-domain.auth0.com
VITE_AUTH0_CLIENT_ID=production-client-id
VITE_AUTH0_AUDIENCE=https://api.production.com
```

## 🔐 Bezpieczeństwo

### Best Practices

1. **Tokeny są przechowywane w Redux store** (pamięć), nie w localStorage
2. **Automatyczne czyszczenie tokenów** przy logout
3. **Walidacja wygaśnięcia tokenów** przed każdym API call
4. **CORS zabezpieczenia** w funkcjach Netlify
5. **Nie logowanie pełnych tokenów** - tylko pierwsze 20 znaków

### Validation Function Security

```typescript
// Sprawdzanie podpisu JWT
// Walidacja czas wygaśnięcia
// Weryfikacja issuer Auth0
// Obsługa CORS dla cross-origin
```

## 📖 Dalsze Rozszerzenia

1. **Refresh Token** - automatyczne odnawianie wygasłych tokenów
2. **Role-based Access** - autoryzacja na podstawie ról użytkownika
3. **Rate Limiting** - ograniczenia w funkcjach Netlify
4. **Audit Logging** - logowanie wszystkich wywołań API
5. **Token Revocation** - mechanizm unieważniania tokenów

---

**Status:** ✅ Kompletna implementacja gotowa do produkcji

**Ostatnia aktualizacja:** Styczeń 2025

# 🚀 Szybki Start - System Autoryzacji JWT

## 1. Logowanie użytkownika

```tsx
import { useAuth0 } from '@auth0/auth0-react'

const { loginWithRedirect, logout, isAuthenticated } = useAuth0()

// Logowanie
await loginWithRedirect()

// Wylogowanie  
logout({ logoutParams: { returnTo: window.location.origin } })
```

## 2. Sprawdzanie stanu autoryzacji

```tsx
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated, selectIsTokenValid } from '../store/slices/authSlice'

const isAuthenticated = useAppSelector(selectIsAuthenticated)
const isTokenValid = useAppSelector(selectIsTokenValid)

if (isAuthenticated && isTokenValid) {
    // Użytkownik ma ważny token
}
```

## 3. Wywołania API z automatyczną autoryzacją

```tsx
import { apiService } from '../services/apiService'

// GET z automatycznym tokenem
const userData = await apiService.get('/api/user/profile')

// POST z automatycznym tokenem
const result = await apiService.post('/api/save-data', { name: 'test' })

// PUT z automatycznym tokenem  
await apiService.put('/api/user/settings', { theme: 'dark' })

// DELETE z automatycznym tokenem
await apiService.delete('/api/user/session')
```

## 4. Dostęp do tokenów JWT

```tsx
import { useAuthTokens } from '../hooks/useAuth0Sync'

const { accessToken, idToken } = useAuthTokens()

// Lub z Redux store
import { selectAccessToken, selectIdToken } from '../store/slices/authSlice'

const accessToken = useAppSelector(selectAccessToken)
const idToken = useAppSelector(selectIdToken)
```

## 5. Testowanie autoryzacji

```tsx
import { apiService } from '../services/apiService'

// Test podstawowy
const testResult = await apiService.testAuth()
console.log('Token works:', testResult.valid)

// Test wszystkich metod (POST, Bearer header, Query param)
const allTests = await apiService.testAllAuthMethods()
```

## 6. Panel testowy w UI

```tsx
import AuthTestPanel from '../components/AuthTestPanel'

// Dodaj do swojego komponentu
<AuthTestPanel />
```

## 7. Walidacja po stronie serwera

```bash
# Endpoint Netlify function
POST /.netlify/functions/validate-token
Content-Type: application/json

{
    "token": "eyJ0eXAiOiJKV1QiLCJhbGci..."
}

# Lub GET z query param
GET /.netlify/functions/validate-token?token=eyJ0eXAi...

# Lub GET z Authorization header
GET /.netlify/functions/validate-token
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGci...
```

## 8. Obsługa błędów

```tsx
try {
    const data = await apiService.get('/api/protected')
} catch (error) {
    if (error.message.includes('401')) {
        // Token wygasł lub nieprawidłowy
        // Przekieruj do logowania
    }
    if (error.message.includes('403')) {
        // Brak uprawnień
    }
}
```

## 9. Komponenty z autoryzacją

```tsx
import { useAppSelector } from '../store/hooks'
import { selectIsAuthenticated } from '../store/slices/authSlice'

const MyProtectedComponent = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    
    if (!isAuthenticated) {
        return <div>Musisz się zalogować</div>
    }
    
    return <div>Treść dla zalogowanych</div>
}
```

## 10. Konfiguracja środowiska

```env
# .env
VITE_AUTH0_DOMAIN=your-domain.auth0.com
VITE_AUTH0_CLIENT_ID=your-client-id  
VITE_AUTH0_AUDIENCE=https://your-api.com
VITE_API_BASE_URL=http://localhost:8000/api
```

---

**🎯 To wszystko!** System automatycznie:
- Pobiera tokeny z Auth0
- Zapisuje w Redux store  
- Dodaje do każdego API call
- Waliduje po stronie serwera
- Obsługuje błędy i wygaśnięcie

**📱 UI gotowe:** Przejdź do `/profile` i przetestuj panel autoryzacji!

import './debug-init'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import '@ant-design/v5-patch-for-react-19'
import { Loading, ThemeProvider, BodyThemeManager } from './components/common'
import { Auth0ProviderWrapper } from './components/auth'
import { store, persistor } from './store'
import App from './App.tsx'
import './styles/theme.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0ProviderWrapper>
      <Provider store={store}>
        <PersistGate
          loading={<Loading fullScreen message="Przywracanie ustawień..." />}
          persistor={persistor}
        >
          <ThemeProvider>
            <BodyThemeManager>
              <App />
            </BodyThemeManager>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </Auth0ProviderWrapper>
  </StrictMode>
)

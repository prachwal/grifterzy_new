import { Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ErrorBoundaryWrapper, NotFound } from './components/errors'
import { Loading } from './components/common'
import { MainLayout } from './layouts/MainLayout'
import 'antd/dist/reset.css'

// Lazy loaded components
const HomePage = lazy(() =>
  import('./pages/HomePage').then(module => ({ default: module.HomePage }))
)
const ProfilePage = lazy(() =>
  import('./pages/ProfilePage').then(module => ({ default: module.ProfilePage }))
)
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage }))
)

function App() {
  return (
    <ErrorBoundaryWrapper>
      <Router>
        <Suspense fallback={<Loading fullScreen message="Ładowanie strony..." />}>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundaryWrapper>
  )
}

export default App

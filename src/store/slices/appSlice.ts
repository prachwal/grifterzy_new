import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'pl' | 'en' | 'de'
  region: 'pl' | 'us' | 'de'
}

interface AppState {
  settings: AppSettings
  loading: boolean
  systemTheme: 'light' | 'dark' // Actual system theme
  user: {
    name: string
    email: string
  } | null
}

const initialState: AppState = {
  settings: {
    theme: 'system',
    language: 'pl',
    region: 'pl',
  },
  loading: false,
  systemTheme: 'light', // Will be updated by system theme listener
  user: null,
}

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.settings.theme = action.payload
    },
    setSystemTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.systemTheme = action.payload
    },
    setLanguage: (state, action: PayloadAction<'pl' | 'en' | 'de'>) => {
      state.settings.language = action.payload
    },
    setRegion: (state, action: PayloadAction<'pl' | 'us' | 'de'>) => {
      state.settings.region = action.payload
    },
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setUser: (state, action: PayloadAction<AppState['user']>) => {
      state.user = action.payload
    },
    clearUser: state => {
      state.user = null
    },
  },
})

export const {
  setTheme,
  setSystemTheme,
  setLanguage,
  setRegion,
  updateSettings,
  setLoading,
  setUser,
  clearUser,
} = appSlice.actions
export default appSlice.reducer

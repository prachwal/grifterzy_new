import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  globalLoading: boolean
  pageLoading: boolean
  lastError: string | null
  notifications: Array<{
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    timestamp: number
  }>
}

const initialState: UIState = {
  globalLoading: false,
  pageLoading: false,
  lastError: null,
  notifications: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload
    },
    setPageLoading: (state, action: PayloadAction<boolean>) => {
      state.pageLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.lastError = action.payload
    },
    clearError: state => {
      state.lastError = null
    },
    addNotification: (
      state,
      action: PayloadAction<{
        type: 'success' | 'error' | 'warning' | 'info'
        message: string
      }>
    ) => {
      const notification = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        ...action.payload,
      }
      state.notifications.push(notification)
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      )
    },
    clearNotifications: state => {
      state.notifications = []
    },
  },
})

export const {
  setGlobalLoading,
  setPageLoading,
  setError,
  clearError,
  addNotification,
  removeNotification,
  clearNotifications,
} = uiSlice.actions

export default uiSlice.reducer

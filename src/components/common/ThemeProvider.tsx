import { ConfigProvider, theme } from 'antd'
import { useSystemTheme } from '../../hooks/useSystemTheme'

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { actualTheme } = useSystemTheme()

  return (
    <ConfigProvider
      theme={{
        algorithm: actualTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

import { Spin, Typography } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'

const { Text } = Typography

interface LoadingProps {
  size?: 'small' | 'default' | 'large'
  message?: string
  fullScreen?: boolean
}

export const Loading = ({
  size = 'large',
  message = 'Ładowanie...',
  fullScreen = false,
}: LoadingProps) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'large' ? 24 : 16 }} spin />

  const spinStyle = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '16px',
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        gap: '16px',
      }

  return (
    <div style={spinStyle}>
      <Spin indicator={antIcon} size={size} />
      {message && (
        <Text type="secondary" style={{ fontSize: size === 'large' ? '16px' : '14px' }}>
          {message}
        </Text>
      )}
    </div>
  )
}

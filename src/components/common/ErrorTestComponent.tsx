import { Button, Card, Space, Typography, Alert } from 'antd'
import { BugOutlined, WarningOutlined } from '@ant-design/icons'
import { useAsyncError } from '../../hooks/useAsyncError'

const { Title, Paragraph } = Typography

export const ErrorTestComponent = () => {
  const { handleAsyncError, throwError } = useAsyncError()

  const handleSyncError = () => {
    throwError(new Error('Test błędu synchronicznego - component error boundary test'))
  }

  const handleAsyncError404 = () => {
    handleAsyncError(async () => {
      // Simulate API call that fails
      await new Promise(resolve => setTimeout(resolve, 1000))
      throw new Error('Test błędu 404 - resource not found')
    })
  }

  const handleAsyncError500 = () => {
    handleAsyncError(async () => {
      // Simulate server error
      await new Promise(resolve => setTimeout(resolve, 1000))
      throw new Error('Test błędu 500 - internal server error')
    })
  }

  const handleTypeError = () => {
    // This will cause a TypeError
    const obj: any = null
    console.log(obj.property.that.does.not.exist)
  }

  // Only render in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <Card
      title={
        <span>
          <BugOutlined /> Test błędów (tylko w trybie dev)
        </span>
      }
      style={{ marginTop: 24 }}
    >
      <Alert
        message="Komponenty testowe"
        description="Te przyciski służą do testowania obsługi błędów. Dostępne tylko w trybie developerskim."
        type="info"
        icon={<WarningOutlined />}
        style={{ marginBottom: 16 }}
      />

      <Title level={4}>Testowanie Error Boundary</Title>
      <Paragraph type="secondary">
        Kliknij poniższe przyciski aby przetestować różne typy błędów:
      </Paragraph>

      <Space direction="vertical" style={{ width: '100%' }}>
        <Button danger icon={<BugOutlined />} onClick={handleSyncError}>
          Test błędu synchronicznego
        </Button>

        <Button danger icon={<BugOutlined />} onClick={handleAsyncError404}>
          Test błędu async 404
        </Button>

        <Button danger icon={<BugOutlined />} onClick={handleAsyncError500}>
          Test błędu async 500
        </Button>

        <Button danger icon={<BugOutlined />} onClick={handleTypeError}>
          Test TypeError
        </Button>
      </Space>
    </Card>
  )
}

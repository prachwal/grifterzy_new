import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons'

export const ServerError = () => {
  const navigate = useNavigate()

  const handleBackHome = () => {
    navigate('/')
  }

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <Result
      status="500"
      title="500"
      subTitle="Przepraszamy, wystąpił błąd serwera. Spróbuj ponownie za chwilę."
      extra={[
        <Button type="primary" icon={<HomeOutlined />} onClick={handleBackHome} key="home">
          Wróć do strony głównej
        </Button>,
        <Button icon={<ReloadOutlined />} onClick={handleReload} key="reload">
          Odśwież stronę
        </Button>,
      ]}
    />
  )
}

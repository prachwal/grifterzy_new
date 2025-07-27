import { Result, Button } from 'antd'
import { useNavigate } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'

export const NotFound = () => {
    const navigate = useNavigate()

    const handleBackHome = () => {
        navigate('/')
    }

    return (
        <Result
            status="404"
            title="404"
            subTitle="Przepraszamy, strona której szukasz nie istnieje."
            extra={
                <Button type="primary" icon={<HomeOutlined />} onClick={handleBackHome}>
                    Wróć do strony głównej
                </Button>
            }
        />
    )
}

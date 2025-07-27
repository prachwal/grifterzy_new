import { Typography, Card, Button } from 'antd'
import { useAppSelector, useAppDispatch } from '../store'
import { setUser } from '../store/slices/appSlice'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { RocketOutlined } from '@ant-design/icons'
import { ErrorTestComponent } from '../components/common'

const { Title, Paragraph } = Typography

export const HomePage = () => {
    const dispatch = useAppDispatch()
    const { user } = useAppSelector(state => state.app)
    const { actualTheme } = useSystemTheme()

    const handleLogin = () => {
        dispatch(
            setUser({
                name: 'Jan Kowalski',
                email: 'jan@example.com',
            })
        )
    }

    return (
        <div>
            <Title level={1}>
                <RocketOutlined /> Witaj w Grifterzy!
            </Title>

            <Paragraph>
                To jest przykładowa aplikacja React z Ant Design, Redux Toolkit i React Router.
            </Paragraph>

            <Card
                title="Status użytkownika"
                style={{ marginTop: 24 }}
                styles={{
                    header: {
                        background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                    },
                }}
            >
                {user ? (
                    <div>
                        <Paragraph>
                            <strong>Zalogowany jako:</strong> {user.name}
                        </Paragraph>
                        <Paragraph>
                            <strong>Email:</strong> {user.email}
                        </Paragraph>
                        <Button onClick={() => dispatch(setUser(null))} danger>
                            Wyloguj
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Paragraph>Nie jesteś zalogowany.</Paragraph>
                        <Button type="primary" onClick={handleLogin}>
                            Zaloguj się
                        </Button>
                    </div>
                )}
            </Card>

            <ErrorTestComponent />
        </div>
    )
}

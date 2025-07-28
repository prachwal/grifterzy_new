import { Typography, Card, Button } from 'antd'
import { useAuth0 } from '@auth0/auth0-react'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { RocketOutlined } from '@ant-design/icons'
import { ErrorTestComponent } from '../components/common'

const { Title, Paragraph } = Typography

export const HomePage = () => {
    const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0()
    const { actualTheme } = useSystemTheme()

    const handleLogin = () => {
        loginWithRedirect()
    }

    const handleLogout = () => {
        logout({ logoutParams: { returnTo: window.location.origin } })
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
                {isAuthenticated && user ? (
                    <div>
                        <Paragraph>
                            <strong>Zalogowany jako:</strong> {user.name}
                        </Paragraph>
                        <Paragraph>
                            <strong>Email:</strong> {user.email}
                        </Paragraph>
                        <Button onClick={handleLogout} danger>
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

import { Layout, Menu, Typography } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../store'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { LoginButton } from '../components/auth'
import { HomeOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons'

const { Header, Content, Sider } = Layout
const { Title } = Typography

export const MainLayout = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { settings } = useAppSelector((state) => state.app)
    const { actualTheme } = useSystemTheme()

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Strona główna',
        },
        {
            key: '/profile',
            icon: <UserOutlined />,
            label: 'Profil',
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Ustawienia',
        },
    ]

    const handleMenuClick = (key: string) => {
        navigate(key)
    }

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                breakpoint="lg"
                collapsedWidth="0"
                style={{
                    background: actualTheme === 'dark' ? '#001529' : '#fff',
                }}
            >
                <div
                    style={{
                        height: 32,
                        margin: 16,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Title level={4} style={{ margin: 0, color: actualTheme === 'dark' ? '#fff' : '#000' }}>
                        Grifterzy
                    </Title>
                </div>
                <Menu
                    theme={actualTheme}
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => handleMenuClick(key)}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: '0 16px',
                        background: actualTheme === 'dark' ? '#001529' : '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: `1px solid ${actualTheme === 'dark' ? '#303030' : '#f0f0f0'}`,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: actualTheme === 'dark' ? '#fff' : '#000' }}>
                            Motyw: {settings.theme === 'system' ? `System (${actualTheme})` : settings.theme}
                        </span>
                    </div>
                    <LoginButton />
                </Header>
                <Content style={{ margin: '24px 16px 0' }}>
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: actualTheme === 'dark' ? '#141414' : '#fff',
                            borderRadius: 8,
                        }}
                    >
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    )
}

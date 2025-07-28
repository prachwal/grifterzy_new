import { Button, Avatar, Dropdown, Space } from 'antd'
import { useAuth0 } from '@auth0/auth0-react'
import { UserOutlined, LoginOutlined, LogoutOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { useEffect } from 'react'

export const LoginButton = () => {
    const {
        loginWithRedirect,
        logout,
        user,
        isAuthenticated,
        isLoading,
        error
    } = useAuth0()

    // Szczegółowe logowanie stanu Auth0
    useEffect(() => {
        console.group('🔐 LoginButton - Auth0 State Update')
        console.log('⏳ Is Loading:', isLoading)
        console.log('✅ Is Authenticated:', isAuthenticated)
        console.log('👤 User:', user)
        console.log('❌ Error:', error)
        console.log('🌐 Current URL:', window.location.href)
        console.log('📊 URL Params:', window.location.search)

        if (error) {
            console.group('💥 Auth0 Error Details')
            console.error('Error Name:', error.name)
            console.error('Error Message:', error.message)
            console.error('Error Object:', error)
            console.groupEnd()
        }

        console.groupEnd()
    }, [isLoading, isAuthenticated, user, error])

    const handleLogin = async () => {
        console.group('🚪 Login Button Clicked')

        try {
            console.log('🌊 Initiating loginWithRedirect...')
            await loginWithRedirect({
                authorizationParams: {
                    audience: import.meta.env.VITE_AUTH0_AUDIENCE || undefined,
                    scope: 'openid profile email'
                }
            })
        } catch (err) {
            console.group('💥 Login Error')
            console.error('Error during login:', err)
            console.groupEnd()
        }

        console.groupEnd()
    }

    const handleLogout = () => {
        console.group('🚪 Logout Button Clicked')
        console.log('🔄 Logging out with returnTo:', window.location.origin)
        logout({ logoutParams: { returnTo: window.location.origin } })
        console.groupEnd()
    }

    if (isLoading) {
        return <Button loading>Ładowanie...</Button>
    }

    if (isAuthenticated && user) {
        const menuItems: MenuProps['items'] = [
            {
                key: 'profile',
                icon: <UserOutlined />,
                label: 'Profil',
            },
            {
                type: 'divider',
            },
            {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: 'Wyloguj',
                onClick: handleLogout,
            },
        ]

        return (
            <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                <Space style={{ cursor: 'pointer' }}>
                    <Avatar
                        src={user.picture}
                        icon={<UserOutlined />}
                        size="default"
                    />
                    <span>{user.name || user.email}</span>
                </Space>
            </Dropdown>
        )
    }

    return (
        <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={handleLogin}
        >
            Zaloguj się
        </Button>
    )
}

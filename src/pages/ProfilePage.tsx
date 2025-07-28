import { Typography, Card, Avatar, Table, Tag, Collapse, Button, Space, message, Alert } from 'antd'
import { useAppSelector } from '../store'
import {
    selectAccessToken,
    selectIdToken,
    selectIdTokenClaims,
    selectUser,
    selectIsAuthenticated,
    selectIsLoading,
    selectIsTokenValid
} from '../store/slices/authSlice'
import { useAuthTokens } from '../hooks/useAuth0Sync'
import { apiService } from '../services/apiService'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { UserOutlined, CopyOutlined, KeyOutlined, SafetyOutlined, ApiOutlined } from '@ant-design/icons'
import AuthTestPanel from '../components/AuthTestPanel'
import TokenDebugPanel from '../components/TokenDebugPanel'
import { useState, useEffect } from 'react'

const { Title, Text, Paragraph } = Typography
const { Panel } = Collapse

interface DecodedJWT {
    header: any
    payload: any
    signature: string
}

export const ProfilePage = () => {
    // Używamy Redux store zamiast bezpośrednio Auth0
    const user = useAppSelector(selectUser)
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    const isLoading = useAppSelector(selectIsLoading)
    const accessToken = useAppSelector(selectAccessToken)
    const idToken = useAppSelector(selectIdToken)
    const idTokenClaims = useAppSelector(selectIdTokenClaims)
    const isTokenValid = useAppSelector(selectIsTokenValid)

    const { getValidAccessToken } = useAuthTokens()
    const { actualTheme } = useSystemTheme()
    const [decodedAccessToken, setDecodedAccessToken] = useState<DecodedJWT | null>(null)
    const [decodedIdToken, setDecodedIdToken] = useState<DecodedJWT | null>(null)
    const [apiTestResult, setApiTestResult] = useState<string>('')
    const [apiTestLoading, setApiTestLoading] = useState(false)

    // Funkcja do dekodowania JWT
    const decodeJWT = (token: string): DecodedJWT | null => {
        try {
            const parts = token.split('.')
            if (parts.length !== 3) return null

            const header = JSON.parse(atob(parts[0]))
            const payload = JSON.parse(atob(parts[1]))
            const signature = parts[2]

            return { header, payload, signature }
        } catch (error) {
            console.error('Error decoding JWT:', error)
            return null
        }
    }

    // Dekoduj tokeny gdy są dostępne w Redux store
    useEffect(() => {
        if (accessToken) {
            setDecodedAccessToken(decodeJWT(accessToken))
        }
        if (idToken) {
            setDecodedIdToken(decodeJWT(idToken))
        }
    }, [accessToken, idToken])

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text)
        message.success(`${label} skopiowany do schowka`)
    }

    // Test API z Redux tokenami
    const testApiCall = async () => {
        setApiTestLoading(true)
        setApiTestResult('')

        try {
            const token = await getValidAccessToken()
            if (!token) {
                setApiTestResult('❌ Brak ważnego tokenu dostępu')
                return
            }

            // Test call
            const result = await apiService.testAuth()
            setApiTestResult(
                result.valid
                    ? `✅ Token jest ważny! (${result.token})`
                    : '❌ Token nie jest ważny'
            )
        } catch (error: any) {
            setApiTestResult(`❌ Błąd API: ${error.message}`)
        } finally {
            setApiTestLoading(false)
        }
    }

    // Przygotowanie danych do tabeli
    const userData = user ? Object.entries(user).map(([key, value]) => ({
        key,
        property: key,
        value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
        type: typeof value
    })) : []

    const tokenColumns = [
        {
            title: 'Właściwość',
            dataIndex: 'property',
            key: 'property',
            width: 200,
            render: (text: string) => <Text strong>{text}</Text>
        },
        {
            title: 'Wartość',
            dataIndex: 'value',
            key: 'value',
            render: (text: string) => (
                <div style={{ maxWidth: 400, wordBreak: 'break-all' }}>
                    <Text code style={{ fontSize: '12px' }}>{text}</Text>
                </div>
            )
        },
        {
            title: 'Typ',
            dataIndex: 'type',
            key: 'type',
            width: 100,
            render: (text: string) => <Tag color="blue">{text}</Tag>
        }
    ]

    if (isLoading) {
        return (
            <div>
                <Title level={1}>
                    <UserOutlined /> Profil użytkownika
                </Title>
                <Card>
                    <Text>Ładowanie profilu...</Text>
                </Card>
            </div>
        )
    }

    return (
        <div>
            <Title level={1}>
                <UserOutlined /> Profil użytkownika
            </Title>

            {isAuthenticated && user ? (
                <div style={{ maxWidth: 1200 }}>
                    {/* Karta profilu z awatarem */}
                    <Card
                        style={{ marginBottom: 24 }}
                        styles={{
                            header: {
                                background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                            },
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Avatar
                                size={80}
                                src={user.picture}
                                icon={<UserOutlined />}
                            />
                            <div>
                                <Title level={2} style={{ margin: 0 }}>
                                    {user.name || 'Brak nazwy'}
                                </Title>
                                <Text type="secondary" style={{ fontSize: '16px' }}>
                                    {user.email || 'Brak emaila'}
                                </Text>
                                <br />
                                <Tag color="green" style={{ marginTop: 8 }}>
                                    Zalogowany przez Auth0
                                </Tag>
                            </div>
                        </div>
                    </Card>

                    {/* Pełne dane użytkownika */}
                    <Card
                        title="Pełne dane użytkownika z Auth0 API"
                        style={{ marginBottom: 24 }}
                        styles={{
                            header: {
                                background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                            },
                        }}
                    >
                        <Table
                            dataSource={userData}
                            columns={tokenColumns}
                            pagination={false}
                            size="small"
                            scroll={{ y: 300 }}
                        />
                    </Card>

                    {/* Tokeny i dekodowanie */}
                    <Collapse defaultActiveKey={['1']} style={{ marginBottom: 24 }}>
                        <Panel
                            header={
                                <Space>
                                    <KeyOutlined />
                                    <Text strong>Access Token JWT</Text>
                                    {accessToken && <Tag color="orange">Dostępny</Tag>}
                                </Space>
                            }
                            key="1"
                        >
                            {accessToken ? (
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>Token (pierwsze 100 znaków):</Text>
                                        <Paragraph
                                            code
                                            copyable={{
                                                text: accessToken,
                                                tooltips: ['Kopiuj pełny token', 'Skopiowano!']
                                            }}
                                            style={{ backgroundColor: actualTheme === 'dark' ? '#1f1f1f' : '#f5f5f5' }}
                                        >
                                            {accessToken.substring(0, 100)}...
                                        </Paragraph>
                                        <Button
                                            icon={<CopyOutlined />}
                                            onClick={() => copyToClipboard(accessToken, 'Access Token')}
                                            size="small"
                                        >
                                            Kopiuj pełny token
                                        </Button>
                                    </div>

                                    {decodedAccessToken && (
                                        <div>
                                            <Text strong>Dekodowany JWT:</Text>
                                            <Card size="small" style={{ marginTop: 8 }}>
                                                <Title level={5}>Header:</Title>
                                                <Paragraph code>
                                                    {JSON.stringify(decodedAccessToken.header, null, 2)}
                                                </Paragraph>

                                                <Title level={5}>Payload:</Title>
                                                <Paragraph code>
                                                    {JSON.stringify(decodedAccessToken.payload, null, 2)}
                                                </Paragraph>

                                                <Title level={5}>Signature:</Title>
                                                <Text code>{decodedAccessToken.signature}</Text>
                                            </Card>
                                        </div>
                                    )}
                                </Space>
                            ) : (
                                <Text type="secondary">Brak dostępu do Access Token</Text>
                            )}
                        </Panel>

                        <Panel
                            header={
                                <Space>
                                    <SafetyOutlined />
                                    <Text strong>ID Token JWT</Text>
                                    {idToken && <Tag color="blue">Dostępny</Tag>}
                                </Space>
                            }
                            key="2"
                        >
                            {idToken ? (
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div>
                                        <Text strong>Token (pierwsze 100 znaków):</Text>
                                        <Paragraph
                                            code
                                            copyable={{
                                                text: idToken,
                                                tooltips: ['Kopiuj pełny token', 'Skopiowano!']
                                            }}
                                            style={{ backgroundColor: actualTheme === 'dark' ? '#1f1f1f' : '#f5f5f5' }}
                                        >
                                            {idToken.substring(0, 100)}...
                                        </Paragraph>
                                        <Button
                                            icon={<CopyOutlined />}
                                            onClick={() => copyToClipboard(idToken, 'ID Token')}
                                            size="small"
                                        >
                                            Kopiuj pełny token
                                        </Button>
                                    </div>

                                    {decodedIdToken && (
                                        <div>
                                            <Text strong>Dekodowany JWT:</Text>
                                            <Card size="small" style={{ marginTop: 8 }}>
                                                <Title level={5}>Header:</Title>
                                                <Paragraph code>
                                                    {JSON.stringify(decodedIdToken.header, null, 2)}
                                                </Paragraph>

                                                <Title level={5}>Payload:</Title>
                                                <Paragraph code>
                                                    {JSON.stringify(decodedIdToken.payload, null, 2)}
                                                </Paragraph>

                                                <Title level={5}>Signature:</Title>
                                                <Text code>{decodedIdToken.signature}</Text>
                                            </Card>
                                        </div>
                                    )}
                                </Space>
                            ) : (
                                <Text type="secondary">Brak dostępu do ID Token</Text>
                            )}
                        </Panel>

                        {idTokenClaims && (
                            <Panel
                                header={
                                    <Space>
                                        <SafetyOutlined />
                                        <Text strong>ID Token Claims (pełne dane)</Text>
                                        <Tag color="purple">Auth0 Claims</Tag>
                                    </Space>
                                }
                                key="3"
                            >
                                <Table
                                    dataSource={Object.entries(idTokenClaims)
                                        .filter(([key]) => key !== '__raw')
                                        .map(([key, value]) => ({
                                            key,
                                            property: key,
                                            value: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
                                            type: typeof value
                                        }))}
                                    columns={tokenColumns}
                                    pagination={false}
                                    size="small"
                                    scroll={{ y: 400 }}
                                />
                            </Panel>
                        )}
                    </Collapse>

                    {/* Sekcja testowania API */}
                    <Card
                        title={
                            <Space>
                                <ApiOutlined />
                                <Text strong>Test API z Redux Token</Text>
                                <Tag color={isTokenValid ? 'green' : 'red'}>
                                    {isTokenValid ? 'Token ważny' : 'Token nieważny'}
                                </Tag>
                            </Space>
                        }
                        style={{ marginBottom: 24 }}
                        styles={{
                            header: {
                                background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                            },
                        }}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Text>
                                Test automatycznego użycia tokenów z Redux store w wywołaniach API.
                                Token jest automatycznie dodawany jako Bearer Authorization header.
                            </Text>

                            <Space>
                                <Button
                                    type="primary"
                                    onClick={testApiCall}
                                    loading={apiTestLoading}
                                    icon={<ApiOutlined />}
                                >
                                    Test API Call
                                </Button>

                                <Text code style={{ fontSize: '12px' }}>
                                    Użyje: {accessToken ? `${accessToken.substring(0, 30)}...` : 'Brak tokenu'}
                                </Text>
                            </Space>

                            {apiTestResult && (
                                <Alert
                                    message="Wynik testu API"
                                    description={apiTestResult}
                                    type={apiTestResult.includes('✅') ? 'success' : 'error'}
                                    showIcon
                                />
                            )}

                            <Card size="small" title="Przykład użycia w kodzie:">
                                <Paragraph code style={{ fontSize: '12px' }}>
                                    {`// Automatyczne użycie tokenu z Redux store
import { apiService } from '../services/apiService'

// GET request z automatyczną autoryzacją
const data = await apiService.get('/api/user-data')

// POST request z automatyczną autoryzacją  
const result = await apiService.post('/api/save-data', { name: 'test' })

// Token jest automatycznie pobierany z Redux store!`}
                                </Paragraph>
                            </Card>
                        </Space>
                    </Card>

                    <TokenDebugPanel />

                    <AuthTestPanel />
                </div>
            ) : (
                <Card>
                    <Text>Musisz być zalogowany, aby zobaczyć profil.</Text>
                </Card>
            )}
        </div>
    )
}

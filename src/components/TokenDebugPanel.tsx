import React, { useState } from 'react'
import { Card, Button, Typography, Space, Descriptions, Alert } from 'antd'
import { BugOutlined, EyeOutlined } from '@ant-design/icons'
import { useAppSelector } from '../store'
import { selectAccessToken, selectIdToken } from '../store/slices/authSlice'
import { useSystemTheme } from '../hooks/useSystemTheme'

const { Title, Text, Paragraph } = Typography

/**
 * Panel do debugowania tokenów Auth0
 * Fixed dark mode styles for textarea - force reload
 */
export const TokenDebugPanel: React.FC = () => {
    const [showTokens, setShowTokens] = useState(false)
    const accessToken = useAppSelector(selectAccessToken)
    const idToken = useAppSelector(selectIdToken)
    const { actualTheme } = useSystemTheme()

    // Debug theme
    console.log('🎨 TokenDebugPanel actualTheme:', actualTheme)

    // Fallback theme detection
    const isDarkMode = actualTheme === 'dark' ||
        document.documentElement.classList.contains('dark') ||
        document.body.getAttribute('data-theme') === 'dark'

    console.log('🌙 isDarkMode:', isDarkMode)

    const analyzeToken = (token: string | null, tokenType: string) => {
        if (!token) {
            return {
                type: tokenType,
                status: 'MISSING',
                parts: 0,
                format: 'N/A'
            }
        }

        const parts = token.split('.')
        let format = 'UNKNOWN'
        let status = 'PRESENT'

        if (parts.length === 3) {
            format = 'JWT (3 parts)'
            // Try to decode middle part to check if valid JWT
            try {
                const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
                status = `VALID JWT (exp: ${payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A'})`
            } catch {
                status = 'INVALID JWT'
            }
        } else if (parts.length === 5) {
            format = 'JWE (5 parts - encrypted)'
            status = 'ENCRYPTED TOKEN'
        } else {
            format = `UNKNOWN (${parts.length} parts)`
            status = 'INVALID FORMAT'
        }

        return {
            type: tokenType,
            status,
            parts: parts.length,
            format,
            preview: token.substring(0, 30) + '...',
            length: token.length
        }
    }

    const accessTokenInfo = analyzeToken(accessToken, 'Access Token')
    const idTokenInfo = analyzeToken(idToken, 'ID Token')

    return (
        <Card
            title={
                <Space>
                    <BugOutlined />
                    <span>Debug Tokenów Auth0</span>
                </Space>
            }
            extra={
                <Button
                    icon={<EyeOutlined />}
                    onClick={() => setShowTokens(!showTokens)}
                    type={showTokens ? "primary" : "default"}
                >
                    {showTokens ? 'Ukryj tokeny' : 'Pokaż tokeny'}
                </Button>
            }
            style={{ marginTop: 24 }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                    message="Analiza tokenów"
                    description="Sprawdź jakie tokeny otrzymujesz z Auth0 i ich format"
                    type="info"
                    showIcon
                />

                <Card size="small" title="📊 Analiza tokenów">
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="Access Token">
                            <Space direction="vertical">
                                <Text strong>{accessTokenInfo.status}</Text>
                                <Text type="secondary">{accessTokenInfo.format}</Text>
                                <Text code>Części: {accessTokenInfo.parts}, Długość: {accessTokenInfo.length}</Text>
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="ID Token">
                            <Space direction="vertical">
                                <Text strong>{idTokenInfo.status}</Text>
                                <Text type="secondary">{idTokenInfo.format}</Text>
                                <Text code>Części: {idTokenInfo.parts}, Długość: {idTokenInfo.length}</Text>
                            </Space>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {showTokens && (
                    <Card size="small" title="🔍 Podgląd tokenów">
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div>
                                <Title level={5}>Access Token:</Title>
                                <Paragraph
                                    code
                                    copyable={{ text: accessToken || '' }}
                                    style={{
                                        fontSize: '10px',
                                        wordBreak: 'break-all',
                                        backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
                                        color: isDarkMode ? '#e6e6e6' : '#333333',
                                        border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        maxHeight: '150px',
                                        overflow: 'auto'
                                    }}
                                >
                                    {accessToken || 'Brak tokenu'}
                                </Paragraph>
                            </div>

                            <div>
                                <Title level={5}>ID Token:</Title>
                                <Paragraph
                                    code
                                    copyable={{ text: idToken || '' }}
                                    style={{
                                        fontSize: '10px',
                                        wordBreak: 'break-all',
                                        backgroundColor: isDarkMode ? '#262626' : '#f5f5f5',
                                        color: isDarkMode ? '#e6e6e6' : '#333333',
                                        border: isDarkMode ? '1px solid #434343' : '1px solid #d9d9d9',
                                        padding: '12px',
                                        borderRadius: '6px',
                                        maxHeight: '150px',
                                        overflow: 'auto'
                                    }}
                                >
                                    {idToken || 'Brak tokenu'}
                                </Paragraph>
                            </div>
                        </Space>
                    </Card>
                )}

                <Alert
                    message="Jakie tokeny walidujemy?"
                    description={
                        <div>
                            <div>🔑 <strong>Access Token:</strong> Używany w API calls (funkcja validate-token)</div>
                            <div>🆔 <strong>ID Token:</strong> Zawiera informacje o użytkowniku</div>
                            <div>⚠️ <strong>JWE vs JWT:</strong> JWE (5 części) to szyfrowany token, JWT (3 części) to nieszyfrowany</div>
                        </div>
                    }
                    type="warning"
                    showIcon
                />
            </Space>
        </Card>
    )
}

export default TokenDebugPanel

import React, { useState } from 'react'
import { Card, Button, Descriptions, Alert, Spin, Space, Typography, Tag } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, ExperimentOutlined } from '@ant-design/icons'
import { apiService } from '../services/apiService'
import { useSystemTheme } from '../hooks/useSystemTheme'

const { Title, Text } = Typography

interface AuthTestResult {
    valid: boolean
    token?: string
    userInfo?: any
}

interface AllAuthMethodsResult {
    netlifyFunction: { valid: boolean; response?: any }
    authorizationHeader: { valid: boolean; response?: any }
    queryParameter: { valid: boolean; response?: any }
}

/**
 * Panel do testowania różnych metod autoryzacji
 */
export const AuthTestPanel: React.FC = () => {
    const [singleTestResult, setSingleTestResult] = useState<AuthTestResult | null>(null)
    const [allMethodsResult, setAllMethodsResult] = useState<AllAuthMethodsResult | null>(null)
    const [loading, setLoading] = useState<string | null>(null)
    const { actualTheme } = useSystemTheme()

    const runSingleTest = async () => {
        setLoading('single')
        try {
            const result = await apiService.testAuth()
            setSingleTestResult(result)
        } catch (error) {
            setSingleTestResult({
                valid: false,
                userInfo: { error: String(error) }
            })
        } finally {
            setLoading(null)
        }
    }

    const runAllMethodsTest = async () => {
        setLoading('all')
        try {
            const result = await apiService.testAllAuthMethods()
            setAllMethodsResult(result)
        } catch (error) {
            setAllMethodsResult({
                netlifyFunction: { valid: false, response: { error: String(error) } },
                authorizationHeader: { valid: false, response: { error: String(error) } },
                queryParameter: { valid: false, response: { error: String(error) } }
            })
        } finally {
            setLoading(null)
        }
    }

    const renderTestResult = (method: string, result: { valid: boolean; response?: any }) => {
        const icon = result.valid ?
            <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />

        const statusTag = result.valid ?
            <Tag color="green">SUCCESS</Tag> :
            <Tag color="red">FAILED</Tag>

        return (
            <Card
                size="small"
                title={
                    <Space>
                        {icon}
                        <Text strong>{method}</Text>
                        {statusTag}
                    </Space>
                }
                style={{ marginBottom: 16 }}
            >
                <Descriptions size="small" column={1}>
                    <Descriptions.Item label="Status">
                        {result.valid ? 'Token prawidłowy' : 'Token nieprawidłowy'}
                    </Descriptions.Item>
                    {result.response && (
                        <Descriptions.Item label=" ">
                            <div style={{ marginTop: 8 }}>
                                <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                    Odpowiedź serwera:
                                </Text>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                    JSON Response:
                                </Text>
                                <pre style={{
                                    fontSize: '12px',
                                    backgroundColor: actualTheme === 'dark' ? '#262626' : '#f5f5f5',
                                    color: actualTheme === 'dark' ? '#e6e6e6' : '#333333',
                                    border: actualTheme === 'dark' ? '1px solid #434343' : '1px solid #d9d9d9',
                                    padding: '12px',
                                    borderRadius: '6px',
                                    maxHeight: '200px',
                                    overflow: 'auto',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                }}>
                                    {JSON.stringify(result.response, null, 2)}
                                </pre>
                            </div>
                        </Descriptions.Item>
                    )}
                </Descriptions>
            </Card>
        )
    }

    return (
        <Card
            title={
                <Space>
                    <ExperimentOutlined />
                    <span>Testowanie Autoryzacji</span>
                </Space>
            }
            style={{ marginTop: 24 }}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <Alert
                    message="Testy autoryzacji"
                    description="Przetestuj różne metody walidacji tokenu JWT w funkcjach Netlify"
                    type="info"
                    showIcon
                />

                <Space>
                    <Button
                        type="primary"
                        onClick={runSingleTest}
                        loading={loading === 'single'}
                        disabled={loading !== null}
                    >
                        Test podstawowy (POST)
                    </Button>
                    <Button
                        onClick={runAllMethodsTest}
                        loading={loading === 'all'}
                        disabled={loading !== null}
                    >
                        Test wszystkich metod
                    </Button>
                </Space>

                {loading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 8 }}>
                            Testowanie autoryzacji...
                        </div>
                    </div>
                )}

                {singleTestResult && !loading && (
                    <Card title="Wynik testu podstawowego" size="small">
                        <Descriptions column={1} size="small">
                            <Descriptions.Item label="Status">
                                {singleTestResult.valid ? (
                                    <Tag color="green" icon={<CheckCircleOutlined />}>
                                        Token prawidłowy
                                    </Tag>
                                ) : (
                                    <Tag color="red" icon={<CloseCircleOutlined />}>
                                        Token nieprawidłowy
                                    </Tag>
                                )}
                            </Descriptions.Item>
                            {singleTestResult.token && (
                                <Descriptions.Item label="Token">
                                    <Text code>{singleTestResult.token}</Text>
                                </Descriptions.Item>
                            )}
                            {singleTestResult.userInfo && (
                                <Descriptions.Item label=" ">
                                    <div style={{ marginTop: 8 }}>
                                        <Text strong style={{ display: 'block', marginBottom: 8 }}>
                                            Informacje użytkownika:
                                        </Text>
                                        <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                                            Dane użytkownika z serwera:
                                        </Text>
                                        <pre style={{
                                            fontSize: '12px',
                                            backgroundColor: actualTheme === 'dark' ? '#262626' : '#f5f5f5',
                                            color: actualTheme === 'dark' ? '#e6e6e6' : '#333333',
                                            border: actualTheme === 'dark' ? '1px solid #434343' : '1px solid #d9d9d9',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            maxHeight: '200px',
                                            overflow: 'auto',
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word'
                                        }}>
                                            {JSON.stringify(singleTestResult.userInfo, null, 2)}
                                        </pre>
                                    </div>
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                )}

                {allMethodsResult && !loading && (
                    <div>
                        <Title level={4}>Wyniki testów wszystkich metod</Title>

                        {renderTestResult('POST Body (JSON)', allMethodsResult.netlifyFunction)}
                        {renderTestResult('Authorization Header (Bearer)', allMethodsResult.authorizationHeader)}
                        {renderTestResult('Query Parameter (?token=...)', allMethodsResult.queryParameter)}

                        <Alert
                            message="Podsumowanie"
                            description={
                                <div>
                                    <div>✅ Działające metody: {
                                        [
                                            allMethodsResult.netlifyFunction.valid,
                                            allMethodsResult.authorizationHeader.valid,
                                            allMethodsResult.queryParameter.valid
                                        ].filter(Boolean).length
                                    }/3</div>
                                    <div>❌ Niedziałające metody: {
                                        [
                                            !allMethodsResult.netlifyFunction.valid,
                                            !allMethodsResult.authorizationHeader.valid,
                                            !allMethodsResult.queryParameter.valid
                                        ].filter(Boolean).length
                                    }/3</div>
                                </div>
                            }
                            type={
                                Object.values(allMethodsResult).every(result => result.valid)
                                    ? "success"
                                    : Object.values(allMethodsResult).some(result => result.valid)
                                        ? "warning"
                                        : "error"
                            }
                            showIcon
                            style={{ marginTop: 16 }}
                        />
                    </div>
                )}
            </Space>
        </Card>
    )
}

export default AuthTestPanel

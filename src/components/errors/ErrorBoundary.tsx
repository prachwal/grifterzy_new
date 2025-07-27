import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Result, Button, Alert, Typography } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

const { Paragraph, Text } = Typography

interface Props {
    children: ReactNode
    isDarkTheme?: boolean
}interface State {
    hasError: boolean
    error?: Error
    errorInfo?: ErrorInfo
    isDarkTheme: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)

        this.state = {
            hasError: false,
            isDarkTheme: props.isDarkTheme ?? window.matchMedia('(prefers-color-scheme: dark)').matches,
        }
    } static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            isDarkTheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
        }
    }

    componentDidUpdate(prevProps: Props): void {
        if (prevProps.isDarkTheme !== this.props.isDarkTheme) {
            this.setState({
                isDarkTheme: this.props.isDarkTheme ?? window.matchMedia('(prefers-color-scheme: dark)').matches,
            })
        }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('Error caught by boundary:', error, errorInfo)

        this.setState({
            error,
            errorInfo,
        })

        // Here you could send error to monitoring service
        // reportErrorToService(error, errorInfo)
    }

    handleReload = (): void => {
        window.location.reload()
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: undefined,
            errorInfo: undefined,
            isDarkTheme: window.matchMedia('(prefers-color-scheme: dark)').matches,
        })
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '50px 20px', maxWidth: '800px', margin: '0 auto' }}>
                    <Result
                        status="error"
                        title="Wystąpił nieoczekiwany błąd"
                        subTitle="Przepraszamy za niedogodności. Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną."
                        extra={[
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleReload}
                                key="reload"
                            >
                                Odśwież stronę
                            </Button>,
                            <Button onClick={this.handleReset} key="reset">
                                Spróbuj ponownie
                            </Button>,
                        ]}
                    >
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <Alert
                                message="Szczegóły błędu (tryb developerski)"
                                description={
                                    <div>
                                        <Paragraph>
                                            <Text strong>Błąd:</Text> {this.state.error.message}
                                        </Paragraph>
                                        <Paragraph>
                                            <Text strong>Stack trace:</Text>
                                            <pre
                                                style={{
                                                    fontSize: '12px',
                                                    overflow: 'auto',
                                                    maxHeight: '200px',
                                                    background: this.state.isDarkTheme ? '#1f1f1f' : '#f5f5f5',
                                                    color: this.state.isDarkTheme ? '#ffffff' : '#000000',
                                                    padding: '8px',
                                                    borderRadius: '4px',
                                                }}
                                            >
                                                {this.state.error.stack}
                                            </pre>
                                        </Paragraph>
                                        {this.state.errorInfo && (
                                            <Paragraph>
                                                <Text strong>Component stack:</Text>
                                                <pre
                                                    style={{
                                                        fontSize: '12px',
                                                        overflow: 'auto',
                                                        maxHeight: '200px',
                                                        background: this.state.isDarkTheme ? '#1f1f1f' : '#f5f5f5',
                                                        color: this.state.isDarkTheme ? '#ffffff' : '#000000',
                                                        padding: '8px',
                                                        borderRadius: '4px',
                                                    }}
                                                >
                                                    {this.state.errorInfo.componentStack}
                                                </pre>
                                            </Paragraph>
                                        )}
                                    </div>
                                }
                                type="error"
                                showIcon
                                style={{ marginTop: '20px', textAlign: 'left' }}
                            />
                        )}
                    </Result>
                </div>
            )
        }

        return this.props.children
    }
}

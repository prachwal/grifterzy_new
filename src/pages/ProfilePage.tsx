import { Typography, Card, Form, Input, Button, Avatar } from 'antd'
import { useAppSelector } from '../store'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { UserOutlined, MailOutlined } from '@ant-design/icons'

const { Title } = Typography

export const ProfilePage = () => {
    const { user } = useAppSelector(state => state.app)
    const { actualTheme } = useSystemTheme()

    const onFinish = (values: any) => {
        console.log('Form values:', values)
    }

    return (
        <div>
            <Title level={1}>
                <UserOutlined /> Profil użytkownika
            </Title>

            {user ? (
                <div style={{ maxWidth: 600 }}>
                    <Card
                        style={{ marginBottom: 24 }}
                        styles={{
                            header: {
                                background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                            },
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <Avatar size={64} icon={<UserOutlined />} />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>
                                    {user.name}
                                </Title>
                                <p style={{ margin: 0, color: '#666' }}>
                                    <MailOutlined /> {user.email}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card
                        title="Edytuj profil"
                        styles={{
                            header: {
                                background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                            },
                        }}
                    >
                        <Form
                            layout="vertical"
                            initialValues={{
                                name: user.name,
                                email: user.email,
                            }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                name="name"
                                label="Imię i nazwisko"
                                rules={[{ required: true, message: 'Podaj imię i nazwisko' }]}
                            >
                                <Input size="large" placeholder="Wprowadź imię i nazwisko" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Podaj adres email' },
                                    { type: 'email', message: 'Nieprawidłowy format email' },
                                ]}
                            >
                                <Input size="large" placeholder="Wprowadź adres email" />
                            </Form.Item>

                            <Form.Item>
                                <Button type="primary" htmlType="submit" size="large">
                                    Zapisz zmiany
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            ) : (
                <Card>
                    <p>Musisz być zalogowany, aby zobaczyć profil.</p>
                </Card>
            )}
        </div>
    )
}

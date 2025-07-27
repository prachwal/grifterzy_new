import { Typography, Card, Select, Divider, Radio } from 'antd'
import { useAppSelector, useAppDispatch } from '../store'
import { setTheme, setLanguage, setRegion } from '../store/slices/appSlice'
import { useSystemTheme } from '../hooks/useSystemTheme'
import { SettingOutlined } from '@ant-design/icons'

const { Title, Paragraph } = Typography
const { Option } = Select

export const SettingsPage = () => {
    const dispatch = useAppDispatch()
    const { settings } = useAppSelector((state) => state.app)
    const { systemTheme, isSystemTheme, actualTheme } = useSystemTheme()
    const handleThemeChange = (value: 'light' | 'dark' | 'system') => {
        dispatch(setTheme(value))
    }

    const handleLanguageChange = (value: 'pl' | 'en' | 'de') => {
        dispatch(setLanguage(value))
    }

    const handleRegionChange = (value: 'pl' | 'us' | 'de') => {
        dispatch(setRegion(value))
    }

    return (
        <div>
            <Title level={1}>
                <SettingOutlined /> Ustawienia
            </Title>

            <Card
                title="Wygląd aplikacji"
                style={{ maxWidth: 600 }}
                styles={{
                    header: {
                        background: actualTheme === 'dark' ? '#1f1f1f' : '#fafafa',
                    },
                }}
            >
                <div>
                    <Paragraph strong>Motyw aplikacji</Paragraph>
                    <Paragraph type="secondary">
                        Wybierz motyw: jasny, ciemny lub automatyczny (system)
                        {isSystemTheme && (
                            <span style={{ marginLeft: 8, color: '#999' }}>
                                (aktualnie: {systemTheme === 'dark' ? 'ciemny' : 'jasny'})
                            </span>
                        )}
                    </Paragraph>
                    <Radio.Group
                        value={settings.theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        style={{ marginTop: 8 }}
                    >
                        <Radio.Button value="light">☀️ Jasny</Radio.Button>
                        <Radio.Button value="dark">🌙 Ciemny</Radio.Button>
                        <Radio.Button value="system">🖥️ System</Radio.Button>
                    </Radio.Group>
                </div>

                <Divider />

                <div>
                    <Paragraph strong>Język aplikacji</Paragraph>
                    <Select
                        value={settings.language}
                        style={{ width: 200 }}
                        size="large"
                        onChange={handleLanguageChange}
                    >
                        <Option value="pl">Polski</Option>
                        <Option value="en">English</Option>
                        <Option value="de">Deutsch</Option>
                    </Select>
                </div>

                <Divider />

                <div>
                    <Paragraph strong>Region</Paragraph>
                    <Select
                        value={settings.region}
                        style={{ width: 200 }}
                        size="large"
                        onChange={handleRegionChange}
                    >
                        <Option value="pl">Polska</Option>
                        <Option value="us">United States</Option>
                        <Option value="de">Deutschland</Option>
                    </Select>
                </div>
            </Card>
        </div>
    )
}

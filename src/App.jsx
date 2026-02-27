import { ConfigProvider } from 'antd'
import AppRoutes from './routes'

const BRAND_COLOR = '#f07f29'

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_COLOR,
          colorLink: BRAND_COLOR,
          colorLinkHover: '#c4641f',
          borderRadius: 8,
          borderRadiusLG: 12,
          fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
        },
        components: {
          Menu: {
            itemSelectedColor: BRAND_COLOR,
            itemSelectedBg: '#fde8d5',
            itemActiveBg: '#fff4ec',
          },
          Button: {
            primaryShadow: '0 4px 12px rgba(240,127,41,0.3)',
          },
          Progress: {
            defaultColor: BRAND_COLOR,
          },
        },
      }}
    >
      <div className="bg-[#F2F2F2] min-h-screen">
        <AppRoutes />
      </div>
    </ConfigProvider>
  )
}

export default App

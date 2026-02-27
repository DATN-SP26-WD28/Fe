import { ConfigProvider } from 'antd'
import AppRoutes from './routes'


function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#FA4A0C', // Cam Roosta
          borderRadius: 30,        // Bo góc lớn như thiết kế
          colorBgContainer: '#EFEEEE', // Màu nền xám nhẹ của Input trong ảnh
          fontFamily: "'Source Sans Pro', sans-serif",
        },
      }}
    >
      {/* Bao bọc một div nền xám để thấy rõ các Card màu trắng */}
      <div className="bg-[#F2F2F2] min-h-screen">
        <AppRoutes />
      </div>
    </ConfigProvider>
  )
}

export default App
import React from 'react'
import { Layout } from 'antd'

const { Footer } = Layout

const FooterAdmin = () => {
  return (
    <Footer className="!py-3 text-center text-xs text-gray-400 !border-t !border-gray-100 !bg-white">
      © {new Date().getFullYear()} Roosta Dashboard. All rights reserved.
    </Footer>
  )
}

export default FooterAdmin

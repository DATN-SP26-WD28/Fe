import React, { useState } from 'react'
import { Upload, message } from 'antd'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { uploadImage } from '../../configs/upload.api'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
const MAX_SIZE_MB = 5

const ImageUpload = ({ value, onChange }) => {
  const [loading, setLoading] = useState(false)

  const beforeUpload = (file) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      message.error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)')
      return Upload.LIST_IGNORE
    }
    if (file.size / 1024 / 1024 > MAX_SIZE_MB) {
      message.error(`Ảnh phải nhỏ hơn ${MAX_SIZE_MB}MB`)
      return Upload.LIST_IGNORE
    }
    return true
  }

  const customRequest = async ({ file, onSuccess, onError }) => {
    setLoading(true)
    try {
      const url = await uploadImage(file)
      onChange?.(url)
      onSuccess(url)
      message.success('Upload ảnh thành công')
    } catch (err) {
      onError(err)
      message.error('Upload ảnh thất bại, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Upload
      accept="image/*"
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={customRequest}
      listType="picture-card"
    >
      {value ? (
        <img
          src={value}
          alt="preview"
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
        />
      ) : (
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8 }}>{loading ? 'Đang tải...' : 'Chọn ảnh'}</div>
        </div>
      )}
    </Upload>
  )
}

export default ImageUpload

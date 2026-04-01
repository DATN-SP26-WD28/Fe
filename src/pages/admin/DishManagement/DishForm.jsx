import React, { useEffect } from 'react'
import { Modal, Form, Input, InputNumber, Select } from 'antd'

const DishForm = ({ isModalOpen, handleCancel, onFinish, editingDish, categories = [], confirmLoading }) => {
  const [form] = Form.useForm()

  useEffect(() => {
    if (!isModalOpen) {
      form.resetFields()
      return
    }

    if (editingDish) {
      form.setFieldsValue({
        name: editingDish.name,
        description: editingDish.description,
        price: editingDish.price,
        image: editingDish.image,
        status: editingDish.status || 'available',
        categoryId: editingDish.category?._id || (editingDish.category_id && (editingDish.category_id._id || editingDish.category_id.id)) || undefined,
      })
      return
    }

    form.resetFields()
  }, [editingDish, isModalOpen, form])

  return (
    <Modal
      title={editingDish ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText={editingDish ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'available' }}>
        <Form.Item name="name" label="Tên món" rules={[{ required: true, message: 'Vui lòng nhập tên món' }]}>
          <Input />
        </Form.Item>

        <Form.Item name="categoryId" label="Danh mục" rules={[{ required: true, message: 'Chọn danh mục' }]}>
          <Select showSearch optionFilterProp="children" placeholder="Chọn danh mục">
            {categories.map((c) => (
              <Select.Option key={c._id || c.key} value={c._id || c.key}>{c.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="price" label="Giá" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
          <InputNumber className="w-full" min={0} />
        </Form.Item>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="image" label="URL ảnh">
          <Input />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái">
          <Select>
            <Select.Option value="available">Còn hàng</Select.Option>
            <Select.Option value="out_of_stock">Hết hàng</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default DishForm

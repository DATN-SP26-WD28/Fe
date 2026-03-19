import React from 'react'
import { Modal, Form, Input, Select, Row, Col } from 'antd'

const CategoryForm = ({ isModalOpen, handleCancel, onFinish, editingCategory, form, confirmLoading }) => {
  return (
    <Modal
      title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText={editingCategory ? 'Cập nhật' : 'Thêm mới'}
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ status: 'Active' }} className="mt-4">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="name" label="Tên danh mục" rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}>
              <Input placeholder="Ví dụ: Đồ uống" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name="description" label="Mô tả">
          <Input.TextArea rows={4} placeholder="Mô tả ngắn về danh mục" />
        </Form.Item>

        <Form.Item name="image" label="URL ảnh">
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item name="status" label="Trạng thái">
          <Select placeholder="Chọn trạng thái">
            <Select.Option value="Active">Hoạt động</Select.Option>
            <Select.Option value="Inactive">Không hoạt động</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CategoryForm

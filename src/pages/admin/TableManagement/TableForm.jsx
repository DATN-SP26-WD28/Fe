import React from 'react'
import { Modal, Form, InputNumber, Select, Input, Row, Col } from 'antd'

const TableForm = ({ 
  isModalOpen, 
  handleCancel, 
  onFinish, 
  editingTable, 
  form, 
  confirmLoading 
}) => {
  return (
    <Modal
      title={editingTable ? "Chỉnh sửa bàn ăn" : "Thêm bàn mới"}
      open={isModalOpen}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={confirmLoading}
      okText={editingTable ? "Cập nhật" : "Thêm mới"}
      cancelText="Hủy"
      destroyOnClose
      centered
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ capacity: 4, status: 'available' }}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="table_number"
              label="Tên bàn (Số bàn)"
              rules={[{ required: true, message: 'Vui lòng nhập số bàn' }]}
            >
              <InputNumber className="w-full!" min={1} placeholder="Ví dụ: 10" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="capacity"
              label="Sức chứa (người)"
              rules={[{ required: true, message: 'Vui lòng nhập sức chứa' }]}
            >
              <InputNumber className="w-full!" min={1} placeholder="Ví dụ: 4" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="status"
          label="Trạng thái bàn"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Select.Option value="available">Sẵn sàng</Select.Option>
            <Select.Option value="occupied">Đang sử dụng</Select.Option>
            <Select.Option value="reserved">Đã đặt</Select.Option>
            <Select.Option value="out_of_service">Tạm ngưng</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí / Khu vực"
        >
          <Input placeholder="Ví dụ: Tầng 1, Ngoài trời..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default TableForm

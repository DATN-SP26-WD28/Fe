import React from 'react'
import { Modal, Form, InputNumber, Select, Input, Row, Col, Button, message } from 'antd'
import { Copy } from 'lucide-react'

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
            <Select.Option value="available">Còn trống</Select.Option>
            <Select.Option value="occupied">Đang sử dụng</Select.Option>
            <Select.Option value="reserved">Đã đặt</Select.Option>
            <Select.Option value="out_of_service">Đang bảo trì</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="location"
          label="Vị trí / Khu vực"
        >
          <Input placeholder="Ví dụ: Tầng 1, Ngoài trời..." />
        </Form.Item>

        {editingTable && editingTable.qr_code && (
          <Form.Item label="Mã QR">
              <div style={{ display: 'flex', gap: 8 }}>
                <Input readOnly value={editingTable.qr_code} disabled/>
                <Button
                  type="default"
                  icon={<Copy size={14} />}
                  onClick={() => {
                    const text = editingTable.qr_code || ''
                    if (!text) return
                    navigator.clipboard?.writeText(text)
                      .then(() => message.success('Đã sao chép mã QR'))
                      .catch(() => message.error('Sao chép thất bại'))
                  }}
                />
              </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

export default TableForm

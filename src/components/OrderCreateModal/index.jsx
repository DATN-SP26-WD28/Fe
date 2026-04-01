import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Divider, Form, Input, InputNumber, Modal, Select, Space, Typography, message } from 'antd'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { fetchTables } from '@/configs/table.api'
import dishAPI from '@/configs/dish.api'
import orderAPI from '@/configs/order.api'

const { Text } = Typography

const formatVnd = (value) => `${Number(value || 0).toLocaleString()}đ`

const OrderCreateModal = ({ open, onCancel, onSuccess }) => {
  const [form] = Form.useForm()
  const [tableOptions, setTableOptions] = useState([])
  const [dishOptions, setDishOptions] = useState([])
  const [selectedDishId, setSelectedDishId] = useState(undefined)
  const [selectedQuantity, setSelectedQuantity] = useState(1)
  const [selectedItems, setSelectedItems] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }, [selectedItems])

  const tableSelectOptions = useMemo(() => {
    return tableOptions.map((table) => ({
      label: `Bàn ${table.table_number} (${table.status || 'available'})`,
      value: table._id,
    }))
  }, [tableOptions])

  const dishSelectOptions = useMemo(() => {
    return dishOptions.map((dish) => ({
      label: `${dish.name} - ${formatVnd(dish.price)}`,
      value: dish._id,
    }))
  }, [dishOptions])

  const resetState = useCallback(() => {
    form.resetFields()
    setSelectedDishId(undefined)
    setSelectedItems([])
    setSelectedQuantity(1)
  }, [form])

  useEffect(() => {
    if (!open) {
      resetState()
      return
    }

    const loadData = async () => {
      setLoadingData(true)
      try {
        const [tables, dishes] = await Promise.all([fetchTables(), dishAPI.getAll()])
        setTableOptions(Array.isArray(tables) ? tables : [])
        setDishOptions(Array.isArray(dishes) ? dishes : [])
      } catch (error) {
        console.error(error)
        message.error('Không thể tải dữ liệu bàn hoặc món ăn')
      } finally {
        setLoadingData(false)
      }
    }

    loadData()
  }, [open, resetState])

  const addDishToOrder = () => {
    if (!selectedDishId) {
      message.warning('Vui lòng chọn món để thêm')
      return
    }

    const dish = dishOptions.find((item) => item._id === selectedDishId)
    if (!dish) {
      message.error('Món ăn không hợp lệ')
      return
    }

    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.dish_id === dish._id)
      const qtyToAdd = Number(selectedQuantity) || 1
      if (existing) {
        return prev.map((item) =>
          item.dish_id === dish._id
            ? { ...item, quantity: item.quantity + qtyToAdd }
            : item,
        )
      }

      return [
        ...prev,
        {
          dish_id: dish._id,
          dish_name: dish.name,
          price: Number(dish.price || 0),
          quantity: qtyToAdd,
        },
      ]
    })

    setSelectedDishId(undefined)
    setSelectedQuantity(1)
  }

  const updateItemQuantity = (dishId, quantity) => {
    if (!quantity || quantity <= 0) {
      setSelectedItems((prev) => prev.filter((item) => item.dish_id !== dishId))
      return
    }

    setSelectedItems((prev) =>
      prev.map((item) =>
        item.dish_id === dishId
          ? { ...item, quantity }
          : item,
      ),
    )
  }

  const removeItem = (dishId) => {
    setSelectedItems((prev) => prev.filter((item) => item.dish_id !== dishId))
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!selectedItems.length) {
        message.warning('Vui lòng thêm ít nhất 1 món')
        return
      }

      const payload = {
        table_id: values.table_id,
        note: values.note || '',
        items: selectedItems.map((item) => ({
          dish_id: item.dish_id,
          quantity: Number(item.quantity),
        })),
      }

      setSubmitting(true)
      await orderAPI.createByStaff(payload)
      message.success('Tạo đơn hàng thành công')
      resetState()
      onSuccess?.()
    } catch (error) {
      if (error?.errorFields) return
      message.error(error?.response?.data?.message || 'Tạo đơn hàng thất bại')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title='Thêm mới đơn hàng'
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={submitting}
      okText='Tạo đơn hàng'
      cancelText='Hủy'
      width={860}
      destroyOnClose
    >
      <Form form={form} layout='vertical'>
        <Form.Item
          name='table_id'
          label='Chọn bàn'
          rules={[{ required: true, message: 'Vui lòng chọn bàn' }]}
        >
          <Select
            placeholder='Chọn bàn phục vụ'
            options={tableSelectOptions}
            loading={loadingData}
            showSearch
            optionFilterProp='label'
          />
        </Form.Item>

        <div className='flex gap-2'>
          <Select
            className='flex-1'
            placeholder='Chọn món ăn để thêm'
            options={dishSelectOptions}
            value={selectedDishId}
            onChange={setSelectedDishId}
            loading={loadingData}
            showSearch
            optionFilterProp='label'
          />
          <InputNumber
            min={1}
            value={selectedQuantity}
            onChange={(v) => setSelectedQuantity(Number(v) || 1)}
            style={{ width: 96 }}
          />
          <Button type='primary' icon={<PlusOutlined />} onClick={addDishToOrder}>
            Thêm món
          </Button>
        </div>

        <Divider className='my-4' />

        <div className='space-y-3 max-h-80 overflow-auto pr-1'>
          {!selectedItems.length && (
            <Text type='secondary'>Chưa có món nào trong đơn.</Text>
          )}

          {selectedItems.map((item) => (
            <div
              key={item.dish_id}
              className='border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3'
            >
              <div className='flex-1 min-w-0'>
                <div className='font-medium truncate'>{item.dish_name}</div>
                <Text type='secondary'>{formatVnd(item.price)} / món</Text>
              </div>

              <div className='flex items-center gap-2'>
                <InputNumber
                  min={1}
                  value={item.quantity}
                  onChange={(value) => updateItemQuantity(item.dish_id, Number(value))}
                />
                <Text strong>{formatVnd(item.price * item.quantity)}</Text>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeItem(item.dish_id)}
                />
              </div>
            </div>
          ))}
        </div>

        <Form.Item name='note' label='Ghi chú' className='mt-4'>
          <Input.TextArea rows={3} placeholder='Ví dụ: Ít cay, thêm đá, ...' />
        </Form.Item>
      </Form>

      <div className='mt-3 flex items-center justify-end'>
        <Text strong>Tổng tạm tính: {formatVnd(totalAmount)}</Text>
      </div>
    </Modal>
  )
}

export default OrderCreateModal

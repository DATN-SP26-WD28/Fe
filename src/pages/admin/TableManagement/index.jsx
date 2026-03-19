import React, { useState } from 'react'
import { Card, Table, Tag, Breadcrumb, Button, QRCode, message, Popconfirm, Form } from 'antd'
import { Edit, Trash2, Plus, Download, ExternalLink } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchTables, deleteTable, createTable, updateTable } from '@/configs/table.api'
import { downloadCanvasImage, composeQRCodeWithText } from '@/shared/utils/utils'
import TableForm from './TableForm'

const TableManagement = () => {
  const queryClient = useQueryClient()
  const [form] = Form.useForm()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState(null)

  // Fetch tables
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: fetchTables,
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: createTable,
    onSuccess: () => {
      message.success('Thêm bàn mới thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Số bàn đã tồn tại hoặc lỗi khác')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTable(id, data),
    onSuccess: () => {
      message.success('Cập nhật bàn thành công')
      handleCancel()
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTable(id),
    onSuccess: () => {
      message.success('Xóa bàn thành công')
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Xóa bàn thất bại')
    },
  })

  // Handlers
  const showModal = (record = null) => {
    setEditingTable(record)
    if (record) {
      form.setFieldsValue(record)
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingTable(null)
    form.resetFields()
  }

  const onFinish = (values) => {
    if (editingTable) {
      updateMutation.mutate({ id: editingTable._id, data: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const downloadQRCode = (record) => {
    const canvasEl = document.getElementById(`qr-code-${record.table_number}`)?.querySelector('canvas')
    if (!canvasEl) return

    // build title and subtitle
    const rawName = record.name || `Bàn số ${record.table_number}`
    const title = rawName
    const subtitle = 'Quét mã QR để gọi món'

    // compose a new canvas containing QR + texts
    const composed = composeQRCodeWithText(canvasEl, title, subtitle, { padding: 20, titleFont: '20px sans-serif', subtitleFont: '13px sans-serif' })
    if (!composed) return

    const safeName = String(rawName).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-_.]/g, '')
    const filename = `QRCode-${safeName}.png`
    downloadCanvasImage(composed, filename)
  }

  const columns = [
    {
      title: 'QR Code',
      dataIndex: 'qr_code',
      key: 'qr_code',
      width: 200,
      render: (qrCode, record) => (
        <div className="flex flex-col items-center gap-2">
          <div id={`qr-code-${record.table_number}`}>
            <QRCode
              value={qrCode || 'No code'}
              size={150}
              icon="/logo-roosta.png"
              errorLevel="H"
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="small"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-green-600 border border-green-100 bg-white"
              icon={<Download size={14} />}
              onClick={() => downloadQRCode(record)}
              title="Tải mã QR"
            >
              Tải về
            </Button>
            <Button
              size="small"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-blue-600 border border-blue-100 bg-white"
              icon={<ExternalLink size={14} />}
              onClick={() => {
                if (qrCode) window.open(qrCode, '_blank')
              }}
              title="Mở liên kết"
            >
              Link
            </Button>
          </div>
          {qrCode && <small className="text-gray-400 text-[10px] break-all max-w-[120px] text-center">{qrCode.replace('https://', '')}</small>}
        </div>
      ),
    },
    {
      title: 'Số bàn',
      dataIndex: 'table_number',
      key: 'table_number',
      render: (v) => <span className="font-bold text-lg text-blue-600">Bàn số {v}</span>,
    },
    {
      title: 'Sức chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      render: (v) => <span>{v} người</span>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'location',
      key: 'location',
      render: (v) => <span>{v || 'Chưa xác định'}</span>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const map = {
          available: { color: 'green', text: 'Sẵn sàng' },
          occupied: { color: 'red', text: 'Đang sử dụng' },
          reserved: { color: 'orange', text: 'Đã đặt' },
          out_of_service: { color: 'default', text: 'Tạm ngưng' },
        }
        const config = map[status] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
      },
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <span className="flex gap-2">
          <Button 
            type="text" 
            icon={<Edit size={18} />} 
            title="Sửa" 
            className="text-blue-500" 
            onClick={() => showModal(record)}
          />
          <Popconfirm
            title="Xóa bàn"
            description="Bạn có chắc chắn muốn xóa bàn này?"
            onConfirm={() => deleteMutation.mutate(record._id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button 
              type="text" 
              icon={<Trash2 size={18} />} 
              title="Xóa" 
              className="text-red-500" 
              loading={deleteMutation.isPending && deleteMutation.variables === record._id}
            />
          </Popconfirm>
        </span>
      ),
    },
  ]

  return (
    <>
      <section className="mb-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-bold text-3xl mb-2">Quản lý bàn ăn</h1>
            <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý bàn ăn' }]} />
          </div>
          <Button 
            type="primary" 
            className="rounded-xl flex items-center gap-2" 
            icon={<Plus size={18} />}
            onClick={() => showModal()}
          >
            Thêm bàn mới
          </Button>
        </div>
      </section>

      <Card className="shadow-sm rounded-2xl xl:col-span-2" title="Danh sách bàn ăn">
        <Table
          columns={columns}
          dataSource={tables}
          loading={isLoading}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          className="rounded-xl"
        />
      </Card>

      <TableForm
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingTable={editingTable}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  )
}

export default TableManagement

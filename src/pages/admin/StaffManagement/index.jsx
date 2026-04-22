import React, { useState } from 'react';
import { Card, Table, Tag, Breadcrumb, Button, Form, Popconfirm, Space, message } from 'antd';
// Bổ sung import icon Lock
import { Edit, Trash2, Plus, Lock, Unlock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ROLE_LABEL_MAP } from '@/shared/constants/app.constants';
import StaffForm from './StaffForm';
import { createStaff, deleteStaff, fetchStaff, toggleStaffStatus, updateStaff } from '@/configs/user.api';

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  const createMutation = useMutation({
    mutationFn: createStaff,
    onSuccess: () => {
      message.success('Thêm nhân viên thành công');
      handleCancel();
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Tạo nhân viên thất bại');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateStaff(id, data),
    onSuccess: () => {
      message.success('Cập nhật nhân viên thành công');
      handleCancel();
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Cập nhật thất bại');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteStaff,
    onSuccess: () => {
      message.success('Xóa nhân viên thành công');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Xóa nhân viên thất bại');
    },
  });

  // MỚI: Mutation xử lý Khóa / Mở khóa
  const toggleStatusMutation = useMutation({
    mutationFn: toggleStaffStatus,
    onSuccess: () => {
      message.success('Cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    },
  });

  const openCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setVisibleModal(true);
  };

  const onEdit = (record) => {
    setEditingStaff(record);
    form.setFieldsValue({
      username: record.username,
      email: record.email,
      phone: record.phone,
      role: record.role,
    });
    setVisibleModal(true);
  };

  const onDelete = (id) => {
    deleteMutation.mutate(id);
  };

  // MỚI: Hàm gọi API khóa
  const onToggleStatus = (id) => {
    toggleStatusMutation.mutate(id);
  };

  const onFinish = async (values) => {
    const payload = { ...values, role: 'customer' };

    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleCancel = () => {
    setVisibleModal(false);
    setEditingStaff(null);
    form.resetFields();
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      render: (_, __, index) => index + 1,
      width: 70,
      align: 'center',
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'username',
      key: 'username',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const config = ROLE_LABEL_MAP[role] || { label: role || 'Không xác định', color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      align: 'center',
      render: (_, record) => {
        // Giả định backend trả về isLocked. Thay đổi theo data thực tế của bạn
        const isLocked = record.isLocked || record.status === 'locked';
        return (
          <Tag color={isLocked ? 'error' : 'success'}>
            {isLocked ? 'Đã khóa' : 'Hoạt động'}
          </Tag>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 180,
      render: (_, record) => {
        // Giả định tương tự để đổi icon Lock/Unlock
        const isLocked = record.isLocked || record.status === 'locked';

        return (
          <Space>
            <Button
              type="text"
              icon={<Edit size={18} className="text-blue-500" />}
              onClick={() => onEdit(record)}
              title="Sửa"
            />

            <Popconfirm
              title={isLocked ? "Mở khóa tài khoản này?" : "Khóa tài khoản này?"}
              okText="Đồng ý"
              cancelText="Hủy"
              onConfirm={() => onToggleStatus(record._id)}
            >
              <Button
                type="text"
                icon={isLocked ? <Unlock size={18} className="text-green-500" /> : <Lock size={18} className="text-orange-500" />}
                title={isLocked ? "Mở khóa" : "Khóa"}
              />
            </Popconfirm>

            <Popconfirm
              title="Bạn có chắc chắn muốn xóa?"
              description={`Xóa nhân viên ${record.username}?`}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
              onConfirm={() => onDelete(record._id)}
            >
              <Button type="text" icon={<Trash2 size={18} />} title="Xóa" className="text-red-500 hover:text-red-700" />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <section>
          <h1 className="font-bold text-2xl md:text-3xl mb-1">Quản lý nhân viên</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Quản lý nhân viên' }]} />
        </section>

        <Button type="primary" icon={<Plus size={16} />} onClick={openCreateModal}>
          Thêm nhân viên
        </Button>
      </div>

      <Card className="shadow-sm rounded-2xl xl:col-span-2 border border-gray-100" title="Danh sách nhân viên">
        <Table
          columns={columns}
          dataSource={staff}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 7,
            showSizeChanger: false,
            showTotal: (total) => `Tổng cộng ${total} nhân viên`
          }}
          className="rounded-xl overflow-hidden"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <StaffForm
        isModalOpen={visibleModal}
        handleCancel={handleCancel}
        onFinish={onFinish}
        editingStaff={editingStaff}
        form={form}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
};

export default StaffManagement;
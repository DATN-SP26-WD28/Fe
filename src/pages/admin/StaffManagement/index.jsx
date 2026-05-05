import React, { useState } from 'react';
import { Card, Table, Tag, Breadcrumb, Button, Form, Popconfirm, Space, message } from 'antd';
import { Edit, Trash2, Plus, Lock, Unlock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ROLE_LABEL_MAP } from '@/shared/constants/app.constants';
import StaffForm from './StaffForm';
import {
  createStaff,
  deleteStaff,
  fetchStaff,
  toggleStaffStatus,
  updateStaff
} from '@/configs/user.api';

const StaffManagement = () => {
  const queryClient = useQueryClient();
  const [visibleModal, setVisibleModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  // 1. Lấy danh sách nhân viên
  const { data: staff = [], isLoading } = useQuery({
    queryKey: ['staff'],
    queryFn: fetchStaff,
  });

  // 2. Mutation: Tạo mới
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

  // 3. Mutation: Cập nhật
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

  // 4. Mutation: Xóa
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

  // 5. Mutation: Khóa / Mở khóa
  const toggleStatusMutation = useMutation({
    mutationFn: toggleStaffStatus,
    onSuccess: () => {
      message.success(' cập nhật trạng thái thành công');
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
    onError: (err) => {
      message.error(err.response?.data?.message || 'Lỗi cập nhật trạng thái');
    },
  });

  // Mở modal thêm mới
  const openCreateModal = () => {
    setEditingStaff(null);
    form.resetFields();
    setVisibleModal(true);
  };

  // Mở modal chỉnh sửa (Quan trọng: Phải khớp name của Form.Item)
  const onEdit = (record) => {
    setEditingStaff(record);
    form.setFieldsValue({
      username: record.username, // Khớp với name="username" trong StaffForm
      email: record.email,
      phone: record.phone,
      role: record.role,
      password: '', // Để trống mật khẩu khi sửa
    });
    setVisibleModal(true);
  };

  // Xử lý gửi dữ liệu
  const onFinish = async (values) => {
    // Lọc dữ liệu: Nếu password rỗng thì xóa luôn key password khỏi payload
    const payload = { ...values };
    if (!payload.password) {
      delete payload.password;
    }

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
      width: 60,
      align: 'center',
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'username',
      key: 'username',
      render: (value) => <span className="font-medium text-gray-700">{value}</span>,
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
        const config = ROLE_LABEL_MAP[role] || { label: role, color: 'default' };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => {
        const isLocked = record.status === 'banned' || record.isLocked;
        return (
          <Space size="middle">
            <Button
              type="text"
              className="p-0 flex items-center justify-center hover:bg-blue-50"
              icon={<Edit size={18} className="text-blue-500" />}
              onClick={() => onEdit(record)}
            />

            <Popconfirm
              title={isLocked ? "Mở khóa tài khoản?" : "Khóa tài khoản?"}
              onConfirm={() => toggleStatusMutation.mutate(record._id)}
              okText="Đồng ý"
              cancelText="Hủy"
            >
              <Button
                type="text"
                className={`p-0 flex items-center justify-center ${isLocked ? 'hover:bg-green-50' : 'hover:bg-orange-50'}`}
                icon={isLocked ?
                  <Unlock size={18} className="text-green-500" /> :
                  <Lock size={18} className="text-orange-500" />
                }
              />
            </Popconfirm>

            <Popconfirm
              title="Xóa nhân viên này?"
              onConfirm={() => deleteMutation.mutate(record._id)}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Button
                type="text"
                className="p-0 flex items-center justify-center hover:bg-red-50"
                icon={<Trash2 size={18} className="text-red-500" />}
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <section>
          <h1 className="font-bold text-2xl text-gray-800 mb-1">Quản lý nhân viên</h1>
          <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Nhân viên' }]} />
        </section>

        <Button
          type="primary"
          size="large"
          className="rounded-lg bg-orange-500 hover:bg-orange-600 border-none flex items-center gap-2"
          icon={<Plus size={18} />}
          onClick={openCreateModal}
        >
          Thêm nhân viên
        </Button>
      </div>

      <Card className="shadow-sm rounded-2xl border-none">
        <Table
          columns={columns}
          dataSource={staff}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            pageSize: 8,
            showTotal: (total) => `Tổng cộng ${total} nhân viên`,
            position: ['bottomCenter']
          }}
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
    </div>
  );
};

export default StaffManagement;
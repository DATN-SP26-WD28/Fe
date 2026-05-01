import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, message, Spin, Avatar, Tag, Breadcrumb, Modal, Divider, Space } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined, LockOutlined, SafetyOutlined, EditOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ROLE_LABEL_MAP } from '@/shared/constants/app.constants';
import { getMe, updateStaff } from '@/configs/user.api';

const BRAND_COLOR = '#f07f29';

const Profile = () => {
    const [form] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const queryClient = useQueryClient();

    // --- LOGIC GIỮ NGUYÊN 100% ---
    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
    });

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.username || user.name,
                email: user.email,
                phone: user.phone,
            });
        }
    }, [user, form]);

    const updateMutation = useMutation({
        mutationFn: (payload) => updateStaff(user._id || user.id, payload),
        onSuccess: () => {
            message.success('Cập nhật thành công!');
            queryClient.invalidateQueries({ queryKey: ['me'] });
            setIsModalOpen(false);
            passwordForm.resetFields();
        },
        onError: (err) => {
            message.error(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        },
    });

    const onFinishProfile = (values) => {
        updateMutation.mutate(values);
    };

    const onFinishPassword = (values) => {
        updateMutation.mutate({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
        });
    };

    const handleCancelModal = () => {
        setIsModalOpen(false);
        passwordForm.resetFields();
    };

    if (isLoading) {
        return <div className="h-screen flex items-center justify-center bg-slate-50"><Spin size="large" tip="Đang tải dữ liệu hồ sơ..." /></div>;
    }
    // --- KẾT THÚC PHẦN LOGIC ---

    const roleConfig = ROLE_LABEL_MAP?.[user?.role] || { label: user?.role || 'Nhân viên', color: 'blue' };

    return (
        <div className="min-h-screen font-sans bg-slate-50 p-4 -m-6 sm:m-0 sm:p-0 sm:bg-transparent pb-12">
            {/* Header */}
            <section className="mb-8">
                <h1 className="font-bold text-3xl mb-2 text-slate-800 tracking-tight">Hồ sơ cá nhân</h1>
                <Breadcrumb items={[{ title: 'Trang chủ' }, { title: 'Tài khoản' }, { title: 'Hồ sơ' }]} className="text-slate-500 font-medium" />
            </section>

            {/* Thay vì grid 3 cột, dùng grid 12 cột để chia tỷ lệ 4:8 chuyên nghiệp hơn */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl">

                {/* Cột trái: Thông tin Card (Chiếm 4/12) */}
                <Card
                    className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow lg:col-span-4 overflow-hidden relative"
                    bodyStyle={{ padding: 0 }} // Xóa padding mặc định để làm ảnh bìa
                >
                    {/* Ảnh bìa (Cover Photo) */}
                    <div className="h-28 w-full bg-gradient-to-r from-orange-400 to-orange-300 relative">
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1">
                            <SafetyOutlined /> Tài khoản nội bộ
                        </div>
                    </div>

                    {/* Avatar đẩy lên trên ảnh bìa */}
                    <div className="flex flex-col items-center px-6 pb-8">
                        <div className="-mt-14 mb-3 rounded-full bg-white p-1 shadow-lg">
                            <Avatar
                                size={100}
                                icon={<UserOutlined />}
                                className="flex items-center justify-center text-3xl"
                                style={{ backgroundColor: BRAND_COLOR }}
                            />
                        </div>

                        <h2 className="text-2xl font-bold text-slate-800 mb-1">{user?.username || user?.name}</h2>
                        <p className="text-slate-500 font-medium text-sm mb-4">{user?.email}</p>

                        <Tag color={roleConfig.color} className="text-sm px-4 py-1.5 rounded-full border-none font-semibold m-0">
                            <SafetyCertificateOutlined className="mr-1" />
                            {roleConfig.label}
                        </Tag>

                        <Divider className="my-6 border-slate-100" />

                        <div className="w-full text-left mb-6 space-y-4">
                            <div className="flex items-center text-slate-600 text-sm">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mr-3 text-slate-400">
                                    <PhoneOutlined />
                                </div>
                                <span className="font-medium">{user?.phone || 'Chưa cập nhật SĐT'}</span>
                            </div>
                        </div>

                        {/* Nút đổi mật khẩu làm nổi bật mảng bảo mật */}
                        <Button
                            type="dashed"
                            icon={<LockOutlined />}
                            size="large"
                            className="w-full rounded-xl text-orange-600 border-orange-200 hover:border-orange-500 hover:text-orange-700 hover:bg-orange-50 font-semibold transition-all"
                            onClick={() => setIsModalOpen(true)}
                        >
                            Thiết lập mật khẩu
                        </Button>
                    </div>
                </Card>

                {/* Cột phải: Form thay đổi thông tin Profile (Chiếm 8/12) */}
                <Card
                    className="rounded-3xl border-none shadow-sm lg:col-span-8"
                    title={
                        <div className="flex items-center gap-2 text-slate-800 text-lg py-2">
                            <EditOutlined className="text-orange-500" /> Thông tin cơ bản
                        </div>
                    }
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinishProfile}
                        requiredMark="optional"
                        className="mt-2"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                            <Form.Item
                                name="name"
                                label={<span className="font-semibold text-slate-700">Họ và tên</span>}
                                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                                className="md:col-span-2"
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined className="text-slate-400 mr-2" />}
                                    placeholder="Nhập họ và tên của bạn..."
                                    className="rounded-xl px-4 py-2 hover:border-orange-400 focus:border-orange-500 transition-colors bg-slate-50 focus:bg-white"
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label={<span className="font-semibold text-slate-700">Địa chỉ Email</span>}
                            >
                                <Input
                                    size="large"
                                    prefix={<MailOutlined className="text-slate-400 mr-2" />}
                                    readOnly
                                    disabled
                                    className="rounded-xl px-4 py-2 bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200"
                                />
                            </Form.Item>

                            <Form.Item
                                name="phone"
                                label={<span className="font-semibold text-slate-700">Số điện thoại liên hệ</span>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại!' },
                                    { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<PhoneOutlined className="text-slate-400 mr-2" />}
                                    placeholder="Nhập số điện thoại..."
                                    className="rounded-xl px-4 py-2 hover:border-orange-400 focus:border-orange-500 transition-colors bg-slate-50 focus:bg-white"
                                />
                            </Form.Item>
                        </div>

                        <Divider className="my-6 border-slate-100" />

                        <Form.Item className="mb-0 text-right">
                            <Space>
                                <Button size="large" className="rounded-xl font-medium px-6" onClick={() => form.resetFields()}>
                                    Khôi phục
                                </Button>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    loading={updateMutation.isPending}
                                    className="rounded-xl px-8 font-semibold shadow-lg shadow-orange-200"
                                    style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}
                                >
                                    Lưu thay đổi
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>
            </div>


            {/* Modal Đổi mật khẩu */}
            <Modal
                title={
                    <div className="flex items-center gap-2 text-xl font-bold text-slate-800 pb-2">
                        <LockOutlined className="text-orange-500" /> Đổi mật khẩu
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancelModal}
                footer={null}
                destroyOnClose
                className="rounded-2xl overflow-hidden"
            >
                <div className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-start gap-2">
                    <SafetyOutlined className="mt-0.5 text-base" />
                    <p className="m-0 leading-relaxed">
                        Vui lòng nhập mật khẩu hiện tại để xác minh. Mật khẩu mới của bạn phải có độ dài tối thiểu 6 ký tự.
                    </p>
                </div>

                <Form
                    form={passwordForm}
                    layout="vertical"
                    onFinish={onFinishPassword}
                    requiredMark="optional"
                >
                    {/* TRƯỜNG MỚI THÊM: Mật khẩu hiện tại */}
                    <Form.Item
                        name="oldPassword"
                        label={<span className="font-semibold text-slate-700">Mật khẩu hiện tại</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-slate-400 mr-2" />}
                            placeholder="Nhập mật khẩu đang sử dụng..."
                            className="rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                        />
                    </Form.Item>

                    <Form.Item
                        name="newPassword"
                        label={<span className="font-semibold text-slate-700">Mật khẩu mới</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                        ]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-slate-400 mr-2" />}
                            placeholder="Nhập mật khẩu mới..."
                            className="rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                        />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label={<span className="font-semibold text-slate-700">Xác nhận mật khẩu</span>}
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password
                            size="large"
                            prefix={<LockOutlined className="text-slate-400 mr-2" />}
                            placeholder="Nhập lại mật khẩu mới..."
                            className="rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                        />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                        <Button size="large" onClick={handleCancelModal} className="rounded-xl font-medium">
                            Hủy thao tác
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            loading={updateMutation.isPending}
                            className="rounded-xl font-semibold shadow-md shadow-orange-200"
                            style={{ backgroundColor: BRAND_COLOR, borderColor: BRAND_COLOR }}
                        >
                            Cập nhật mật khẩu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default Profile;
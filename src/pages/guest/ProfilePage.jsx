import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeftOutlined,
    EditOutlined,
    ShoppingOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    PhoneOutlined,
    CalendarOutlined,
    RightOutlined
} from '@ant-design/icons';
import { Avatar, Button, Spin, message, Modal } from 'antd';
import { getMe } from '@/configs/user.api';

const Profile = () => {
    const navigate = useNavigate();

    // 1. Gọi API lấy thông tin người dùng bằng React Query
    const { data: user, isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        // Tránh gọi lại API quá nhiều lần khi switch tab
        staleTime: 5 * 60 * 1000,
    });

    // 2. Xử lý Đăng xuất
    const handleLogout = () => {
        Modal.confirm({
            title: 'Đăng xuất?',
            content: 'Bạn có chắc chắn muốn đăng xuất khỏi Roosta không?',
            okText: 'Đăng xuất',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk() {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                message.success('Đăng xuất thành công!');
                navigate('/auth/login');
            },
        });
    };

    // 3. Định dạng ngày tháng (ví dụ: 'created_at')
    const formatDate = (dateString) => {
        if (!dateString) return '...';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN'); // Trả về dd/mm/yyyy
    };

    // 4. Hiển thị trạng thái Loading hoặc Lỗi
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spin size="large" tip="Đang tải hồ sơ..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
                <h2 className="text-xl font-bold text-red-500 mb-2">Đã có lỗi xảy ra</h2>
                <p className="text-gray-500 mb-4">Không thể tải thông tin hồ sơ. Vui lòng thử đăng nhập lại.</p>
                <Button type="primary" onClick={() => navigate('/auth/login')} className="bg-brand border-none">
                    Đăng nhập lại
                </Button>
            </div>
        );
    }

    // Lấy chữ cái đầu của username để làm Avatar nếu không có ảnh
    const avatarLetter = user?.username ? user.username.charAt(0).toUpperCase() : 'U';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header Cam - Giữ phong cách bo góc */}
            <div className="relative h-[25vh] w-full bg-orange-500 p-6">
                <div className="flex justify-between items-center text-white">
                    <button onClick={() => navigate(-1)} className="text-white">
                        <ArrowLeftOutlined className="text-xl" />
                    </button>
                    <h1 className="text-lg font-semibold">Tài khoản cá nhân</h1>
                    <button onClick={() => message.info('Tính năng đang phát triển')} className="text-white">
                        <EditOutlined className="text-lg" />
                    </button>
                </div>

                {/* Vùng bo góc lớn - z-10 để đè lên phần header */}
                <div className="absolute left-0 right-0 bottom-0 h-10 bg-white rounded-t-[30px] z-10 shadow-inner" />
            </div>

            {/* Nội dung chính - Đè lên phần bo góc */}
            <div className="flex-1 px-6 -mt-16 relative z-20">
                {/* Phần Avatar & Tên (Căn giữa) */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <Avatar
                        size={100}
                        className="bg-orange-600 border-4 border-white shadow-xl text-3xl font-bold mb-3 flex items-center justify-center"
                    >
                        {avatarLetter}
                    </Avatar>
                    <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-wide">
                        {user?.username || 'Thành viên'}
                    </h2 >
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium mt-1">
                        Hạng Đồng • 0 xu
                    </span>
                </div>

                {/* Thông tin chi tiết (Lấy từ Database) */}
                <div className="space-y-5 bg-gray-50 p-6 rounded-2xl shadow-inner mb-8">
                    <InfoItem icon={<MailOutlined />} label="Email" value={user?.email || 'Chưa cập nhật'} />
                    <InfoItem icon={<PhoneOutlined />} label="Số điện thoại" value={user?.phone || 'Chưa cập nhật'} />
                    <InfoItem icon={<CalendarOutlined />} label="Ngày tham gia" value={formatDate(user?.created_at)} />
                </div>

                {/* Các nút chức năng (Kiểu Menu List) */}
                <div className="space-y-4 mb-10">
                    <MenuListItem
                        icon={<ShoppingOutlined />}
                        label="Lịch sử đơn hàng"
                        onClick={() => navigate('/my-orders')}
                    />
                    <MenuListItem
                        icon={<LockOutlined />}
                        label="Đổi mật khẩu"
                        onClick={() => navigate('/profile/change-password')}
                    />

                    {/* Nút Đăng xuất */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white border border-red-100 p-4 rounded-xl flex items-center justify-between text-red-500 hover:bg-red-50 active:scale-95 transition-all shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <LogoutOutlined className="text-xl" />
                            <span className="font-semibold text-gray-800">Đăng xuất khỏi thiết bị</span>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- HỢP PHẦN BỔ TRỢ (HELPER COMPONENTS) ---

// 1. Hiển thị 1 dòng thông tin (Email, Phone)
const InfoItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-4">
        <div className="text-orange-500 text-lg flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-700">{value}</p>
        </div>
    </div>
);

// 2. Hiển thị 1 nút Menu (Lịch sử đơn, Đổi mật khẩu)
const MenuListItem = ({ icon, label, onClick }) => (
    <button
        onClick={onClick}
        className="w-full bg-white border-2 border-gray-100 p-4 rounded-xl flex items-center justify-between hover:border-orange-200 active:scale-95 transition-all shadow-sm"
    >
        <div className="flex items-center gap-4">
            <div className="text-gray-500 text-lg">
                {icon}
            </div>
            <span className="font-semibold text-gray-700">{label}</span>
        </div>
        <RightOutlined className="text-gray-300 text-xs" />
    </button>
);

export default Profile;
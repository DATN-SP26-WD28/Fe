import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrcodeOutlined, UserOutlined, ArrowRightOutlined, WalletOutlined, LogoutOutlined } from '@ant-design/icons';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Kiểm tra xem có user trong localStorage không
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        navigate('/auth/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Banner & Greeting */}
            <div className="relative h-[30vh] w-full bg-brand overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1470&q=80"
                    alt="Roosta Restaurant"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 flex flex-col justify-center px-6 text-white">
                    {user ? (
                        <div>
                            <p className="text-sm opacity-80">Xin chào,</p>
                            <h1 className="text-2xl font-bold uppercase tracking-wide">{user.username} 👋</h1>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-4xl font-bold tracking-wider">ROOSTA</h1>
                            <p className="text-sm font-light opacity-90 uppercase tracking-[0.2em]">Ẩm thực thượng hạng</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 px-6 py-8 -mt-8 bg-white rounded-t-[30px] shadow-2xl relative z-10">

                {/* Member Card - Chỉ hiện khi đã đăng nhập */}
                {user && (
                    <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-700 p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10 flex justify-between items-center">
                            <div>
                                <p className="text-[10px] uppercase opacity-60 tracking-widest">Điểm tích lũy</p>
                                <p className="text-2xl font-bold text-orange-400">1,250 <span className="text-sm font-normal text-white">xu</span></p>
                            </div>
                            <WalletOutlined className="text-3xl opacity-20" />
                        </div>
                        <div className="mt-4 flex gap-2">
                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full">Hạng Vàng</span>
                            <span className="text-[10px] bg-white/10 px-2 py-1 rounded-full">Giảm 5% hóa đơn</span>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h2 className="text-lg font-bold text-gray-800">
                        {user ? "Hôm nay bạn muốn dùng gì?" : "Chào mừng bạn đến với Roosta!"}
                    </h2>
                </div>

                {/* Actions */}
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/select-table')}
                        className="w-full bg-orange-500 text-white p-5 rounded-2xl flex items-center justify-between shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <QrcodeOutlined className="text-2xl" />
                            <div className="text-left">
                                <p className="font-bold text-lg">Đặt món tại bàn</p>
                                <p className="text-xs opacity-80">Quét mã QR để bắt đầu</p>
                            </div>
                        </div>
                        <ArrowRightOutlined />
                    </button>

                    {/* Nút động dựa trên Auth */}
                    {!user ? (
                        <button
                            onClick={() => navigate('/auth/login')}
                            className="w-full bg-white border-2 border-gray-100 text-gray-700 p-5 rounded-2xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <UserOutlined className="text-2xl text-gray-400" />
                                <div className="text-left">
                                    <p className="font-bold text-lg">Thành viên Roosta</p>
                                    <p className="text-xs text-gray-400">Đăng nhập nhận 50k xu</p>
                                </div>
                            </div>
                            <ArrowRightOutlined className="text-gray-300" />
                        </button>
                    ) : (
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/profile')}
                                className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center gap-2 border border-gray-100"
                            >
                                <UserOutlined className="text-xl text-orange-500" />
                                <span className="text-xs font-semibold">Tài khoản</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="bg-gray-50 p-4 rounded-2xl flex flex-col items-center gap-2 border border-gray-100"
                            >
                                <LogoutOutlined className="text-xl text-red-400" />
                                <span className="text-xs font-semibold">Đăng xuất</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Food Teaser */}
                <div className="mt-8">
                    <h3 className="font-semibold text-gray-800 mb-4">Gợi ý riêng cho bạn</h3>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="min-w-[140px] bg-white rounded-2xl shadow-md border border-gray-50 shrink-0">
                                <img src={`https://picsum.photos/200/150?random=${item + 10}`} className="w-full h-24 object-cover rounded-t-2xl" />
                                <div className="p-3">
                                    <p className="text-[11px] font-bold text-gray-700 truncate">Lẩu Nấm Thượng Hạng</p>
                                    <p className="text-[10px] text-orange-500 font-medium mt-1">Sẵn sàng phục vụ</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
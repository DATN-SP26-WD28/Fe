import React from 'react';
import { useNavigate } from 'react-router-dom';
import { QrcodeOutlined, UserOutlined, ArrowRightOutlined } from '@ant-design/icons';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Banner Nhà Hàng */}
            <div className="relative h-[40vh] w-full">
                <img
                    src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                    alt="Roosta Restaurant"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white p-6 text-center">
                    <h1 className="text-4xl font-bold mb-2 tracking-wider">ROOSTA</h1>
                    <p className="text-sm font-light opacity-90 uppercase tracking-[0.2em]">Ẩm thực lẩu nấm & nướng thượng hạng</p>
                </div>
            </div>

            {/* Nội dung chính */}
            <div className="flex-1 px-6 py-8 -mt-6 bg-white rounded-t-[30px] shadow-2xl relative z-10">
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Chào mừng bạn đến với Roosta!</h2>
                    <p className="text-gray-500 text-sm mt-1">Vui lòng chọn bàn hoặc đăng nhập để bắt đầu trải nghiệm dịch vụ của chúng tôi.</p>
                </div>

                {/* Các lựa chọn hành động */}
                <div className="space-y-4">
                    {/* Nút Chọn Bàn / Quét QR */}
                    <button
                        onClick={() => navigate('/select-table')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white p-5 rounded-2xl flex items-center justify-between transition-all active:scale-95 shadow-lg shadow-red-200"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <QrcodeOutlined className="text-2xl" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg">Đặt món tại bàn</p>
                                <p className="text-xs opacity-80">Quét mã QR hoặc nhập số bàn</p>
                            </div>
                        </div>
                        <ArrowRightOutlined />
                    </button>

                    {/* Nút Đăng nhập cho Thành viên */}
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full bg-white border-2 border-gray-100 hover:border-red-100 text-gray-700 p-5 rounded-2xl flex items-center justify-between transition-all active:scale-95 shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-3 rounded-xl">
                                <UserOutlined className="text-2xl text-gray-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-bold text-lg text-gray-800">Thành viên Roosta</p>
                                <p className="text-xs text-gray-400">Đăng nhập để nhận ưu đãi</p>
                            </div>
                        </div>
                        <ArrowRightOutlined className="text-gray-300" />
                    </button>
                </div>

                {/* Phần gợi ý món ăn đặc sắc (Teaser) */}
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Món ngon phải thử</h3>
                        <span className="text-red-500 text-xs">Xem thực đơn</span>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="min-w-[140px] bg-gray-50 rounded-xl overflow-hidden shadow-sm">
                                <img src={`https://picsum.photos/200/150?random=${item}`} alt="food" className="w-full h-24 object-cover" />
                                <div className="p-2">
                                    <p className="text-[10px] font-bold text-gray-700 truncate">Lẩu Nấm Chim Kê</p>
                                    <p className="text-[10px] text-red-500 mt-1">Từ 299.000đ</p>
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
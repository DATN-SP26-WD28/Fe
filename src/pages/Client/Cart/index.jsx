import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, DeleteOutlined, MinusOutlined, PlusOutlined, GiftOutlined } from '@ant-design/icons';

const Cart = () => {
    const navigate = useNavigate();
    const [usePoints, setUsePoints] = useState(false);

    // Dữ liệu giả lập
    const cartItems = [
        { id: 1, name: 'Thịt Bò Mỹ Thượng Hạng', price: 159000, quantity: 2, image: 'https://picsum.photos/200' },
        { id: 2, name: 'Nước Lẩu Nấm', price: 89000, quantity: 1, image: 'https://picsum.photos/201' },
    ];

    const subTotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const pointsAvailable = 50000; // Số điểm người dùng đang có
    const discount = usePoints ? Math.min(pointsAvailable, subTotal) : 0;
    const finalTotal = subTotal - discount;

    return (
        <div className="min-h-screen bg-gray-50 pb-32">
            {/* Header */}
            <div className="bg-white p-4 flex items-center gap-4 border-b sticky top-0 z-10">
                <ArrowLeftOutlined onClick={() => navigate(-1)} className="text-xl" />
                <h1 className="text-lg font-bold">Giỏ hàng của bạn (3)</h1>
            </div>

            {/* Danh sách món ăn */}
            <div className="p-4 space-y-4">
                {cartItems.map((item) => (
                    <div key={item.id} className="bg-white p-3 rounded-2xl flex gap-3 shadow-sm">
                        <img src={item.image} className="w-20 h-20 rounded-xl object-cover" alt={item.name} />
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between">
                                <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{item.name}</h3>
                                <DeleteOutlined className="text-gray-400" />
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-red-600 font-bold">{(item.price).toLocaleString()}đ</span>
                                <div className="flex items-center gap-3 bg-gray-100 px-2 py-1 rounded-lg">
                                    <MinusOutlined className="text-xs" />
                                    <span className="font-bold text-sm">{item.quantity}</span>
                                    <PlusOutlined className="text-xs text-red-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Hệ thống tích điểm */}
            <div className="px-4 mt-2">
                <div className={`p-4 rounded-2xl border-2 transition-all ${usePoints ? 'bg-red-50 border-red-200' : 'bg-white border-transparent'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                                <GiftOutlined className="text-xl" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Điểm Roosta hiện có</p>
                                <p className="font-bold text-gray-800">{pointsAvailable.toLocaleString()} P</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setUsePoints(!usePoints)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${usePoints ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {usePoints ? 'Đang dùng' : 'Dùng ngay'}
                        </button>
                    </div>
                    {usePoints && (
                        <p className="text-[10px] text-red-500 mt-2 italic">* Bạn sẽ được giảm {discount.toLocaleString()}đ trực tiếp vào hóa đơn này.</p>
                    )}
                </div>
            </div>

            {/* Tổng kết thanh toán */}
            {/* Tổng kết thanh toán - Cập nhật lại class */}
            <div className="fixed bottom-16 left-0 right-0 bg-white p-4 border-t shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
                <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-gray-500 text-xs">
                        <span>Tạm tính</span>
                        <span>{subTotal.toLocaleString()}đ</span>
                    </div>
                    {usePoints && (
                        <div className="flex justify-between text-red-600 text-xs">
                            <span>Giảm giá điểm thưởng</span>
                            <span>-{discount.toLocaleString()}đ</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-bold text-sm">Tổng cộng</span>
                        <span className="text-lg font-black text-red-600">{finalTotal.toLocaleString()}đ</span>
                    </div>
                </div>
                <button className="w-full bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-red-200 active:scale-95 transition-all text-sm">
                    GỬI ĐƠN XUỐNG BẾP
                </button>
            </div>
        </div>
    );
};

export default Cart;
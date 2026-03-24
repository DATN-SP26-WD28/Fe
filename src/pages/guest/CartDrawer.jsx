import React, { useState } from 'react';
import { Drawer, List, Avatar, Button, Typography, Empty, message, Badge } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useCart } from '@/contexts/CartContext';
import { useNavigate, useParams } from 'react-router-dom';
import orderAPI from '@/configs/order.api'; // Đảm bảo bạn đã tạo file này để gọi API

const { Text, Title } = Typography;

const CartDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { tableId } = useParams();
    const { cart, addToCart, removeFromCart, totalItems, totalPrice, clearCart } = useCart();

    // State quản lý trạng thái đang gửi đơn (tránh nhấn đúp)
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Lấy thông tin từ session
    const guestName = sessionStorage.getItem('guestName') || 'Khách vãng lai';

    const handleCheckout = async () => {
        if (cart.length === 0) return;

        setIsSubmitting(true);
        try {
            // 1. Chuẩn bị dữ liệu gửi lên Backend
            const orderData = {
                table_id: tableId,
                customer_name: guestName,
                items: cart.map(item => ({
                    dish_id: item._id,
                    quantity: item.quantity,
                    price: Number(item.price) || 0
                })),
                total_amount: totalPrice,
                status: 'pending' // Chờ bếp xác nhận
            };

            // 2. Gọi API tạo đơn hàng (Bạn cần xử lý route POST /orders ở Backend)
            await orderAPI.create(orderData);

            // 3. Xử lý thành công
            message.success("Đã gửi đơn xuống bếp thành công!");
            clearCart(); // Xóa sạch giỏ hàng tạm thời
            onClose();   // Đóng Drawer

            // 4. Chuyển hướng khách sang trang theo dõi đơn hàng
            navigate(`/table-order/${tableId}/orders`);

        } catch (error) {
            console.error("Lỗi đặt món:", error);
            message.error(error.response?.data?.message || "Không thể gửi đơn. Vui lòng thử lại!");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Drawer
            title={
                <div className="flex justify-between items-center">
                    <Title level={4} className="!m-0">Món đã chọn</Title>
                    <Badge count={totalItems} color="#f07f29" />
                </div>
            }
            placement="bottom"
            onClose={onClose}
            open={isOpen}
            height="75%"
            className="rounded-t-[3rem]"
            footer={
                <div className="p-4 bg-gray-50 rounded-t-3xl border-t">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="flex flex-col">
                            <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tổng thanh toán</Text>
                            <Text className="text-[10px] text-gray-400 italic">(Đã bao gồm VAT)</Text>
                        </div>
                        <Text className="text-3xl font-black text-orange-500 italic">
                            {(totalPrice || 0).toLocaleString('vi-VN')}đ
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        block
                        size="large"
                        loading={isSubmitting}
                        disabled={cart.length === 0 || isSubmitting}
                        className="h-16 rounded-2xl bg-orange-500 font-black text-lg border-none uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all"
                        onClick={handleCheckout}
                    >
                        {isSubmitting ? 'Đang gửi đơn...' : 'Gửi đơn xuống bếp'}
                    </Button>
                </div>
            }
        >
            {cart.length > 0 ? (
                <List
                    itemLayout="horizontal"
                    dataSource={cart}
                    renderItem={(item) => (
                        <List.Item
                            className="px-0 py-6 border-b border-gray-100 last:border-none"
                            actions={[
                                <div key="qty" className="flex items-center bg-gray-100 p-1 rounded-full gap-4">
                                    <Button
                                        shape="circle"
                                        icon={<MinusOutlined />}
                                        size="small"
                                        onClick={() => removeFromCart(item._id)}
                                        className="border-none shadow-sm flex items-center justify-center bg-white"
                                    />
                                    <b className="text-lg w-4 text-center">{item.quantity}</b>
                                    <Button
                                        shape="circle"
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        size="small"
                                        onClick={() => addToCart(item)}
                                        className="bg-orange-500 border-none shadow-sm flex items-center justify-center"
                                    />
                                </div>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        src={item.image}
                                        shape="square"
                                        size={80}
                                        className="rounded-2xl shadow-sm border border-gray-100 object-cover"
                                    />
                                }
                                title={<span className="text-lg font-black text-gray-800 leading-tight">{item.name}</span>}
                                description={
                                    <div className="flex flex-col">
                                        <span className="text-orange-500 font-bold text-base">
                                            {(Number(item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                                        </span>
                                        <Text type="secondary" className="text-[11px]">Đơn giá: {(Number(item.price || 0)).toLocaleString('vi-VN')}đ</Text>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4 opacity-60">
                    <Empty description="Giỏ hàng đang trống" />
                    <Button
                        onClick={onClose}
                        className="rounded-full px-8 font-bold border-orange-500 text-orange-500"
                    >
                        Quay lại thực đơn
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default CartDrawer;
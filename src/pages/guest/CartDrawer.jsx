import React from 'react';
import { Drawer, List, Avatar, Button, Typography, Empty } from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useCart } from '@/contexts/CartContext';
import { useNavigate, useParams } from 'react-router-dom';

const { Text, Title } = Typography;

const CartDrawer = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { tableId } = useParams(); // Lấy tableId từ URL nếu có
    const { cart, addToCart, removeFromCart, totalItems, totalPrice } = useCart();

    const handleCheckout = () => {
        onClose();
        // Điều hướng đến trang thanh toán
        if (tableId) {
            navigate(`/table-order/${tableId}/payment`);
        } else {
            navigate('/select-table');
        }
    };

    return (
        <Drawer
            title={
                <div className="flex justify-between items-center">
                    <Title level={4} className="!m-0">Món đã chọn</Title>
                    <Text type="secondary">{totalItems} món</Text>
                </div>
            }
            placement="bottom"
            onClose={onClose}
            open={isOpen}
            height="75%"
            className="rounded-t-[3rem]"
            footer={
                <div className="p-4 bg-gray-50 rounded-t-3xl border-t">
                    <div className="flex justify-between items-center mb-6">
                        <Text className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Tổng cộng thanh toán</Text>
                        <Text className="text-3xl font-black text-orange-500 italic">
                            {(totalPrice || 0).toLocaleString('vi-VN')}đ
                        </Text>
                    </div>
                    <Button
                        type="primary"
                        block
                        size="large"
                        disabled={cart.length === 0}
                        className="h-16 rounded-2xl bg-orange-500 font-black text-lg border-none uppercase tracking-widest shadow-lg shadow-orange-200 active:scale-95 transition-all"
                        onClick={handleCheckout}
                    >
                        Gửi đơn xuống bếp
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
                            className="px-0 py-6"
                            actions={[
                                <div key="qty" className="flex items-center bg-gray-100 p-1 rounded-full gap-4">
                                    <Button
                                        shape="circle"
                                        icon={<MinusOutlined />}
                                        size="small"
                                        onClick={() => removeFromCart(item._id)}
                                        className="border-none shadow-sm hover:text-red-500"
                                    />
                                    <b className="text-lg w-4 text-center">{item.quantity}</b>
                                    <Button
                                        shape="circle"
                                        type="primary"
                                        icon={<PlusOutlined />}
                                        size="small"
                                        onClick={() => addToCart(item)}
                                        className="bg-orange-500 border-none shadow-sm"
                                    />
                                </div>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar src={item.image} shape="square" size={80} className="rounded-2xl shadow-sm object-cover" />}
                                title={<span className="text-lg font-black text-gray-800 leading-tight">{item.name}</span>}
                                description={
                                    <span className="text-orange-500 font-bold text-base">
                                        {(Number(item.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                                    </span>
                                }
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                    <Empty description="Bạn chưa chọn món nào" />
                    <Button onClick={onClose} className="rounded-full px-8 font-bold border-orange-500 text-orange-500">
                        Tiếp tục chọn món
                    </Button>
                </div>
            )}
        </Drawer>
    );
};

export default CartDrawer;
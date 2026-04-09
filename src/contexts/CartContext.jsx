import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Modal, List, Button, Input, Typography, Space, Badge, message } from 'antd';
import { ShoppingCartOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { parsePrice } from '@/shared/utils/currency';
import orderAPI from '@/configs/order.api';


const { Title, Text } = Typography;
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const saved = sessionStorage.getItem('roosta_cart');
        try { return saved ? JSON.parse(saved) : []; } catch { return []; }
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [note, setNote] = useState("");
    const [isOrdering, setIsOrdering] = useState(false);

    useEffect(() => {
        sessionStorage.setItem('roosta_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = useCallback((product) => {
        setCart((prev) => {
            const exist = prev.find((item) => item._id === product._id);
            if (exist) return prev.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, price: parsePrice(product.price), quantity: 1 }];
        });
    }, []);

    const removeFromCart = useCallback((productId) => {
        setCart((prev) => prev.reduce((acc, item) => {
            if (item._id === productId) {
                if (item.quantity > 1) acc.push({ ...item, quantity: item.quantity - 1 });
            } else acc.push(item);
            return acc;
        }, []));
    }, []);

    const clearCart = () => {
        setCart([]);
        setNote("");
        sessionStorage.removeItem('roosta_cart');
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsOrdering(true);
        try {
            const orderData = {
                items: cart.map(item => ({ dish_id: item._id, quantity: item.quantity, price: item.price })),
                note: note
            };
            const res = await orderAPI.create(orderData);
            if (res) {
                message.success("Đặt món thành công! Bếp đã nhận đơn.");
                clearCart();
                setIsModalOpen(false);
                // Try to get current tableId from URL (/table-order/:tableId/...) or guestInfo
                const pathMatch = window.location.pathname.match(/\/table-order\/([^\/]+)/);
                const tableIdFromUrl = pathMatch ? pathMatch[1] : null;
                let tableId = tableIdFromUrl;
                if (tableId) {
                    // Use full page navigation to ensure router (CartProvider is outside Router)
                    window.location.href = `/table-order/${tableId}/orders`;
                }
            }
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi đặt món!");
        } finally {
            setIsOrdering(false);
        }
    };

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice, openCart: () => setIsModalOpen(true) }}>
            {children}
            <Modal
                title={
                    <div className="flex items-center gap-2 pb-3">
                        <ShoppingCartOutlined className="text-orange-500 text-xl" />
                        <span className="text-lg font-bold text-gray-800">Món ăn đã chọn ({totalItems})</span>
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
                centered
                className="roosta-cart-modal"
                styles={{ body: { padding: '10px 0' } }}
            >
                <div className="max-h-[60vh] overflow-y-auto px-4">
                    <List
                        dataSource={cart}
                        locale={{ emptyText: <div className="py-10 text-gray-400">Chưa có món nào trong giỏ</div> }}
                        renderItem={(item) => (
                            <List.Item className="border-b-gray-50">
                                <div className="flex w-full justify-between items-center py-1 gap-3">
                                    <img src={item.image} alt={item.name} width={80} height={80} className='size-20 rounded-lg object-cover' />
                                    <div className="flex-1">
                                        <Text strong className="text-gray-800 block">{item.name}</Text>
                                        <Text className="text-orange-500 font-medium">{item.price?.toLocaleString()}đ</Text>
                                    </div>
                                    <Space className="bg-orange-50 p-1 rounded-full border border-orange-100">
                                        <Button size="small" shape="circle" type="text" icon={<MinusOutlined className="text-xs" />} onClick={() => removeFromCart(item._id)} />
                                        <Text strong className="w-6 text-center inline-block">{item.quantity}</Text>
                                        <Button size="small" shape="circle" type="text" icon={<PlusOutlined className="text-xs text-orange-600" />} onClick={() => addToCart(item)} />
                                    </Space>
                                </div>
                            </List.Item>
                        )}
                    />
                </div>

                <div className="px-4 mt-4">
                    <Text strong className="text-gray-600 block mb-2">Ghi chú</Text>
                    <Input.TextArea
                        placeholder="Ví dụ: Không cay, nhiều đá..."
                        rows={3} value={note} onChange={(e) => setNote(e.target.value)}
                        className="rounded-xl bg-gray-50 border-none focus:bg-white transition-all"
                    />
                    <div className="flex justify-between items-center my-5">
                        <Text className="text-gray-500 uppercase text-xs tracking-wider font-bold">Tổng thanh toán</Text>
                        <Title level={3} className="!m-0 text-[#f07f29]">{totalPrice.toLocaleString()}đ</Title>
                    </div>

                    <Button
                        type="primary" block size="large"
                        loading={isOrdering} onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="h-14 rounded-2xl bg-[#f07f29] hover:bg-[#cf6a20] border-none text-lg font-bold shadow-lg shadow-orange-200"
                    >
                        Đặt món
                    </Button>
                </div>
            </Modal>

            {/* THANH TỔNG KẾT NHANH (STICKY BOTTOM BAR) */}
            {totalItems > 0 && !isModalOpen && (
                <div
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg z-50 animate-bounce-in"
                    onClick={() => setIsModalOpen(true)}
                >
                    <div className="p-4 rounded-2xl flex justify-between items-center cursor-pointer shadow-sm text-white bg-orange-50">
                        <Space size="large">
                            <Badge count={totalItems} color="#f07f29" offset={[5, -5]}>
                                <ShoppingCartOutlined className="text-2xl" />
                            </Badge>
                            <div>
                                <div className="text-[10px] uppercase text-slate-800 font-bold leading-none mb-1">Món ăn đã chọn</div>
                                <div className="font-bold text-lg leading-none text-orange-500">{totalPrice.toLocaleString()}đ</div>
                            </div>
                        </Space>
                        <div className="bg-[#f07f29] px-4 py-2 rounded-xl font-bold text-sm">
                            Xem giỏ hàng
                        </div>
                    </div>
                </div>
            )}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
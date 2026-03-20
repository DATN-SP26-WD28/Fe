import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // 1. Tự động tải giỏ hàng từ sessionStorage khi khởi động
    useEffect(() => {
        const savedCart = sessionStorage.getItem('roosta_cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // 2. Tự động lưu giỏ hàng mỗi khi có thay đổi
    useEffect(() => {
        sessionStorage.setItem('roosta_cart', JSON.stringify(cart));
    }, [cart]);

    // Hàm thêm món vào giỏ
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === product._id);
            if (existingItem) {
                // Nếu món đã có, tăng số lượng
                return prevCart.map((item) =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            // Nếu món mới, thêm vào với số lượng là 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    // Hàm xóa/giảm số lượng
    const removeFromCart = (productId) => {
        setCart((prevCart) =>
            prevCart.reduce((acc, item) => {
                if (item._id === productId) {
                    if (item.quantity > 1) acc.push({ ...item, quantity: item.quantity - 1 });
                } else {
                    acc.push(item);
                }
                return acc;
            }, [])
        );
    };

    // Hàm xóa trắng giỏ hàng (sau khi đặt đơn thành công)
    const clearCart = () => setCart([]);

    // Tính toán tổng cộng
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
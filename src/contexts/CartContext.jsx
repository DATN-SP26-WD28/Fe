import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // 1. Khởi tạo giỏ hàng từ sessionStorage (Lazy Initializer)
    const [cart, setCart] = useState(() => {
        const savedCart = sessionStorage.getItem('roosta_cart');
        try {
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Lỗi parse giỏ hàng:", error);
            return [];
        }
    });

    // 2. Tự động lưu giỏ hàng mỗi khi có thay đổi
    useEffect(() => {
        sessionStorage.setItem('roosta_cart', JSON.stringify(cart));
    }, [cart]);

    // Hàm thêm món vào giỏ
    const addToCart = useCallback((product) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find((item) => item._id === product._id);
            if (existingItem) {
                return prevCart.map((item) =>
                    item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prevCart, { ...product, quantity: 1 }];
        });
    }, []);

    // Hàm xóa/giảm số lượng
    const removeFromCart = useCallback((productId) => {
        setCart((prevCart) =>
            prevCart.reduce((acc, item) => {
                if (item._id === productId) {
                    if (item.quantity > 1) {
                        acc.push({ ...item, quantity: item.quantity - 1 });
                    }
                } else {
                    acc.push(item);
                }
                return acc;
            }, [])
        );
    }, []);

    const clearCart = useCallback(() => setCart([]), []);

    // 3. Tính toán tổng cộng (Ép kiểu Number để tránh lỗi NaN)
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => {
        const price = Number(item.price) || 0;
        return sum + price * item.quantity;
    }, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart phải được sử dụng trong CartProvider');
    }
    return context;
};
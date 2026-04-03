import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Result, Button, Card, Typography, Spin } from 'antd';
import { CheckCircleFilled, CloseCircleFilled, HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Text } = Typography;

const PaymentResult = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Lấy các thông tin quan trọng từ URL VNPay trả về
    const responseCode = searchParams.get('vnp_ResponseCode');
    const amount = searchParams.get('vnp_Amount');
    const transactionNo = searchParams.get('vnp_TransactionNo');
    const orderInfo = searchParams.get('vnp_OrderInfo');

    useEffect(() => {
        // Giả lập thời gian kiểm tra giao dịch
        const timer = setTimeout(() => {
            setLoading(false);
            // Nếu thành công, Khanh có thể xóa Giỏ hàng cục bộ ở đây nếu có dùng LocalStorage
            if (responseCode === '00') {
                localStorage.removeItem('cart'); 
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [responseCode]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Spin size="large" />
                <p className="mt-4 font-bold text-gray-500 animate-pulse">ĐANG XÁC THỰC GIAO DỊCH...</p>
            </div>
        );
    }

    const isSuccess = responseCode === '00';

    return (
        <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-xl rounded-3xl border-none overflow-hidden">
                <Result
                    status={isSuccess ? "success" : "error"}
                    title={
                        <span className="font-black uppercase text-2xl tracking-tight">
                            {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
                        </span>
                    }
                    subTitle={
                        <Text className="text-gray-500">
                            {isSuccess 
                                ? "Cảm ơn bạn đã trải nghiệm dịch vụ tại Roosta. Chúc bạn ngon miệng!" 
                                : "Giao dịch không thành công hoặc đã bị hủy. Vui lòng thử lại."}
                        </Text>
                    }
                    extra={[
                        <div key="actions" className="flex flex-col gap-3">
                            <Button 
                                type="primary" 
                                icon={isSuccess ? <HomeOutlined /> : <ShoppingCartOutlined />}
                                className={`h-12 rounded-2xl font-black uppercase tracking-widest border-none ${isSuccess ? 'bg-green-500' : 'bg-orange-500'}`}
                                onClick={() => navigate('/')}
                            >
                                {isSuccess ? "Về trang chủ" : "Quay lại đơn hàng"}
                            </Button>
                            {isSuccess && (
                                <Text className="text-[10px] text-gray-400 uppercase font-bold">
                                    Bàn của bạn đã được giải phóng tự động
                                </Text>
                            )}
                        </div>
                    ]}
                >
                    {isSuccess && (
                        <div className="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200">
                            <div className="flex justify-between mb-2">
                                <Text type="secondary">Mã giao dịch:</Text>
                                <Text strong>{transactionNo}</Text>
                            </div>
                            <div className="flex justify-between mb-2">
                                <Text type="secondary">Số tiền:</Text>
                                <Text strong className="text-orange-500">
                                    {new Intl.NumberFormat('vi-VN').format(amount / 100)}đ
                                </Text>
                            </div>
                            <div className="flex justify-between">
                                <Text type="secondary">Nội dung:</Text>
                                <Text strong className="truncate ml-4">{orderInfo}</Text>
                            </div>
                        </div>
                    )}
                </Result>
            </Card>
        </div>
    );
};

export default PaymentResult;
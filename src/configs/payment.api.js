import axiosInstance from "./axiosClient";

const PREFIX = '/payments'; // Khớp với route ở Backend của bạn

const paymentAPI = {
    /**
     * @description Tạo URL thanh toán VNPay cho khách hàng tại bàn
     * @param {Object} data { table_id, amount, bankCode }
     */
    createUrl: (data) => {
        return axiosInstance.post(`${PREFIX}/create-url`, data);
    },

    /**
     * @description Xử lý thanh toán trực tiếp tại quầy (Dành cho Admin/Staff)
     * @param {Object} data { table_id, method, amount_paid, split_count, note }
     */
    processCounter: (data) => {
        return axiosInstance.post(`${PREFIX}/process`, data);
    },

    /**
     * @description Lấy lịch sử giao dịch của một hóa đơn cụ thể
     */
    getHistoryByInvoice: (invoiceId) => {
        return axiosInstance.get(`${PREFIX}/history/${invoiceId}`);
    }
};

export default paymentAPI;
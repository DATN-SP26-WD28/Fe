import axiosInstance from "./axiosClient";

const invoiceAPI = {
    // Lấy toàn bộ danh sách hóa đơn (Để làm trang Thống kê/Lịch sử)
    getAll: (params) => {
        const url = "/invoices?limit=99999";
        return axiosInstance.get(url, { params });
    },

    // Lấy chi tiết 1 hóa đơn theo ID
    getById: (id) => {
        const url = `/invoices/${id}`;
        return axiosInstance.get(url);
    },

    // Lấy thống kê tổng hợp (Nếu Backend của bạn có hỗ trợ route này)
    getStats: () => {
        const url = "/invoices/stats/summary";
        return axiosInstance.get(url);
    },

    // Xóa hóa đơn (Nếu cần)
    delete: (id) => {
        const url = `/invoices/${id}`;
        return axiosInstance.delete(url);
    }
};

export default invoiceAPI;
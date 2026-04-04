import axiosClient from "./axiosClient";

const PREFIX = "/orders";

const orderAPI = {
    // 1. Khách hàng: Tạo đơn hàng mới
    create: (data) => {
        return axiosClient.post(PREFIX, data);
    },

    // 1b. Admin/Nhân viên: Tạo đơn hàng cho bàn bất kỳ
    createByStaff: (data) => {
        return axiosClient.post(`${PREFIX}/staff-create`, data);
    },

    // 2. Admin/Staff: Lấy toàn bộ danh sách đơn hàng (đã tích hợp Table & Guest)
    getAll: () => {
        return axiosClient.get(PREFIX);
    },

    // 3. Hệ thống: Lấy chi tiết 1 đơn hàng (bao gồm mảng items món ăn)
    getById: (id) => {
        return axiosClient.get(`${PREFIX}/${id}`);
    },

    // 4. Khách hàng: Xem lịch sử gọi món của bàn hiện tại
    getByTable: (tableNumber) => {
        return axiosClient.get(`${PREFIX}/table/${tableNumber}`);
    },

    // 5. Admin/Bếp: Cập nhật trạng thái đơn hàng (Pending -> Preparing -> Served)
    updateStatus: (id, status) => {
        return axiosClient.put(`${PREFIX}/${id}`, { status });
    },

    // 6. Admin: Hủy hoặc xóa đơn hàng (khi khách thanh toán xong hoặc hủy món)
    delete: (id) => {
        return axiosClient.delete(`${PREFIX}/${id}`);
    },
    switchTable: (data) => {
        const url = "/orders/switch-table";
        return axiosClient.post(url, data);
    },
};

export default orderAPI;
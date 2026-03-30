import axiosClient from "./axiosClient";

const PREFIX = "/orders";

const orderAPI = {
    // 1. Khách hàng: Tạo đơn hàng mới
    create: (data) => {
        return axiosClient.post(PREFIX, data);
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
    getByTable: (tableId) => {
        return axiosClient.get(`${PREFIX}/table/${tableId}`);
    },

    // 5. Admin/Bếp: Cập nhật trạng thái đơn hàng (Pending -> Preparing -> Served)
    updateStatus: (id, status) => {
        return axiosClient.put(`${PREFIX}/${id}`, { status });
    },

    // 6. Admin: Hủy hoặc xóa đơn hàng (khi khách thanh toán xong hoặc hủy món)
    delete: (id) => {
        return axiosClient.delete(`${PREFIX}/${id}`);
    }
};

export default orderAPI;
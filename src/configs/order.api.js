import axiosClient from "./axiosClient";

const orderAPI = {
    create: (data) => {
        return axiosClient.post("/orders", data);
    },

    getByTable: (tableId) => {
        return axiosClient.get(`/orders/table/${tableId}`);
    }
};

export default orderAPI;
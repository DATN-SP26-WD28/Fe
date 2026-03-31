import axiosInstance from "./axiosClient";

const guestAPI = {
    // Phương thức login cho khách vãng lai
    login: (data) => {
        // data sẽ bao gồm username và table_id
        return axiosInstance.post("/guest/login", data);
    },
};

export default guestAPI;
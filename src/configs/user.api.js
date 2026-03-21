import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả khách hàng (customers)
 */
export const fetchUsers = async () => {
  const response = await axiosInstance.get('/customers');
  // Transform backend response: { message, data, meta }
  // Map username -> name, _id -> id
  const users = response.data.map(user => ({
    id: user._id,
    key: user._id,
    name: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  }));
  return users;
};

/**
 * Lấy khách hàng theo ID
 */
export const getUserById = async (id) => {
  const response = await axiosInstance.get(`/customers/${id}`);
  return response.data;
};

/**
 * Tạo khách hàng mới
 */
export const createUser = async (userData) => {
  const payload = {
    username: userData.name,
    email: userData.email,
    phone: userData.phone,
  };
  const response = await axiosInstance.post('/customers', payload);
  return response.data;
};

/**
 * Cập nhật khách hàng
 */
export const updateUser = async (id, userData) => {
  const payload = {
    username: userData.name,
    email: userData.email,
    phone: userData.phone,
  };
  const response = await axiosInstance.put(`/customers/${id}`, payload);
  return response.data;
};

/**
 * Xóa khách hàng
 */
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/customers/${id}`);
  return response.data;
};

/**
 * Khóa/Mở khóa khách hàng
 */
export const toggleCustomerStatus = async (id) => {
  const response = await axiosInstance.patch(`/customers/${id}/toggle-status`);
  return response.data;
};

/**
 * Thêm điểm loyalty cho khách hàng
 */
export const addLoyaltyPoints = async (id, points) => {
  const response = await axiosInstance.patch(`/customers/${id}/add-loyalty-points`, { points });
  return response.data;
};

export const registerUser = async (userData) => {
  const formattedData = {
    username: userData.fullname,
    email: userData.email,
    phone: userData.phone,
    password: userData.password,
    role: 'customer'
  };

  const response = await axiosInstance.post('/auth/register', formattedData);
  return response;
};

export const loginUser = async (credentials) => {
  const response = await axiosInstance.post('/auth/login', {
    email: credentials.email,
    password: credentials.password
  });
  return response;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/users/me');
  return response.data;
};
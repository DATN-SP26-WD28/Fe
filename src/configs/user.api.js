import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả người dùng
 */
export const fetchUsers = async () => {
  const response = await axiosInstance.get('/users');
  return response.data.data; // Trả về mảng users từ createResponse của backend
};

/**
 * Tạo người dùng mới
 * @param {Object} userData { name, email, phone, role }
 */
export const createUser = async (userData) => {
  const response = await axiosInstance.post('/users', userData);
  return response.data;
};

/**
 * Cập nhật thông tin người dùng
 * @param {string} id User ID
 * @param {Object} userData { name, email, phone, role }
 */
export const updateUser = async (id, userData) => {
  const response = await axiosInstance.put(`/users/${id}`, userData);
  return response.data;
};

/**
 * Xóa người dùng
 * @param {string} id User ID
 */
export const deleteUser = async (id) => {
  const response = await axiosInstance.delete(`/users/${id}`);
  return response.data;
};
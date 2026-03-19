import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả người dùng
 */
export const fetchUsers = async () => {
  const { data } = await axiosInstance.get('/users');
  return data; // Trả về mảng users từ createResponse của backend
};

/**
 * Tạo người dùng mới
 * @param {Object} userData { name, email, phone, role }
 */
export const createUser = async (userData) => {
  const { data } = await axiosInstance.post('/users', userData);
  return data;
};

/**
 * Cập nhật thông tin người dùng
 * @param {string} id User ID
 * @param {Object} userData { name, email, phone, role }
 */
export const updateUser = async (id, userData) => {
  const { data } = await axiosInstance.put(`/users/${id}`, userData);
  return data;
};

/**
 * Xóa người dùng
 * @param {string} id User ID
 */
export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`/users/${id}`);
  return data;
};
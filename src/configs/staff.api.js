import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả nhân viên
 */
export const fetchStaff = async () => {
  const { data } = await axiosInstance.get('/staff');
  return data; // Trả về mảng staff từ createResponse của backend
};

/**
 * Tạo nhân viên mới
 * @param {Object} staffData { name, email, phone, role }
 */
export const createStaff = async (staffData) => {
  const { data } = await axiosInstance.post('/staff', staffData);
  return data;
};

/**
 * Cập nhật thông tin nhân viên
 * @param {string} id Staff ID
 * @param {Object} staffData { name, email, phone, role }
 */
export const updateStaff = async (id, staffData) => {
  const { data } = await axiosInstance.put(`/staff/${id}`, staffData);
  return data;
};

/**
 * Xóa nhân viên
 * @param {string} id Staff ID
 */
export const deleteStaff = async (id) => {
  const { data } = await axiosInstance.delete(`/staff/${id}`);
  return data;
};
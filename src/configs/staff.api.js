import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả nhân viên
 */
export const fetchStaff = async () => {
  const response = await axiosInstance.get('/staff');
  const staffList = response?.data || [];
  return staffList.map((item, index) => ({
    ...item,
    username: item.username || item.name || '',
    name: item.name || item.username || '',
    key: item.key || item._id || index + 1,
  }));
};

/**
 * Tạo nhân viên mới
 * @param {Object} staffData { name, email, phone, role }
 */
export const createStaff = async (staffData) => {
  const response = await axiosInstance.post('/staff', staffData);
  const data = response?.data;
  return data;
};

/**
 * Cập nhật thông tin nhân viên
 * @param {string} id Staff ID
 * @param {Object} staffData { name, email, phone, role }
 */
export const updateStaff = async (id, staffData) => {
  const response = await axiosInstance.put(`/staff/${id}`, staffData);
  const data = response?.data;
  return data;
};

/**
 * Xóa nhân viên
 * @param {string} id Staff ID
 */
export const deleteStaff = async (id) => {
  const response = await axiosInstance.delete(`/staff/${id}`);
  const data = response?.data;
  return data;
};
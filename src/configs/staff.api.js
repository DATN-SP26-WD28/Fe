import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả nhân viên (staff)
 */
export const fetchStaff = async () => {
  const response = await axiosInstance.get('/staff');
  // Transform backend response: { message, data, meta }
  // Map username -> name, _id -> id
  const staff = response.data.map(user => ({
    id: user._id,
    key: user._id, // Ant Design table needs key
    name: user.username,
    email: user.email,
    phone: user.phone,
    role: user.role,
  }));
  return staff;
};

/**
 * Lấy nhân viên theo ID
 */
export const getStaffById = async (id) => {
  const response = await axiosInstance.get(`/staff/${id}`);
  return response.data;
};

/**
 * Tạo nhân viên mới
 */
export const createStaff = async (staffData) => {
  const payload = {
    username: staffData.name,
    email: staffData.email,
    phone: staffData.phone,
    role: staffData.role,
  };
  const response = await axiosInstance.post('/staff', payload);
  return response.data;
};

/**
 * Cập nhật nhân viên
 */
export const updateStaff = async (id, staffData) => {
  const payload = {
    username: staffData.name,
    email: staffData.email,
    phone: staffData.phone,
    role: staffData.role,
  };
  const response = await axiosInstance.put(`/staff/${id}`, payload);
  return response.data;
};

/**
 * Xóa nhân viên
 */
export const deleteStaff = async (id) => {
  const response = await axiosInstance.delete(`/staff/${id}`);
  return response.data;
};

/**
 * Khóa/Mở khóa nhân viên
 */
export const toggleStaffStatus = async (id) => {
  const response = await axiosInstance.patch(`/staff/${id}/toggle-status`);
  return response.data;
};

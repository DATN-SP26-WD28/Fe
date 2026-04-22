import axiosInstance from './axiosClient';

// Lấy danh sách nhân viên (role customer)
export const fetchStaff = async () => {
  const { data } = await axiosInstance.get('/users/customers');
  return data;
};

// Tạo nhân viên mới
export const createStaff = async (staffData) => {
  const { data } = await axiosInstance.post('/users', staffData);
  return data;
};

// Cập nhật thông tin
export const updateStaff = async (id, staffData) => {
  const { data } = await axiosInstance.put(`/users/${id}`, staffData);
  return data;
};

// Xóa nhân viên vĩnh viễn
export const deleteStaff = async (id) => {
  const { data } = await axiosInstance.delete(`/users/${id}`);
  return data;
};

// Khóa / Mở khóa nhân viên
export const toggleStaffStatus = async (id) => {
  const { data } = await axiosInstance.patch(`/users/lock-user/${id}`);
  return data;
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
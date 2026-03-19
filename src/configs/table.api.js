import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả các bàn
 */
export const fetchTables = async () => {
  const response = await axiosInstance.get('/tables');
  return response.data.data; // Trả về mảng tables từ createResponse của backend
};

/**
 * Tạo bàn mới
 * @param {Object} tableData { table_number, capacity }
 */
export const createTable = async (tableData) => {
  const response = await axiosInstance.post('/tables', tableData);
  return response.data;
};

/**
 * Cập nhật thông tin bàn
 * @param {string} id Table ID
 * @param {Object} tableData { table_number, capacity, status, location }
 */
export const updateTable = async (id, tableData) => {
  const response = await axiosInstance.put(`/tables/${id}`, tableData);
  return response.data;
};

/**
 * Xóa bàn
 * @param {string} id Table ID
 */
export const deleteTable = async (id) => {
  const response = await axiosInstance.delete(`/tables/${id}`);
  return response.data;
};

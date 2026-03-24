import axiosInstance from './axiosClient';

/**
 * Lấy danh sách tất cả các bàn
 */
export const fetchTables = async () => {
  const { data } = await axiosInstance.get('/tables');
  return data; // Trả về mảng tables từ createResponse của backend
};

/**
 * Tạo bàn mới
 * @param {Object} tableData { table_number, capacity }
 */
export const createTable = async (tableData) => {
  const { data } = await axiosInstance.post('/tables', tableData);
  return data;
};

/**
 * Cập nhật thông tin bàn
 * @param {string} id Table ID
 * @param {Object} tableData { table_number, capacity, status, location }
 */
export const updateTable = async (id, tableData) => {
  const { data } = await axiosInstance.put(`/tables/${id}`, tableData);
  return data;
};

/**
 * Xóa bàn
 * @param {string} id Table ID
 */
export const deleteTable = async (id) => {
  const { data } = await axiosInstance.delete(`/tables/${id}`);
  return data;
};
/**
 * Làm mới QR token cho bàn
 * @param {string} id Table ID
 */
export const regenerateTableToken = async (id) => {
  const { data } = await axiosInstance.patch(`/tables/${id}/regenerate-token`);
  return data;
};

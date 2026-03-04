import { API_URL } from "../constants"
// Lấy link của Bàn ăn khi quét QR
export const getTableLink = (tableId, code) => {
  return `${API_URL}/tables/${tableId}/?code=${code}`
}
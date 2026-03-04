// Lấy link của Bàn ăn khi quét QR
export const getTableLink = (tableId, code) => {
  return `${import.meta.env.VITE_API_URL}/tables/${tableId}/?code=${code}`
}
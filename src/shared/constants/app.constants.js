// 1. ĐỊNH NGHĨA TRẠNG THÁI (TỐI GIẢN CÒN 4 BƯỚC)
export const ORDER_ITEM_STATUS = {
  pending: 'pending',     // Chờ xử lý (Màu cam - Cần chú ý)
  confirmed: 'confirmed', // Đã xác nhận (Màu xanh - Bếp đang làm/Xong món)
  served: 'served',       // Đã phục vụ (Màu xanh lá - Hoàn tất)
  canceled: 'canceled',   // Đã hủy (Màu đỏ - Thất bại)
}

// 2. MAPPING HIỂN THỊ (Màu sắc & Nhãn)
export const ORDER_ITEM_STATUS_MAP = {
  [ORDER_ITEM_STATUS.pending]: { color: 'gold', label: 'Chờ xử lý' },
  [ORDER_ITEM_STATUS.confirmed]: { color: 'blue', label: 'Đã xác nhận' },
  [ORDER_ITEM_STATUS.served]: { color: 'green', label: 'Đã phục vụ' },
  [ORDER_ITEM_STATUS.canceled]: { color: 'red', label: 'Đã hủy' },
}

// 3. OPTIONS CHO SELECT/DROPDOWN
export const ORDER_ITEM_STATUS_OPTIONS = Object.values(ORDER_ITEM_STATUS).map((status) => ({
  value: status,
  label: ORDER_ITEM_STATUS_MAP[status].label,
}))

// 4. CHUẨN HÓA DỮ LIỆU (QUAN TRỌNG: Gộp các trạng thái cũ/lẻ vào bộ mới)
export const ORDER_STATUS_NORMALIZE_MAP = {
  // Gộp tất cả các bước trung gian vào 'confirmed'
  'in_progress': ORDER_ITEM_STATUS.confirmed,
  'preparing': ORDER_ITEM_STATUS.confirmed,
  'ready': ORDER_ITEM_STATUS.confirmed,
  'in_progress': ORDER_ITEM_STATUS.confirmed,
  // Xử lý lỗi chính tả (canceled vs cancelled)
  'cancelled': ORDER_ITEM_STATUS.canceled,
  'da huy': ORDER_ITEM_STATUS.canceled,
  'da phuc vu': ORDER_ITEM_STATUS.served,
  'completed': ORDER_ITEM_STATUS.served,
}

export const normalizeOrderStatus = (status) => {
  if (!status) return ORDER_ITEM_STATUS.pending
  const normalized = String(status).trim().toLowerCase()
  return ORDER_STATUS_NORMALIZE_MAP[normalized] || normalized
}

// 5. CÁC NHÓM TRẠNG THÁI ĐỂ FILTER/LOGIC
export const ORDER_PREPARING_STATUSES = [ORDER_ITEM_STATUS.confirmed] 
export const ORDER_SERVED_STATUSES = [ORDER_ITEM_STATUS.served]
export const ORDER_CANCELED_STATUSES = [ORDER_ITEM_STATUS.canceled]

// 6. QUẢN LÝ VAI TRÒ (ROLES)
export const ROLE_LABEL_MAP = {
  admin: { label: 'Quản trị viên', color: 'geekblue' },
  cashier: { label: 'Thu ngân', color: 'green' },
  waiter: { label: 'Phục vụ', color: 'cyan' },
  chef: { label: 'Nhân viên bếp', color: 'orange' },
  customer: { label: 'Khách hàng', color: 'default' },
}

export const STAFF_ROLE_VALUES = ['admin', 'cashier', 'waiter', 'chef']
export const USER_ROLE_VALUES = [...STAFF_ROLE_VALUES, 'customer']

export const DEFAULT_STAFF_ROLE = 'waiter'
export const DEFAULT_USER_ROLE = 'customer'

// 7. HELPER FUNCTIONS
export const toRoleOptions = (values) => {
  return values.map((value) => ({
    value,
    label: ROLE_LABEL_MAP[value]?.label || value,
  }))
}
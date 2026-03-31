export const ORDER_ITEM_STATUS = {
  pending: 'pending',
  inProgress: 'in_progress',
  ready: 'ready',
  served: 'served',
  canceled: 'canceled',
}

export const ORDER_ITEM_STATUS_MAP = {
  [ORDER_ITEM_STATUS.pending]: { color: 'gold', label: 'Chờ xử lý' },
  [ORDER_ITEM_STATUS.inProgress]: { color: 'blue', label: 'Đang nấu' },
  [ORDER_ITEM_STATUS.ready]: { color: 'geekblue', label: 'Sẵn sàng' },
  [ORDER_ITEM_STATUS.served]: { color: 'green', label: 'Đã phục vụ' },
  [ORDER_ITEM_STATUS.canceled]: { color: 'red', label: 'Đã hủy' },
}

export const ORDER_ITEM_STATUS_OPTIONS = [
  { value: ORDER_ITEM_STATUS.pending, label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.pending].label },
  { value: ORDER_ITEM_STATUS.inProgress, label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.inProgress].label },
  { value: ORDER_ITEM_STATUS.ready, label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.ready].label },
  { value: ORDER_ITEM_STATUS.served, label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.served].label },
  { value: ORDER_ITEM_STATUS.canceled, label: ORDER_ITEM_STATUS_MAP[ORDER_ITEM_STATUS.canceled].label },
]

export const ORDER_STATUS_NORMALIZE_MAP = {
  preparing: ORDER_ITEM_STATUS.inProgress,
  cancelled: ORDER_ITEM_STATUS.canceled,
}

export const normalizeOrderStatus = (status) => {
  const normalized = String(status || '').trim().toLowerCase()
  return ORDER_STATUS_NORMALIZE_MAP[normalized] || normalized
}

export const ORDER_PREPARING_STATUSES = [ORDER_ITEM_STATUS.inProgress, 'preparing', ORDER_ITEM_STATUS.ready]
export const ORDER_SERVED_STATUSES = [ORDER_ITEM_STATUS.served, 'completed']
export const ORDER_CANCELED_STATUSES = [ORDER_ITEM_STATUS.canceled, 'cancelled']

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

export const toRoleOptions = (values) => {
  return values.map((value) => ({
    value,
    label: ROLE_LABEL_MAP[value]?.label || value,
  }))
}
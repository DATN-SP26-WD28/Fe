const AUTH_KEYS = {
  token: 'token',
  user: 'user',
  refreshToken: 'refreshToken',
  guestInfo: 'guestInfo',
}

export const ADMIN_ALLOWED_ROLES = ['admin', 'cashier', 'waiter', 'chef', 'customer','staff']

const parseUser = (rawUser) => {
  if (!rawUser) return null

  try {
    const parsed = JSON.parse(rawUser)
    return typeof parsed === 'object' && parsed ? parsed : null
  } catch {
    return null
  }
}

export const getAuthSession = () => {
  const token = localStorage.getItem(AUTH_KEYS.token)
  const user = parseUser(localStorage.getItem(AUTH_KEYS.user))

  return {
    token,
    user,
    role: user?.role ?? null,
  }
}

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEYS.token)
  localStorage.removeItem(AUTH_KEYS.user)
  localStorage.removeItem(AUTH_KEYS.refreshToken)
  localStorage.removeItem(AUTH_KEYS.guestInfo)
}

export const hasAllowedRole = (role, allowedRoles = []) => {
  if (!role || !allowedRoles.length) return false
  return allowedRoles.includes(role)
}

export const isAuthenticatedAdminSession = () => {
  const { token, role } = getAuthSession()
  return Boolean(token) && hasAllowedRole(role, ADMIN_ALLOWED_ROLES)
}

import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticatedAdminSession } from '@/shared/utils/authSession'

const PublicRoute = ({ redirectTo = '/admin', children }) => {
  if (isAuthenticatedAdminSession()) {
    return <Navigate to={redirectTo} replace />
  }

  return children || <Outlet />
}

export default PublicRoute
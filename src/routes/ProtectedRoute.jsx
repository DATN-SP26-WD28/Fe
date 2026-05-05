import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
	clearAuthSession,
	getAuthSession,
	hasAllowedRole,
} from '@/shared/utils/authSession'

const ProtectedRoute = ({ allowedRoles = [], redirectTo = '/login', children }) => {
	const location = useLocation()
	const { token, user, role } = getAuthSession()

	if (!token || !user || user.status === 'banned') {
		clearAuthSession()
		return <Navigate to="/login" replace />
	}

	if (allowedRoles.length && !hasAllowedRole(role, allowedRoles)) {
		clearAuthSession()
		return <Navigate to={redirectTo} replace state={{ from: location }} />
	}

	return children || <Outlet />
}

export default ProtectedRoute
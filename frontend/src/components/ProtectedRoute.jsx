// components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  if (!token) {
    return <Navigate to="/admin" replace />
  }

  return allowedRoles.includes(role) ? (
    <Outlet />
  ) : (
    <Navigate to="/admin" replace />
  )
}

ProtectedRoute.propTypes = {
  allowedRoles: PropTypes.arrayOf(PropTypes.string).isRequired
}

export default ProtectedRoute
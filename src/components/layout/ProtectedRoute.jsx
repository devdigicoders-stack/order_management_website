import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';

export const ProtectedRoute = ({ allowedRoles }) => {
  const user = useStore(state => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

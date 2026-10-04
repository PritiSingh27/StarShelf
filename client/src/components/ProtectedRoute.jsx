import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext.jsx';
import Skeleton from './ui/Skeleton.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Skeleton className="w-48 h-12" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDefaultPath(user.role)} replace />;
  }

  return children;
}

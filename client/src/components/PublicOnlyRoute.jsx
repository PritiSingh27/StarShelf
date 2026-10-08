import { Navigate } from 'react-router-dom';
import { useAuth, getRoleDefaultPath } from '../context/AuthContext.jsx';
import Skeleton from './ui/Skeleton.jsx';

export default function PublicOnlyRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Skeleton className="w-48 h-12" />
      </div>
    );
  }

  if (user) {
    return <Navigate to={getRoleDefaultPath(user.role)} replace />;
  }

  return children;
}

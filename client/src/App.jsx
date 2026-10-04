import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth, getRoleDefaultPath } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import AppShell from './components/layout/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Skeleton from './components/ui/Skeleton.jsx';

import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminUsers from './pages/admin/Users.jsx';
import AdminUserDetails from './pages/admin/UserDetails.jsx';
import AdminStores from './pages/admin/Stores.jsx';

import UserStores from './pages/user/Stores.jsx';
import OwnerDashboard from './pages/owner/Dashboard.jsx';

function RoleRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Skeleton className="w-48 h-12" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={getRoleDefaultPath(user.role)} replace />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<RoleRedirect />} />
              <Route path="/profile" element={<Profile />} />

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUserDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/stores"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminStores />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/stores"
                element={
                  <ProtectedRoute allowedRoles={['USER']}>
                    <UserStores />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/owner"
                element={
                  <ProtectedRoute allowedRoles={['OWNER']}>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

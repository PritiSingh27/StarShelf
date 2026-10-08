import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api/axios.js';

const AuthContext = createContext();

export function getRoleDefaultPath(role) {
  if (role === 'ADMIN') return '/admin';
  if (role === 'OWNER') return '/owner';
  return '/stores';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser({
        id: res.data.id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
        address: res.data.address,
        emailVerified: res.data.emailVerified,
      });
      setEmailVerificationRequired(Boolean(res.data.emailVerificationRequired));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const loginUser = (userData) => {
    if (userData?.token) {
      localStorage.setItem('token', userData.token);
    }
    setUser(userData);
  };

  const logoutUser = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout clear local state regardless
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        emailVerificationRequired,
        login: loginUser,
        logout: logoutUser,
        refetchUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

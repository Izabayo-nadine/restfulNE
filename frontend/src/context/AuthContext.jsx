import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/services';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fems_user'));
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fems_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .profile()
      .then((res) => {
        setUser(res.data.data);
        localStorage.setItem('fems_user', JSON.stringify(res.data.data));
      })
      .catch(() => {
        localStorage.removeItem('fems_token');
        localStorage.removeItem('fems_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem('fems_token', token);
    localStorage.setItem('fems_user', JSON.stringify(u));
    setUser(u);
    return u;
  }, []);


  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      /* ignore */
    }
    localStorage.removeItem('fems_token');
    localStorage.removeItem('fems_user');
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles) => user && roles.includes(user.role),
    [user]
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

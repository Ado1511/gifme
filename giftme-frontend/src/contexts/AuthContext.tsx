import { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  role?: string;
  isVerified?: boolean;
  exp: number;
}

interface AuthContextType {
  user: DecodedToken | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const decodeAndSetUser = (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      if (decoded.exp * 1000 < Date.now()) {
        // Token expirado
        logout();
        return;
      }

      setUser(decoded);
      localStorage.setItem('token', token);
    } catch (err) {
      console.error('❌ Invalid token:', err);
      logout();
    }
  };

  const login = (token: string) => {
    decodeAndSetUser(token);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      decodeAndSetUser(storedToken);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

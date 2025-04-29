// src/hooks/useAuth.ts
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  _id: any;
  avatar: string;
  id: string;
  username: string;
  email?: string;
  role?: string;
  isVerified?: boolean;
  exp: number;
}

export function useAuth(): {
  user: DecodedToken | null;
  logout: () => void;
} {
  const token = localStorage.getItem('token');

  let decoded: DecodedToken | null = null;

  if (token) {
    try {
      const parsed = jwtDecode<DecodedToken>(token);

      // Verificamos expiración del token
      if (parsed.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
      } else {
        decoded = parsed;
      }
    } catch (err) {
      console.error('❌ Invalid token:', err);
      localStorage.removeItem('token');
    }
  }

  // Función logout global
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); // si usás también localStorage de usuario
  };

  return { user: decoded, logout };
}

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { tokenStorage } from '../components/auth/token-storage';
import { apiRequest } from '../services/api';
import {
  AuthUser,
  CurrentUserResponse,
  LoginResponse,
} from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const logout = useCallback(() => {
    tokenStorage.remove();
    setUser(null);
  }, []);

  const restoreSession = useCallback(async () => {
    const token = tokenStorage.get();

    if (!token) {
      setUser(null);
      setIsInitializing(false);
      return;
    }

    try {
      const response = await apiRequest<CurrentUserResponse>(
        '/api/auth/me'
      );

      setUser(response.user);
    } catch {
      tokenStorage.remove();
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<LoginResponse>(
        '/api/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      tokenStorage.set(response.accessToken);
      setUser(response.user);
    },
    []
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      restoreSession,
    }),
    [
      user,
      isInitializing,
      login,
      logout,
      restoreSession,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
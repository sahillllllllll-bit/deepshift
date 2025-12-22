import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, UserRole } from "@shared/schema";

interface AuthContextType {
  user: Omit<User, "password"> | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: Omit<User, "password">, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Omit<User, "password">) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACCESS_TOKEN_KEY = "deepshift_access_token";
const REFRESH_TOKEN_KEY = "deepshift_refresh_token";
const USER_KEY = "deepshift_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Omit<User, "password"> | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshTokens = useCallback(async () => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      setUser(data.user);
      setAccessToken(data.accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
      return true;
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
      setAccessToken(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setAccessToken(storedToken);
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
    } else if (storedRefresh) {
      refreshTokens();
    }
    setIsLoading(false);
  }, [refreshTokens]);

  useEffect(() => {
    if (!accessToken) return;

    const interval = setInterval(() => {
      refreshTokens();
    }, 50 * 60 * 1000);

    return () => clearInterval(interval);
  }, [accessToken, refreshTokens]);

  const login = useCallback((user: Omit<User, "password">, accessToken: string, refreshToken: string) => {
    setUser(user);
    setAccessToken(accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }, []);

  const updateUser = useCallback((updatedUser: Omit<User, "password">) => {
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isAuthenticated, isLoading } = useAuth();

  const isAuthorized = isAuthenticated && (!allowedRoles || (user && allowedRoles.includes(user.role)));

  return { user, isAuthenticated, isLoading, isAuthorized };
}

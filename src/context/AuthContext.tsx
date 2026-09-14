import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  getToken,
  getUser,
  setSession,
  setUser,
  clearSession,
  clearUser,
  type User,
} from "@/lib/auth";
import type { AuthResponse } from "@/lib/api";
import { subscribeSession } from "@/lib/session-events";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    } else if (storedToken && !storedUser) {
      clearSession();
      clearUser();
    }
  }, []);

  useEffect(() => {
    const handleSessionEvent = (e: { type: "cleared" | "refreshed" }) => {
      if (e.type === "cleared") {
        setTokenState(null);
        setUserState(null);
        queryClient.clear();
        if (window.location.pathname !== "/login") navigate("/login");
      } else {
        setTokenState(getToken());
        setUserState(getUser());
      }
    };
    const unsub = subscribeSession(handleSessionEvent);
    return unsub;
  }, [navigate, queryClient]);

  const login = (auth: AuthResponse) => {
    setSession(auth.token, auth.refreshToken);
    const newUser = { userId: auth.userId, email: auth.email, name: auth.name };
    setUser(newUser);
    setTokenState(auth.token);
    setUserState(newUser);
    navigate("/links");
  };

  const logout = () => {
    clearSession();
    clearUser();
    setTokenState(null);
    setUserState(null);
    queryClient.clear();
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

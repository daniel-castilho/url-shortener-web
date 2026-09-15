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
import type { AuthResponse, UserResponse } from "@/lib/api";
import { subscribeSession, emitSession } from "@/lib/session-events";
import { isCookieAuth } from "@/lib/auth-mode";
import { api } from "@/lib/api";

interface ApiErrorLike {
  status: number;
}

type AuthStatus = "loading" | "ready";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  login: (auth: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Bearer mode: the session lives in sessionStorage, so the first paint can
  // already be authenticated — no effect needed. Cookie mode starts "loading"
  // until the async /me rehydrate settles.
  const [user, setUserState] = useState<User | null>(() => (isCookieAuth() ? null : getUser()));
  const [token, setTokenState] = useState<string | null>(() => (isCookieAuth() ? null : getToken()));
  const [status, setStatus] = useState<AuthStatus>(() => (isCookieAuth() ? "loading" : "ready"));
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    const cookieMode = isCookieAuth();
    if (cookieMode) {
      api.me()
        .then((me: UserResponse) => {
          const newUser: User = { userId: me.userId, email: me.email, name: me.name };
          setUser(newUser);
          setUserState(newUser);
        })
        .catch((err) => {
          if (err instanceof Error && "status" in err && (err as ApiErrorLike).status === 401) {
            emitSession({ type: "cleared" });
          } else if (err instanceof Error && "status" in err && (err as ApiErrorLike).status === 404) {
            console.log("Java /me ausente");
          }
        })
        .finally(() => setStatus("ready"));
      return;
    }

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
        setStatus("ready");
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
    const cookieMode = isCookieAuth();
    if (cookieMode) {
      api.logout().catch(() => {});
    }
    clearSession();
    clearUser();
    setTokenState(null);
    setUserState(null);
    queryClient.clear();
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, status, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

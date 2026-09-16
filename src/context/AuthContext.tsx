import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import { subscribeSession } from "@/lib/session-events";
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
  // True between the "Sign out" click and the router committing "/". Private
  // shows "Loading" in this window instead of <Navigate to="/login">.
  pendingLogout: boolean;
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
  // True while the cookie-mode /me rehydrate is in flight. A 401 there means
  // "anonymous visitor" (refresh failed, session never existed or already
  // dead) — not "expired mid-session". Public routes must stay put; Private
  // guards expired sessions on its own.
  const rehydratingRef = useRef(false);
  // Set while logout's navigate("/") transition is still in flight. The auth
  // state only goes null once "/" actually commits, so Private never renders
  // with an anonymous session in the (now abandoned) private route.
  const [pendingLogout, setPendingLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const cookieMode = isCookieAuth();
    if (cookieMode) {
      rehydratingRef.current = true;
      api.me()
        .then((me: UserResponse) => {
          const newUser: User = { userId: me.userId, email: me.email, name: me.name, role: me.role };
          setUser(newUser);
          setUserState(newUser);
        })
        .catch((err) => {
          if (err instanceof Error && "status" in err && (err as ApiErrorLike).status === 401) {
            // Anonymous visitor — no session to clear, no navigation.
            // (the api layer already attempted refresh and emitted "cleared";
            //  we swallow the bounce for public routes below)
          } else if (err instanceof Error && "status" in err && (err as ApiErrorLike).status === 404) {
            console.log("Java /me missing");
          }
        })
        .finally(() => {
          rehydratingRef.current = false;
          setStatus("ready");
        });
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
        // During cookie rehydrate a "cleared" from a failed anonymous /me
        // refresh must not hijack public routes to /login; same for a
        // "cleared" that lands while logout's home transition is in flight.
        if (rehydratingRef.current || pendingLogout) return;
        // A logged-out/expired session on a public route is already safe —
        // only a private route (guarded by <Private>) should bounce to login.
        const path = window.location.pathname;
        if (path === "/links" || path.startsWith("/links/")) navigate("/login");
      } else {
        setTokenState(getToken());
        setUserState(getUser());
      }
    };
    const unsub = subscribeSession(handleSessionEvent);
    return unsub;
  }, [navigate, queryClient, pendingLogout]);

  // Finish the logout only after the home transition commits. The session is
  // kept visible while on /links* (Private shows "Loading" via pendingLogout),
  // then cleared atomically with the flag once "/" is the real location.
  useEffect(() => {
    if (pendingLogout && location.pathname === "/") {
      setPendingLogout(false);
      setTokenState(null);
      setUserState(null);
      queryClient.clear();
    }
  }, [pendingLogout, location.pathname, queryClient]);

  const login = (auth: AuthResponse) => {
    setSession(auth.token, auth.refreshToken);
    const newUser = { userId: auth.userId, email: auth.email, name: auth.name, role: auth.role };
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
    // Flag BEFORE anything clears the session: Private shows "Loading"
    // (never <Navigate to="/login">) until the home route commits.
    setPendingLogout(true);
    // The router pushes "/" synchronously; the pendingLogout effect below
    // clears session state only once the location actually reads "/".
    navigate("/");
    clearSession();
    clearUser();
  };

  return (
    <AuthContext.Provider
      // Bearer: token presence (sessionStorage). Cookie: user presence —
      // token state stays null there, /me hydration (or login) sets user.
      value={{ user, token, status, isAuthenticated: isCookieAuth() ? !!user : !!token, pendingLogout, login, logout }}
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

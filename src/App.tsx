import { Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LinksPage from "@/pages/LinksPage";
import LinkDetailPage from "@/pages/LinkDetailPage";

function Private({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Nav() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav className="mb-8 flex flex-wrap gap-4 text-sm">
      <Link to="/">In\u00edcio</Link>
      {isAuthenticated ? (
        <>
          <Link to="/links">Links</Link>
          <span className="text-muted-foreground ml-auto">Ol\u00e1, {user?.name}</span>
          <button type="button" onClick={logout} className="underline hover:text-primary">
            Sair
          </button>
        </>
      ) : (
        <>
          <Link to="/login">Entrar</Link>
          <Link to="/register">Registrar</Link>
        </>
      )}
    </nav>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/links"
        element={
          <Private>
            <LinksPage />
          </Private>
        }
      />
      <Route
        path="/links/:id"
        element={
          <Private>
            <LinkDetailPage />
          </Private>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <div className="mx-auto min-h-svh w-full max-w-2xl px-4 py-8">
        <Nav />
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </div>
    </AuthProvider>
  );
}

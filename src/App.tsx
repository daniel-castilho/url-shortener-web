import { Link, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LinksPage from "@/pages/LinksPage";
import LinkDetailPage from "@/pages/LinkDetailPage";

export function Private({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, status } = useAuth();
  if (status === "loading") return <p>Carregando</p>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function Nav() {
  const { user, isAuthenticated, logout } = useAuth();
  return (
    <nav className="flex flex-wrap items-center gap-4 text-sm">
      <Link to="/" className="font-semibold">
        Início
      </Link>
      {isAuthenticated ? (
        <>
          <Link to="/links" className="underline-offset-4 hover:underline">
            Links
          </Link>
          <span className="ml-auto text-muted-foreground">Olá, {user?.name}</span>
          <button
            type="button"
            onClick={logout}
            className="underline-offset-4 hover:text-primary hover:underline"
          >
            Sair
          </button>
        </>
      ) : (
        <>
          <Link to="/login" className="ml-auto underline-offset-4 hover:underline">
            Entrar
          </Link>
          <Link to="/register" className="underline-offset-4 hover:underline">
            Registrar
          </Link>
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
        <header className="mb-8 space-y-4">
          <Link to="/" className="text-2xl font-semibold tracking-tight">
            Tyny URL
          </Link>
          <Nav />
        </header>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </div>
    </AuthProvider>
  );
}

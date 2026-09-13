import { Link, Navigate, Route, Routes } from "react-router-dom";
import { getToken, clearSession } from "@/lib/auth";
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import LinksPage from "@/pages/LinksPage";
import LinkDetailPage from "@/pages/LinkDetailPage";

function Private({ children }: { children: React.ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const logged = Boolean(getToken());
  return (
    <div className="mx-auto min-h-svh w-full max-w-2xl px-4 py-8">
      <nav className="mb-8 flex flex-wrap gap-4 text-sm">
        <Link to="/">Inicio</Link>
        {logged ? (
          <>
            <Link to="/links">Links</Link>
            <button type="button" onClick={() => { clearSession(); location.href = "/"; }}>Sair</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register">Registrar</Link>
          </>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/links" element={<Private><LinksPage /></Private>} />
        <Route path="/links/:id" element={<Private><LinkDetailPage /></Private>} />
      </Routes>
    </div>
  );
}

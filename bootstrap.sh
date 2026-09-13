#!/usr/bin/env bash
set -euo pipefail

if [[ -f package.json ]]; then
  echo "Já existe package.json aqui. Use uma pasta vazia."
  exit 1
fi

mkdir -p public src/components/ui src/lib src/pages

cat > .gitignore << 'EOF'
node_modules
dist
dist-ssr
*.local
.env
.DS_Store
EOF

cat > .env.example << 'EOF'
VITE_API_BASE_URL=
EOF

cat > README.md << 'EOF'
# url-shortener-web

npm install
cp .env.example .env
npm run dev
EOF

cat > package.json << 'EOF'
{
  "name": "url-shortener-web",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.3",
    "@tanstack/react-query": "^5.90.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.544.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.1",
    "tailwind-merge": "^3.3.1"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.13",
    "@types/node": "^24.5.2",
    "@types/react": "^19.1.13",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.3",
    "tailwindcss": "^4.1.13",
    "typescript": "^5.9.2",
    "vite": "^7.1.6"
  }
}
EOF

cat > tsconfig.json << 'EOF'
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
EOF

cat > tsconfig.app.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"]
}
EOF

cat > tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
EOF

cat > vite.config.ts << 'EOF'
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:8080", changeOrigin: true },
      "/actuator": { target: "http://localhost:8080", changeOrigin: true }
    }
  }
});
EOF

cat > components.json << 'EOF'
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
EOF

cat > index.html << 'EOF'
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>URL Shortener</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

touch public/.gitkeep

cat > src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
EOF

cat > src/index.css << 'EOF'
@import "tailwindcss";
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --destructive: oklch(0.577 0.245 27.325);
}
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-destructive: var(--destructive);
}
body { @apply bg-background text-foreground antialiased; }
EOF

cat > src/lib/utils.ts << 'EOF'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

cat > src/lib/auth.ts << 'EOF'
const TOKEN = "us.token";
const REFRESH = "us.refreshToken";
export function getToken() { return sessionStorage.getItem(TOKEN); }
export function getRefreshToken() { return sessionStorage.getItem(REFRESH); }
export function setSession(token: string, refreshToken: string) {
  sessionStorage.setItem(TOKEN, token);
  sessionStorage.setItem(REFRESH, refreshToken);
}
export function clearSession() {
  sessionStorage.removeItem(TOKEN);
  sessionStorage.removeItem(REFRESH);
}
EOF

cat > src/lib/api.ts << 'EOF'
import { clearSession, getRefreshToken, getToken, setSession } from "./auth";

const base = import.meta.env.VITE_API_BASE_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (res.status === 401 && retry && getRefreshToken()) {
    const ok = await refreshTokens();
    if (ok) return request<T>(path, init, false);
    clearSession();
  }
  if (!res.ok) throw new ApiError(res.status, await res.text());
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${base}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) return false;
  const data = (await res.json()) as AuthResponse;
  setSession(data.token, data.refreshToken);
  return true;
}

export type AuthResponse = {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
};

export type ShortenRequest = {
  originalUrl: string;
  customAlias?: string | null;
  ttlSeconds?: number | null;
  domain?: string | null;
};

export type ShortenResponse = { id: string; shortUrl: string };

export type UtmParams = {
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  term?: string | null;
  content?: string | null;
};

export type ShortUrlResponse = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  createdAt: string;
  userId: string | null;
  isCustomAlias: boolean;
  clickCount: number;
  expiresAt: string | null;
  title: string | null;
  tags: string[] | null;
  utm: UtmParams | null;
  deletedAt: string | null;
  domain: string | null;
};

export type LinkListResponse = {
  items: ShortUrlResponse[];
  nextCursor: string | null;
  hasMore: boolean;
};

export type UpdateLinkRequest = {
  originalUrl?: string | null;
  title?: string | null;
  tags?: string[] | null;
  utm?: UtmParams | null;
  expiresAt?: string | null;
  domain?: string | null;
};

export const api = {
  register: (name: string, email: string, password: string) =>
    request<AuthResponse>("/api/v1/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  shorten: (body: ShortenRequest) =>
    request<ShortenResponse>("/api/v1/urls", { method: "POST", body: JSON.stringify(body) }),
  listUrls: (limit = 20, cursor?: string) => {
    const q = new URLSearchParams({ limit: String(limit) });
    if (cursor) q.set("cursor", cursor);
    return request<LinkListResponse>(`/api/v1/urls?${q}`);
  },
  getUrl: (id: string) => request<ShortUrlResponse>(`/api/v1/urls/${id}`),
  updateUrl: (id: string, body: UpdateLinkRequest) =>
    request<ShortUrlResponse>(`/api/v1/urls/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  archiveUrl: (id: string) => request<void>(`/api/v1/urls/${id}`, { method: "DELETE" })
};
EOF

cat > src/components/ui/button.tsx << 'EOF'
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground disabled:opacity-50",
  { variants: { variant: { default: "", outline: "bg-transparent border border-input text-foreground" } }, defaultVariants: { variant: "default" } }
);

export function Button({
  className, variant, asChild = false, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, className }))} {...props} />;
}
EOF

cat > src/pages/HomePage.tsx << 'EOF'
import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function HomePage() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const shorten = useMutation({ mutationFn: api.shorten });
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    shorten.mutate({ originalUrl, customAlias: customAlias || null });
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Encurtar URL</h1>
      <input className="w-full rounded-md border border-input px-3 py-2" required placeholder="https://" value={originalUrl} onChange={(e) => setOriginalUrl(e.target.value)} />
      <input className="w-full rounded-md border border-input px-3 py-2" placeholder="alias opcional" value={customAlias} onChange={(e) => setCustomAlias(e.target.value)} />
      <Button type="submit" disabled={shorten.isPending}>Encurtar</Button>
      {shorten.data && <p className="break-all text-sm">{shorten.data.shortUrl}</p>}
      {shorten.error && <p className="text-sm text-destructive">{String(shorten.error)}</p>}
    </form>
  );
}
EOF

cat > src/pages/LoginPage.tsx << 'EOF'
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const auth = await api.login(email, password);
      setSession(auth.token, auth.refreshToken);
      nav("/links");
    } catch (err) {
      setError(String(err));
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Entrar</h1>
      <input className="w-full rounded-md border border-input px-3 py-2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-md border border-input px-3 py-2" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Login</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
EOF

cat > src/pages/RegisterPage.tsx << 'EOF'
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { setSession } from "@/lib/auth";

export default function RegisterPage() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const auth = await api.register(name, email, password);
      setSession(auth.token, auth.refreshToken);
      nav("/links");
    } catch (err) {
      setError(String(err));
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <input className="w-full rounded-md border border-input px-3 py-2" required value={name} onChange={(e) => setName(e.target.value)} />
      <input className="w-full rounded-md border border-input px-3 py-2" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <input className="w-full rounded-md border border-input px-3 py-2" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button type="submit">Registrar</Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
EOF

cat > src/pages/LinksPage.tsx << 'EOF'
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function LinksPage() {
  const q = useQuery({ queryKey: ["urls"], queryFn: () => api.listUrls() });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error) return <p className="text-destructive">Faca login para listar os links.</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Meus links</h1>
      <ul className="space-y-2">
        {q.data.items.map((item) => (
          <li key={item.id}>
            <Link className="underline" to={`/links/${item.id}`}>{item.id}</Link>
            <span className="ml-2 text-sm text-muted-foreground">{item.originalUrl}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
EOF

cat > src/pages/LinkDetailPage.tsx << 'EOF'
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

export default function LinkDetailPage() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["url", id], queryFn: () => api.getUrl(id) });
  const archive = useMutation({
    mutationFn: () => api.archiveUrl(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["url", id] })
  });
  if (q.isPending) return <p>Carregando</p>;
  if (q.error || !q.data) return <p>Link nao encontrado.</p>;
  const link = q.data;
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{link.id}</h1>
      <p className="break-all">{link.originalUrl}</p>
      <p className="text-sm text-muted-foreground">cliques: {link.clickCount}</p>
      <Button type="button" variant="outline" onClick={() => archive.mutate()} disabled={!!link.deletedAt}>Arquivar</Button>
    </div>
  );
}
EOF

cat > src/App.tsx << 'EOF'
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
EOF

cat > src/main.tsx << 'EOF'
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
EOF

echo "OK"
echo "npm install && cp .env.example .env && npm run dev"


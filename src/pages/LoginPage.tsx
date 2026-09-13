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

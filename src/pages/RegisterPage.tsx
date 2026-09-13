import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { mapApiError } from "@/lib/errors";

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const auth = await api.register(name, email, password);
      login(auth);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(mapApiError(err.status));
      } else {
        setError(String(err));
      }
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
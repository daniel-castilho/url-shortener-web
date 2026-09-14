import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { api, ApiError } from "@/lib/api";
import { mapApiError } from "@/lib/errors";

function ApiErrorMessage({ error }: { error: unknown }) {
  if (error instanceof ApiError) {
    return (
      <>
        <p className="text-sm text-destructive">{mapApiError(error.status)}</p>
        {error.requestId && (
          <p className="text-xs text-muted-foreground">id: {error.requestId}</p>
        )}
      </>
    );
  }
  return <p className="text-sm text-destructive">{String(error)}</p>;
}

export default function RegisterPage() {
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const auth = await api.register(name, email, password);
      login(auth);
    } catch (err) {
      setError(err);
    }
  }
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h1 className="text-2xl font-semibold">Criar conta</h1>
      <input
        className="w-full rounded-md border border-input px-3 py-2"
        required
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="w-full rounded-md border border-input px-3 py-2"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="w-full rounded-md border border-input px-3 py-2"
        type="password"
        required
        minLength={6}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="submit">Registrar</Button>
      {error !== null && <ApiErrorMessage error={error} />}
    </form>
  );
}

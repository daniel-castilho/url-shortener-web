export function mapApiError(status: number, retryAfterSec?: number): string {
  switch (status) {
    case 400:
      return "Dados inv\u00e1lidos.";
    case 401:
      return "Sess\u00e3o expirada.";
    case 403:
      return "Voc\u00ea n\u00e3o \u00e9 o dono deste link.";
    case 404:
      return "Link nao encontrado.";
    case 409:
      return "Este alias j\u00e1 existe.";
    case 429:
      return typeof retryAfterSec === "number"
        ? `Muitas tentativas. Tente em ${retryAfterSec}s.`
        : "Muitas tentativas. Espere um pouco.";
    default:
      return "N\u00e3o foi poss\u00edvel completar a opera\u00e7\u00e3o.";
  }
}

export function parseRetryAfter(header: string | null): number | undefined {
  if (header === null || !/^\d+$/.test(header)) return undefined;
  const value = Number(header);
  return Number.isFinite(value) ? value : undefined;
}

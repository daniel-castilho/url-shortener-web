export function mapApiError(status: number): string {
  switch (status) {
    case 400:
      return "Dados inv\u00e1lidos.";
    case 401:
      return "Sess\u00e3o expirada.";
    case 403:
      return "Voc\u00ea n\u00e3o \u00e9 o dono deste link.";
    case 409:
      return "Este alias j\u00e1 existe.";
    case 429:
      return "Muitas tentativas. Espere um pouco.";
    default:
      return "N\u00e3o foi poss\u00edvel completar a opera\u00e7\u00e3o.";
  }
}

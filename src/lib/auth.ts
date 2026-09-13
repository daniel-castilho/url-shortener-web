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

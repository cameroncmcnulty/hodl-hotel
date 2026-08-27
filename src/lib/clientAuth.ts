const KEY = "hodl_session";

export function getClientToken() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY) || window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setClientToken(token: string | null | undefined) {
  if (typeof window === "undefined" || !token) return;
  try {
    window.localStorage.setItem(KEY, token);
    window.sessionStorage.setItem(KEY, token);
  } catch {
    /* */
  }
}

export function clearClientToken() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* */
  }
}

export function authInit(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers || {});
  const token = getClientToken();
  if (token) headers.set("x-hodl-session", token);
  if (init.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return { ...init, credentials: "include", headers };
}

export async function api(url: string, init: RequestInit = {}) {
  const res = await fetch(url, authInit(init));
  const j = await res.json().catch(() => ({}));
  if (j?.token) setClientToken(j.token);
  return { res, j };
}

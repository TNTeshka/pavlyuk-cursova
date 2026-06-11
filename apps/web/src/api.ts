const API_URL: string = import.meta.env.VITE_API_URL ?? "";

function joinUrl(base: string, path: string) {
  if (!base) return path;
  if (base.endsWith("/") && path.startsWith("/")) return `${base}${path.slice(1)}`;
  if (!base.endsWith("/") && !path.startsWith("/")) return `${base}/${path}`;
  return `${base}${path}`;
}

export function getToken() {
  return localStorage.getItem("token");
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem("token", token);
  else localStorage.removeItem("token");
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(joinUrl(API_URL, path), {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {})
    }
  });

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? "Не вдалося виконати запит");
  return data as T;
}

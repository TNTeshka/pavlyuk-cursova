import { api, setToken } from "./api";

export type User = { id: string; email: string; name?: string | null };

export async function login(login: string, password: string) {
  const { token, user } = await api<{ token: string; user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ login, password })
  });
  setToken(token);
  // Persist user for UI header
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export async function register(email: string, password: string, username?: string, name?: string) {
  const { token, user } = await api<{ token: string; user: User }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, username, name })
  });
  setToken(token);
  // Persist user for UI header
  localStorage.setItem('user', JSON.stringify(user));
  return user;
}

export function logout() {
  setToken(null);
  localStorage.removeItem('user');
}

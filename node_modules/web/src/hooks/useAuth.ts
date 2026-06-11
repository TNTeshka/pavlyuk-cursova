import { useCallback, useState } from "react";
import * as auth from "../auth";

function isEmailLike(v: string) {
  return v.includes("@") && v.includes(".");
}

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (login: string, password: string) => {
    setError(null);
    if (!login.trim()) return setError("Login is required");
    // Accept any non‑empty string (email or username)
    if (!password) return setError("Password is required");

    setLoading(true);
    try {
      await auth.login(login.trim(), password);
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string, name?: string) => {
    setError(null);
    const u = username?.trim() || undefined;
    const n = name?.trim() || undefined;
    if (!email.trim()) return setError("Email is required");
    if (!isEmailLike(email.trim())) return setError("Enter a valid email");
    if (!password) return setError("Password is required");
    if (password.length < 6) return setError("Password must be at least 6 characters");
    if (u !== undefined && u.length === 0) return setError("Username cannot be empty");
    if (n !== undefined && n.length === 0) return setError("Name cannot be empty");

    setLoading(true);
    try {
      await auth.register(email.trim(), password, u, n);
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Registration failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    auth.logout();
  }, []);

  return { loading, error, setError, login, register, logout };
}


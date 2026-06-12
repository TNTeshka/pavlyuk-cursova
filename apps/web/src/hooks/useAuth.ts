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
    if (!login.trim()) return setError("Введіть логін або email");
    if (!password) return setError("Введіть пароль");

    setLoading(true);
    try {
      await auth.login(login.trim(), password);
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося увійти");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string, name?: string) => {
    setError(null);
    const u = username?.trim() || undefined;
    const n = name?.trim() || undefined;
    if (!email.trim()) return setError("Введіть email");
    if (!isEmailLike(email.trim())) return setError("Введіть коректний email");
    if (!password) return setError("Введіть пароль");
    if (password.length < 6) return setError("Пароль має містити щонайменше 6 символів");
    if (u !== undefined && u.length === 0) return setError("Логін не може бути порожнім");
    if (n !== undefined && n.length === 0) return setError("Ім'я не може бути порожнім");

    setLoading(true);
    try {
      await auth.register(email.trim(), password, u, n);
      return true;
    } catch (e: any) {
      setError(e?.message ?? "Не вдалося зареєструватися");
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

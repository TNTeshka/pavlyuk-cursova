import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { Button } from "../components/Button";
import { ThemeContext } from "../theme/theme";

export function Login() {
  const nav = useNavigate();
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { toggleTheme } = useContext(ThemeContext);
  const { loading, error, setError, login } = useAuth();

  return (
      <div className="auth-page fade-enter">
        <div className="auth-card">
                    <h2 className="auth-title">Ласкаво просимо назад</h2>
            <p className="auth-subtitle">Увійдіть, щоб продовжити планувати свою роботу.</p>
        <form
          className="mt-6"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const ok = await login(loginInput, password);
            if (ok) nav("/tasks");
          }}
        >
          <div className="grid gap-4">
            <input
              placeholder="Електронна пошта або ім'я користувача"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              disabled={loading}
              className="form-input"
            />
          <div className="relative">
            <input
              placeholder="Пароль"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="form-input input-with-icon"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
                              className="password-toggle"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 4.5c-7 0-11 7.5-11 7.5s4 7.5 11 7.5 11-7.5 11-7.5-4-7.5-11-7.5zm0 13a5.5 5.5 0 110-11 5.5 5.5 0 010 11z" />
                  <path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-7.5-11-7.5a21.12 21.12 0 012.274-3.139m1.31-1.44A9.964 9.964 0 0112 5c7 0 11 7.5 11 7.5a21.12 21.12 0 01-2.274 3.139M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
            {error && (
              <div className="alert alert--error">
                {error}
              </div>
            )}
            <Button type="submit" className="header-text-color" disabled={loading}>
              {loading ? "Авторизація…" : "Увійти"}
            </Button>
                <Button variant="secondary" size="sm" onClick={toggleTheme}>Змінити тему</Button>
          </div>
        </form>
        <p>Немає облікового запису?{' '}          <Link to="/register">
            <Link to="/register">Реєстрація</Link>
          </Link>
        </p>
      </div>
    </div>
  );
}

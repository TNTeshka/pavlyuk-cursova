import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

import { Button } from "../components/Button";
import { ThemeContext } from "../theme/theme";

export function Register() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading, error, setError, register } = useAuth();
  const { toggleTheme } = useContext(ThemeContext);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Створити акаунт</h2>
        <p className="auth-subtitle">Налаштуйте робоче середовище за менше хвилини.</p>

        <form
          className="auth-form"
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            const ok = await register(email, password, username || undefined, name || undefined);
            if (ok) nav("/tasks");
          }}
        >
          <div className="form-grid">
            <input
              placeholder="Ім'я (необов'язково)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              className="form-input"
            />
            <input
              placeholder="Логін (необов'язково)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="form-input"
            />
            <input
              placeholder="Електронна пошта"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="form-input"
            />
            <input
              placeholder="Пароль (мін. 6)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className="form-input"
            />
            {error && <div className="alert alert--error">{error}</div>}
            <Button type="submit" variant="primary" size="sm" disabled={loading}>
              {loading ? "Створення…" : "Створити акаунт"}
            </Button>
          </div>
        </form>

        <div className="auth-footer">
          <Button type="button" variant="ghost" size="sm" onClick={toggleTheme}>
            Змінити тему
          </Button>
          <p className="auth-subtitle auth-footer__text">
            Вже маєте акаунт?{" "}
            <Link className="auth-link" to="/login">
              Увійти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

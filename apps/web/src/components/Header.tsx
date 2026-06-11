import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";
import { useContext } from "react";
import { ThemeContext } from "../theme/theme";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

export function Header() {
  const { logout } = useAuth();
  const { toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const routerLocation = useLocation();


  let userName = "";
  let userEmail = "";
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored) as { name?: string | null; email: string };
      userName = user.name ?? user.email;
      userEmail = user.email;
    }
  } catch {}

  const isAdmin = userEmail === "admin@example.com";

  const navItems = [
    { to: "/tasks", label: "Tasks" },
    { to: "/tasks#dashboard", label: "Dashboard" },
    { to: "/groups", label: "Groups" },
    ...(isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="text-xl font-semibold">Task Manager</div>
      </div>

      {/* Navigation moved from sidebar */}
      <nav className="header-nav">
        {navItems.map((item) =>
          false ? (
            <a
              key={item.to}
              href="#dashboard"
              className={`nav-link ${routerLocation.pathname + routerLocation.hash === item.to ? "active" : ""}`}
              onClick={(e) => {
                if (routerLocation.pathname !== "/tasks") {
                  navigate(item.to);
                } else {
                  e.preventDefault();
                  const el = document.getElementById("dashboard");
                  el?.scrollIntoView({ behavior: "smooth" });
                  window.history.pushState(null, "", "/tasks#dashboard");
                }
              }}
            >
              {item.label}
            </a>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={() => (routerLocation.pathname + routerLocation.hash === item.to ? "nav-link active" : "nav-link")}
            >
              {item.label}
            </NavLink>
          )
        )}
      </nav>

      <div className="header-right">
        <span className="user-name">{userName || "User"}</span>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
        >
          Logout
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            toggleTheme();
          }}
        >
          Toggle Theme
        </Button>
      </div>
    </header>
  );
}

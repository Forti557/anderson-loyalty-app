import { NavLink, useNavigate } from "react-router-dom";
import { setToken } from "../api.js";

const navItems = [
  { to: "/admin", label: "Дашборд", icon: "📊" },
  { to: "/admin/users", label: "Пользователи", icon: "👥" },
  { to: "/admin/events", label: "Мероприятия", icon: "📅" },
  { to: "/admin/transactions", label: "Транзакции", icon: "💳" },
  { to: "/admin/party-requests", label: "Праздники", icon: "🎉" },
  { to: "/admin/push", label: "Рассылки", icon: "🔔" },
];

const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
    background: "#f8f9fa",
    color: "#1a1a2e",
  } as React.CSSProperties,
  sidebar: {
    width: 240,
    background: "#1a1a2e",
    color: "#fff",
    padding: "24px 0",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    position: "sticky",
    top: 0,
    height: "100vh",
  } as React.CSSProperties,
  logo: {
    fontSize: 18,
    fontWeight: 700,
    padding: "0 24px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    marginBottom: 16,
  } as React.CSSProperties,
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "0 12px",
    flex: 1,
  } as React.CSSProperties,
  link: (isActive: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    textDecoration: "none",
    color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
    background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
    fontSize: 14,
    fontWeight: isActive ? 600 : 400,
    transition: "all 0.15s",
  }),
  main: {
    flex: 1,
    padding: "24px 32px",
    overflow: "auto",
  } as React.CSSProperties,
  logout: {
    margin: "0 12px",
    padding: "10px 12px",
    border: "none",
    borderRadius: 8,
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left" as const,
  },
};

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setToken(null);
    navigate("/admin/login");
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>Андерсон Admin</div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              style={({ isActive }) => styles.link(isActive)}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button style={styles.logout} onClick={handleLogout}>
          Выйти
        </button>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login, isAuthenticated } from "../api.js";

export function LoginPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated()) {
    navigate("/admin", { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/admin", { replace: true });
    } catch {
      setError("Неверный пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "40px 36px",
          width: 360,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#1a1a2e" }}>
            Андерсон Admin
          </h1>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
            Введите пароль для входа
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "10px 14px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoFocus
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            fontSize: 15,
            outline: "none",
            marginBottom: 16,
            boxSizing: "border-box",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "#1a1a2e")}
          onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
        />

        <button
          type="submit"
          disabled={loading || !password}
          style={{
            width: "100%",
            padding: "12px",
            border: "none",
            borderRadius: 10,
            background: loading ? "#94a3b8" : "#1a1a2e",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "default" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
}

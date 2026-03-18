import { useState, useEffect } from "react";
import { api } from "../api.js";

interface DashboardData {
  totalUsers: number;
  usersToday: number;
  usersThisWeek: number;
  totalBonuses: number;
  totalEvents: number;
  recentSignups: {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string;
    level: number;
    bonusBalance: number;
    createdAt: string;
  }[];
  levelDistribution: { level: number; name: string; count: number }[];
  signupsChart: { date: string; count: number }[];
}

const card = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
} as React.CSSProperties;

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<DashboardData>("/dashboard")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Загрузка...</div>;
  if (!data) return <div style={{ padding: 40, color: "#dc2626" }}>Ошибка загрузки данных</div>;

  const maxSignups = Math.max(...data.signupsChart.map((d) => d.count), 1);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Дашборд</h1>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard label="Пользователей" value={data.totalUsers} sub={`+${data.usersToday} сегодня`} color="#2563eb" />
        <StatCard label="За неделю" value={data.usersThisWeek} sub="новых" color="#16a34a" />
        <StatCard label="Бонусов в обороте" value={data.totalBonuses} sub="на счетах" color="#d97706" />
        <StatCard label="Мероприятий" value={data.totalEvents} sub="всего" color="#9333ea" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Signups chart */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Регистрации за 30 дней</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 120 }}>
            {data.signupsChart.map((d) => (
              <div
                key={d.date}
                title={`${d.date}: ${d.count}`}
                style={{
                  flex: 1,
                  background: d.count > 0 ? "#2563eb" : "#e2e8f0",
                  borderRadius: "3px 3px 0 0",
                  height: `${Math.max((d.count / maxSignups) * 100, 2)}%`,
                  minHeight: 2,
                  transition: "height 0.3s",
                  cursor: "default",
                }}
              />
            ))}
          </div>
        </div>

        {/* Level distribution */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>По уровням</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.levelDistribution.map((l) => (
              <div key={l.level} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: "#374151" }}>{l.name}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a2e" }}>{l.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent signups */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>Последние регистрации</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={th}>Имя</th>
              <th style={th}>Телефон</th>
              <th style={th}>Уровень</th>
              <th style={th}>Бонусы</th>
              <th style={th}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {data.recentSignups.map((u) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={td}>{u.firstName} {u.lastName ?? ""}</td>
                <td style={td}>{u.phone}</td>
                <td style={td}>{u.level}</td>
                <td style={td}>{u.bonusBalance}</td>
                <td style={{ ...td, color: "#666" }}>
                  {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 12px",
  fontWeight: 600,
  color: "#64748b",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
};

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, fontWeight: 500, color: "#64748b", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 4, letterSpacing: "-0.5px" }}>
        {value.toLocaleString("ru-RU")}
      </div>
      <div style={{ fontSize: 12, color: "#94a3b8" }}>{sub}</div>
    </div>
  );
}

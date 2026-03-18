import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

interface User {
  id: string;
  telegramId: number;
  firstName: string;
  lastName: string | null;
  phone: string;
  level: number;
  bonusBalance: number;
  totalSpent: number;
  createdAt: string;
  childrenCount: number;
  transactionsCount: number;
}

const LEVELS: Record<number, string> = {
  1: "Приятель",
  2: "Друг",
  3: "Любимый друг",
  4: "Почти родственник",
};

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 30;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (search) params.set("search", search);
    api(`/users?${params}`)
      .then((data: any) => {
        setUsers(data.users);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, offset]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Пользователи ({total})</h1>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Поиск по имени или телефону..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
          style={{
            width: 360,
            padding: "10px 14px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={th}>Имя</th>
              <th style={th}>Телефон</th>
              <th style={th}>Уровень</th>
              <th style={th}>Бонусы</th>
              <th style={th}>Потрачено</th>
              <th style={th}>Дети</th>
              <th style={th}>Дата рег.</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#666" }}>Загрузка...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#666" }}>Нет результатов</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}>
                  <td style={td}>
                    <Link to={`/admin/users/${u.id}`} style={{ color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                      {u.firstName} {u.lastName ?? ""}
                    </Link>
                  </td>
                  <td style={td}>{u.phone}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: u.level >= 3 ? "#fef3c7" : u.level >= 2 ? "#dcfce7" : "#f1f5f9",
                      color: u.level >= 3 ? "#92400e" : u.level >= 2 ? "#166534" : "#374151",
                    }}>
                      {LEVELS[u.level] ?? `Ур. ${u.level}`}
                    </span>
                  </td>
                  <td style={{ ...td, fontWeight: 600 }}>{u.bonusBalance}</td>
                  <td style={td}>{u.totalSpent.toLocaleString("ru-RU")} ₽</td>
                  <td style={td}>{u.childrenCount}</td>
                  <td style={{ ...td, color: "#666" }}>
                    {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            style={pgBtn}
          >
            Назад
          </button>
          <span style={{ fontSize: 14, color: "#666", lineHeight: "36px" }}>
            {offset + 1}–{Math.min(offset + limit, total)} из {total}
          </span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            style={pgBtn}
          >
            Далее
          </button>
        </div>
      )}
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 14px",
  fontWeight: 600,
  color: "#64748b",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
};

const pgBtn: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  background: "#fff",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
};

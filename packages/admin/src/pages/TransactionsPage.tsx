import { useState, useEffect } from "react";
import { api } from "../api.js";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  bonuses: number;
  description: string | null;
  restaurant: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string | null; phone: string };
}

const typeLabel: Record<string, string> = {
  ACCRUAL: "Кешбэк",
  WELCOME_BONUS: "Welcome",
  BIRTHDAY_BONUS: "ДР-бонус",
  REDEMPTION: "Списание",
  EXPIRED: "Сгорание",
};

const TYPES = ["", "ACCRUAL", "WELCOME_BONUS", "BIRTHDAY_BONUS", "REDEMPTION", "EXPIRED"];

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 30;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (typeFilter) params.set("type", typeFilter);
    api(`/transactions?${params}`)
      .then((data: any) => {
        setTransactions(data.transactions);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [typeFilter, offset]);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Транзакции ({total})</h1>

      <div style={{ marginBottom: 16, display: "flex", gap: 12 }}>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setOffset(0); }}
          style={{
            padding: "8px 12px",
            border: "1px solid #e2e8f0",
            borderRadius: 8,
            fontSize: 14,
            outline: "none",
            background: "#fff",
          }}
        >
          <option value="">Все типы</option>
          {TYPES.filter(Boolean).map((t) => (
            <option key={t} value={t}>{typeLabel[t] ?? t}</option>
          ))}
        </select>
      </div>

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
              <th style={th}>Пользователь</th>
              <th style={th}>Телефон</th>
              <th style={th}>Тип</th>
              <th style={th}>Описание</th>
              <th style={th}>Ресторан</th>
              <th style={th}>Сумма</th>
              <th style={th}>Бонусы</th>
              <th style={th}>Дата</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: "#666" }}>Загрузка...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={8} style={{ ...td, textAlign: "center", color: "#666" }}>Нет транзакций</td></tr>
            ) : (
              transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ ...td, fontWeight: 500 }}>
                    {t.user.firstName} {t.user.lastName ?? ""}
                  </td>
                  <td style={td}>{t.user.phone}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: t.bonuses >= 0 ? "#dcfce7" : "#fef2f2",
                      color: t.bonuses >= 0 ? "#166534" : "#dc2626",
                    }}>
                      {typeLabel[t.type] ?? t.type}
                    </span>
                  </td>
                  <td style={td}>{t.description ?? "—"}</td>
                  <td style={td}>{t.restaurant ?? "—"}</td>
                  <td style={td}>{t.amount > 0 ? `${t.amount.toLocaleString("ru-RU")} ₽` : "—"}</td>
                  <td style={{ ...td, fontWeight: 600, color: t.bonuses >= 0 ? "#166534" : "#dc2626" }}>
                    {t.bonuses >= 0 ? `+${t.bonuses}` : t.bonuses}
                  </td>
                  <td style={{ ...td, color: "#666" }}>
                    {new Date(t.createdAt).toLocaleString("ru-RU")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
  padding: "10px 14px",
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

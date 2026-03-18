import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";

interface UserDetail {
  id: string;
  telegramId: number;
  telegramUsername: string | null;
  firstName: string;
  lastName: string | null;
  phone: string;
  email: string | null;
  birthday: string | null;
  level: number;
  levelName: string;
  cashbackPercent: number;
  bonusBalance: number;
  totalSpent: number;
  homeRestaurant: string | null;
  createdAt: string;
  children: { id: string; name: string; birthDate: string }[];
  transactions: {
    id: string;
    type: string;
    amount: number;
    bonuses: number;
    description: string | null;
    restaurant: string | null;
    createdAt: string;
  }[];
  stampCards: {
    id: string;
    stampsCount: number;
    completed: boolean;
    createdAt: string;
  }[];
}

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: "20px 24px",
  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  marginBottom: 16,
};

const typeLabel: Record<string, string> = {
  ACCRUAL: "Кешбэк",
  WELCOME_BONUS: "Welcome-бонус",
  BIRTHDAY_BONUS: "ДР-бонус",
  REDEMPTION: "Списание",
  EXPIRED: "Сгорание",
};

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<UserDetail>(`/users/${id}`)
      .then(setUser)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40, color: "#666" }}>Загрузка...</div>;
  if (!user) return <div style={{ padding: 40, color: "#dc2626" }}>Пользователь не найден</div>;

  return (
    <div>
      <Link to="/admin/users" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", marginBottom: 16, display: "inline-block" }}>
        ← Назад к списку
      </Link>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>
        {user.firstName} {user.lastName ?? ""}
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Profile info */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Профиль</h3>
          <InfoRow label="Telegram ID" value={String(user.telegramId)} />
          {user.telegramUsername && <InfoRow label="Username" value={`@${user.telegramUsername}`} />}
          <InfoRow label="Телефон" value={user.phone} />
          {user.email && <InfoRow label="Email" value={user.email} />}
          {user.birthday && <InfoRow label="День рождения" value={new Date(user.birthday).toLocaleDateString("ru-RU")} />}
          {user.homeRestaurant && <InfoRow label="Домашний ресторан" value={user.homeRestaurant} />}
          <InfoRow label="Дата регистрации" value={new Date(user.createdAt).toLocaleString("ru-RU")} />
        </div>

        {/* Loyalty info */}
        <div style={card}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Лояльность</h3>
          <InfoRow label="Уровень" value={`${user.levelName} (${user.cashbackPercent}%)`} />
          <InfoRow label="Бонусов" value={String(user.bonusBalance)} />
          <InfoRow label="Потрачено" value={`${user.totalSpent.toLocaleString("ru-RU")} ₽`} />

          {user.stampCards.length > 0 && (
            <>
              <div style={{ borderTop: "1px solid #f1f5f9", margin: "12px 0" }} />
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>Штамп-карты</h4>
              {user.stampCards.map((sc) => (
                <div key={sc.id} style={{ fontSize: 13, marginBottom: 4 }}>
                  {sc.stampsCount}/10 штампов {sc.completed ? "✅" : ""} — {new Date(sc.createdAt).toLocaleDateString("ru-RU")}
                </div>
              ))}
            </>
          )}

          {user.children.length > 0 && (
            <>
              <div style={{ borderTop: "1px solid #f1f5f9", margin: "12px 0" }} />
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: "#64748b" }}>Дети</h4>
              {user.children.map((c) => (
                <div key={c.id} style={{ fontSize: 13, marginBottom: 4 }}>
                  {c.name} — {new Date(c.birthDate).toLocaleDateString("ru-RU")}
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div style={card}>
        <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>Последние транзакции</h3>
        {user.transactions.length === 0 ? (
          <p style={{ color: "#666", fontSize: 14 }}>Нет транзакций</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                <th style={th}>Тип</th>
                <th style={th}>Описание</th>
                <th style={th}>Ресторан</th>
                <th style={th}>Сумма</th>
                <th style={th}>Бонусы</th>
                <th style={th}>Дата</th>
              </tr>
            </thead>
            <tbody>
              {user.transactions.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={td}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: t.bonuses > 0 ? "#dcfce7" : "#fef2f2",
                      color: t.bonuses > 0 ? "#166534" : "#dc2626",
                    }}>
                      {typeLabel[t.type] ?? t.type}
                    </span>
                  </td>
                  <td style={td}>{t.description ?? "—"}</td>
                  <td style={td}>{t.restaurant ?? "—"}</td>
                  <td style={td}>{t.amount > 0 ? `${t.amount.toLocaleString("ru-RU")} ₽` : "—"}</td>
                  <td style={{ ...td, fontWeight: 600, color: t.bonuses > 0 ? "#166534" : "#dc2626" }}>
                    {t.bonuses > 0 ? `+${t.bonuses}` : t.bonuses}
                  </td>
                  <td style={{ ...td, color: "#666" }}>
                    {new Date(t.createdAt).toLocaleString("ru-RU")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontWeight: 600,
  color: "#64748b",
  fontSize: 11,
  textTransform: "uppercase",
};

const td: React.CSSProperties = {
  padding: "8px 10px",
};

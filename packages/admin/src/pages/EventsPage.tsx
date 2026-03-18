import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";

interface Event {
  id: string;
  title: string;
  restaurant: string;
  date: string;
  duration: number;
  price: number;
  capacity: number;
  bookedCount: number;
  isActive: boolean;
}

export function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadEvents = () => {
    setLoading(true);
    api("/events")
      .then((data: any) => {
        setEvents(data.events);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadEvents, []);

  const handleDeactivate = async (id: string) => {
    if (!confirm("Деактивировать мероприятие?")) return;
    await api(`/events/${id}`, { method: "DELETE" });
    loadEvents();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Мероприятия ({total})</h1>
        <Link
          to="/admin/events/new"
          style={{
            padding: "10px 20px",
            background: "#1a1a2e",
            color: "#fff",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          + Создать
        </Link>
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
              <th style={th}>Название</th>
              <th style={th}>Ресторан</th>
              <th style={th}>Дата</th>
              <th style={th}>Цена</th>
              <th style={th}>Места</th>
              <th style={th}>Статус</th>
              <th style={th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#666" }}>Загрузка...</td></tr>
            ) : events.length === 0 ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#666" }}>Нет мероприятий</td></tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ ...td, fontWeight: 500 }}>{e.title}</td>
                  <td style={td}>{e.restaurant}</td>
                  <td style={td}>{new Date(e.date).toLocaleDateString("ru-RU")}</td>
                  <td style={td}>{e.price.toLocaleString("ru-RU")} ₽</td>
                  <td style={td}>
                    <span style={{
                      fontWeight: 600,
                      color: e.capacity - e.bookedCount <= 3 ? "#dc2626" : "#166534",
                    }}>
                      {e.bookedCount}/{e.capacity}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "3px 8px",
                      borderRadius: 6,
                      background: e.isActive ? "#dcfce7" : "#f1f5f9",
                      color: e.isActive ? "#166534" : "#94a3b8",
                    }}>
                      {e.isActive ? "Активно" : "Неактивно"}
                    </span>
                  </td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Link
                        to={`/admin/events/${e.id}/edit`}
                        style={{
                          fontSize: 12,
                          color: "#2563eb",
                          textDecoration: "none",
                          padding: "4px 8px",
                          borderRadius: 4,
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        Изменить
                      </Link>
                      {e.isActive && (
                        <button
                          onClick={() => handleDeactivate(e.id)}
                          style={{
                            fontSize: 12,
                            color: "#dc2626",
                            background: "none",
                            border: "1px solid #fecaca",
                            borderRadius: 4,
                            padding: "4px 8px",
                            cursor: "pointer",
                          }}
                        >
                          Откл.
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
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

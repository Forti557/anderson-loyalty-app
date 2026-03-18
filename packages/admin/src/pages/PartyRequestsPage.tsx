import { useState, useEffect } from "react";
import { api } from "../api.js";

interface PartyRequest {
  id: string;
  name: string;
  phone: string;
  childName: string | null;
  childAge: number | null;
  date: string | null;
  guestsCount: number | null;
  program: string | null;
  wishes: string | null;
  restaurant: string | null;
  status: string;
  total: number | null;
  createdAt: string;
  user: { firstName: string; lastName: string | null; phone: string | null } | null;
}

const STATUS_LABELS: Record<string, { label: string; bg: string; color: string }> = {
  NEW: { label: "Новая", bg: "#dbeafe", color: "#1d4ed8" },
  IN_PROGRESS: { label: "В работе", bg: "#fef3c7", color: "#92400e" },
  DONE: { label: "Готово", bg: "#dcfce7", color: "#166534" },
  CANCELLED: { label: "Отменена", bg: "#f1f5f9", color: "#94a3b8" },
};

export function PartyRequestsPage() {
  const [requests, setRequests] = useState<PartyRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const loadRequests = () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    api(`/party-requests${params}`)
      .then((data: any) => {
        setRequests(data.requests);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(loadRequests, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await api(`/party-requests/${id}`, { method: "PUT", body: { status } });
    loadRequests();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Заявки на праздники ({total})</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "8px 14px", border: "1px solid #e2e8f0",
            borderRadius: 8, fontSize: 13, fontFamily: "'Inter', sans-serif",
          }}
        >
          <option value="">Все статусы</option>
          <option value="NEW">Новые</option>
          <option value="IN_PROGRESS">В работе</option>
          <option value="DONE">Готовые</option>
          <option value="CANCELLED">Отменённые</option>
        </select>
      </div>

      <div style={{
        background: "#fff", borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
              <th style={th}>Имя</th>
              <th style={th}>Телефон</th>
              <th style={th}>Программа</th>
              <th style={th}>Дата</th>
              <th style={th}>Сумма</th>
              <th style={th}>Статус</th>
              <th style={th}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#666" }}>Загрузка...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: "center", color: "#666" }}>Нет заявок</td></tr>
            ) : (
              requests.map((r) => {
                const st = STATUS_LABELS[r.status] || STATUS_LABELS.NEW;
                const isExpanded = expanded === r.id;
                return (
                  <>
                    <tr
                      key={r.id}
                      onClick={() => setExpanded(isExpanded ? null : r.id)}
                      style={{ borderBottom: "1px solid #f1f5f9", cursor: "pointer" }}
                    >
                      <td style={{ ...td, fontWeight: 500 }}>
                        {r.name}
                        {r.user && (
                          <span style={{ fontSize: 11, color: "#94a3b8", marginLeft: 6 }}>
                            (зарег.)
                          </span>
                        )}
                      </td>
                      <td style={td}>{r.phone}</td>
                      <td style={td}>{r.program || "—"}</td>
                      <td style={td}>
                        {r.date ? new Date(r.date).toLocaleDateString("ru-RU") : "—"}
                      </td>
                      <td style={td}>
                        {r.total ? `${r.total.toLocaleString("ru-RU")} ₽` : "—"}
                      </td>
                      <td style={td}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 8px",
                          borderRadius: 6, background: st.bg, color: st.color,
                        }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {r.status === "NEW" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); updateStatus(r.id, "IN_PROGRESS"); }}
                              style={actionBtn("#2563eb", "#dbeafe")}
                            >
                              В работу
                            </button>
                          )}
                          {(r.status === "NEW" || r.status === "IN_PROGRESS") && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateStatus(r.id, "DONE"); }}
                                style={actionBtn("#166534", "#dcfce7")}
                              >
                                Готово
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); updateStatus(r.id, "CANCELLED"); }}
                                style={actionBtn("#dc2626", "#fef2f2")}
                              >
                                Отмена
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${r.id}-detail`} style={{ background: "#fafbfc" }}>
                        <td colSpan={7} style={{ padding: "12px 14px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 13 }}>
                            <div><b>Ребёнок:</b> {r.childName || "—"} {r.childAge ? `(${r.childAge} лет)` : ""}</div>
                            <div><b>Гостей:</b> {r.guestsCount || "—"}</div>
                            <div><b>Ресторан:</b> {r.restaurant || "—"}</div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <b>Пожелания:</b> {r.wishes || "—"}
                            </div>
                            <div style={{ color: "#94a3b8" }}>
                              Создано: {new Date(r.createdAt).toLocaleString("ru-RU")}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })
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

function actionBtn(color: string, bg: string): React.CSSProperties {
  return {
    fontSize: 11,
    color,
    background: bg,
    border: "none",
    borderRadius: 4,
    padding: "4px 8px",
    cursor: "pointer",
    fontWeight: 600,
  };
}

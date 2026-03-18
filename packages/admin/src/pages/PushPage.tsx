import { useState, useEffect } from "react";
import { apiFetch } from "../api.js";

interface PushNotification {
  id: string;
  title: string;
  body: string;
  status: string;
  sentAt: string | null;
  sentCount: number;
  createdAt: string;
}

interface PushTrigger {
  id: string;
  name: string;
  event: string;
  title: string;
  body: string;
  isActive: boolean;
}

const TRIGGER_EVENTS = [
  { value: "welcome", label: "Приветствие (новый пользователь)" },
  { value: "birthday", label: "День рождения пользователя" },
  { value: "stamp_completed", label: "Штамп-карта заполнена" },
  { value: "bonus_expiring", label: "Бонусы истекают" },
];

export function PushPage() {
  const [notifications, setNotifications] = useState<PushNotification[]>([]);
  const [triggers, setTriggers] = useState<PushTrigger[]>([]);
  const [activeTab, setActiveTab] = useState<"manual" | "triggers">("manual");
  const [loading, setLoading] = useState(true);

  // Manual push form
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sendNow, setSendNow] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  // Trigger form
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [triggerName, setTriggerName] = useState("");
  const [triggerEvent, setTriggerEvent] = useState("welcome");
  const [triggerTitle, setTriggerTitle] = useState("");
  const [triggerBody, setTriggerBody] = useState("");
  const [triggerSaving, setTriggerSaving] = useState(false);

  const load = async () => {
    try {
      const [notifData, triggerData] = await Promise.all([
        apiFetch("/push/notifications"),
        apiFetch("/push/triggers"),
      ]);
      setNotifications(notifData);
      setTriggers(triggerData);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSendManual = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendError("");
    setSendSuccess("");
    setSending(true);
    try {
      await apiFetch("/push/notifications", {
        method: "POST",
        body: JSON.stringify({ title, body, sendNow }),
      });
      setSendSuccess(sendNow ? "Уведомление отправлено!" : "Черновик сохранён");
      setTitle("");
      setBody("");
      await load();
    } catch (err: any) {
      setSendError(err.message || "Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  const handleSendDraft = async (id: string) => {
    try {
      await apiFetch(`/push/notifications/${id}/send`, { method: "POST" });
      await load();
    } catch {}
  };

  const handleSaveTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerSaving(true);
    try {
      await apiFetch("/push/triggers", {
        method: "POST",
        body: JSON.stringify({ name: triggerName, event: triggerEvent, title: triggerTitle, body: triggerBody }),
      });
      setShowTriggerForm(false);
      setTriggerName(""); setTriggerEvent("welcome"); setTriggerTitle(""); setTriggerBody("");
      await load();
    } catch {} finally {
      setTriggerSaving(false);
    }
  };

  const handleToggleTrigger = async (id: string, isActive: boolean) => {
    try {
      await apiFetch(`/push/triggers/${id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !isActive }),
      });
      await load();
    } catch {}
  };

  const handleDeleteTrigger = async (id: string) => {
    if (!confirm("Удалить триггер?")) return;
    try {
      await apiFetch(`/push/triggers/${id}`, { method: "DELETE" });
      await load();
    } catch {}
  };

  const s = styles;

  if (loading) return <div style={{ padding: 32, color: "#666" }}>Загрузка...</div>;

  return (
    <div>
      <h1 style={s.heading}>Рассылки (Push-уведомления)</h1>

      {/* Tabs */}
      <div style={s.tabs}>
        <button
          style={s.tab(activeTab === "manual")}
          onClick={() => setActiveTab("manual")}
        >
          Ручная рассылка
        </button>
        <button
          style={s.tab(activeTab === "triggers")}
          onClick={() => setActiveTab("triggers")}
        >
          Авто-триггеры ({triggers.length})
        </button>
      </div>

      {activeTab === "manual" && (
        <div>
          {/* Send form */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>Новое уведомление</h2>
            <form onSubmit={handleSendManual} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={s.label}>Заголовок *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={64}
                  placeholder="Например: Акция выходного дня"
                  style={s.input}
                />
              </div>
              <div>
                <label style={s.label}>Текст уведомления *</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  maxLength={178}
                  rows={3}
                  placeholder="Например: Двойные бонусы в эти выходные! Покажите QR-код."
                  style={{ ...s.input, resize: "vertical" }}
                />
                <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>{body.length}/178</div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={sendNow}
                  onChange={(e) => setSendNow(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14 }}>Отправить сейчас (иначе сохранить как черновик)</span>
              </label>
              {sendError && <div style={s.error}>{sendError}</div>}
              {sendSuccess && <div style={s.success}>{sendSuccess}</div>}
              <button type="submit" disabled={sending} style={s.btn}>
                {sending ? "Отправляем..." : sendNow ? "Отправить всем" : "Сохранить черновик"}
              </button>
            </form>
          </div>

          {/* History */}
          <div style={s.card}>
            <h2 style={s.cardTitle}>История рассылок</h2>
            {notifications.length === 0 ? (
              <div style={{ color: "#999", fontSize: 14 }}>Рассылок ещё не было</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Заголовок</th>
                    <th style={s.th}>Текст</th>
                    <th style={s.th}>Статус</th>
                    <th style={s.th}>Отправлено</th>
                    <th style={s.th}>Дата</th>
                    <th style={s.th}></th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={s.td}><strong>{n.title}</strong></td>
                      <td style={{ ...s.td, color: "#666", maxWidth: 200 }}>{n.body}</td>
                      <td style={s.td}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          background: n.status === "sent" ? "#e8f5e9" : "#fff3e0",
                          color: n.status === "sent" ? "#2e7d32" : "#e65100",
                        }}>
                          {n.status === "sent" ? "Отправлено" : "Черновик"}
                        </span>
                      </td>
                      <td style={s.td}>{n.sentCount > 0 ? `${n.sentCount} уст.` : "—"}</td>
                      <td style={s.td}>{new Date(n.createdAt).toLocaleDateString("ru")}</td>
                      <td style={s.td}>
                        {n.status === "draft" && (
                          <button onClick={() => handleSendDraft(n.id)} style={s.btnSm}>
                            Отправить
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === "triggers" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button onClick={() => setShowTriggerForm(!showTriggerForm)} style={s.btn}>
              {showTriggerForm ? "Отмена" : "+ Добавить триггер"}
            </button>
          </div>

          {showTriggerForm && (
            <div style={s.card}>
              <h2 style={s.cardTitle}>Новый триггер</h2>
              <form onSubmit={handleSaveTrigger} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={s.label}>Название триггера</label>
                  <input value={triggerName} onChange={(e) => setTriggerName(e.target.value)} required style={s.input} placeholder="Например: Приветствие новых" />
                </div>
                <div>
                  <label style={s.label}>Событие</label>
                  <select value={triggerEvent} onChange={(e) => setTriggerEvent(e.target.value)} style={s.input}>
                    {TRIGGER_EVENTS.map((ev) => (
                      <option key={ev.value} value={ev.value}>{ev.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Заголовок уведомления</label>
                  <input value={triggerTitle} onChange={(e) => setTriggerTitle(e.target.value)} required style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Текст уведомления</label>
                  <textarea value={triggerBody} onChange={(e) => setTriggerBody(e.target.value)} required rows={2} style={{ ...s.input, resize: "vertical" }} />
                </div>
                <button type="submit" disabled={triggerSaving} style={s.btn}>
                  {triggerSaving ? "Сохраняем..." : "Сохранить триггер"}
                </button>
              </form>
            </div>
          )}

          <div style={s.card}>
            <h2 style={s.cardTitle}>Активные триггеры</h2>
            {triggers.length === 0 ? (
              <div style={{ color: "#999", fontSize: 14 }}>Триггеров ещё нет</div>
            ) : (
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>Название</th>
                    <th style={s.th}>Событие</th>
                    <th style={s.th}>Текст</th>
                    <th style={s.th}>Статус</th>
                    <th style={s.th}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {triggers.map((t) => (
                    <tr key={t.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                      <td style={s.td}><strong>{t.name}</strong></td>
                      <td style={s.td}>{TRIGGER_EVENTS.find((ev) => ev.value === t.event)?.label || t.event}</td>
                      <td style={{ ...s.td, color: "#666" }}>
                        <div style={{ fontSize: 13 }}><strong>{t.title}</strong></div>
                        <div style={{ fontSize: 12 }}>{t.body}</div>
                      </td>
                      <td style={s.td}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: 12,
                          fontSize: 12,
                          fontWeight: 600,
                          background: t.isActive ? "#e8f5e9" : "#fafafa",
                          color: t.isActive ? "#2e7d32" : "#999",
                        }}>
                          {t.isActive ? "Активен" : "Выключен"}
                        </span>
                      </td>
                      <td style={s.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => handleToggleTrigger(t.id, t.isActive)} style={s.btnSm}>
                            {t.isActive ? "Выкл." : "Вкл."}
                          </button>
                          <button onClick={() => handleDeleteTrigger(t.id)} style={{ ...s.btnSm, background: "#fff0f0", color: "#c0392b" }}>
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  heading: { fontSize: 24, fontWeight: 700, marginBottom: 24, color: "#1a1a2e" } as React.CSSProperties,
  tabs: { display: "flex", gap: 8, marginBottom: 24, borderBottom: "2px solid #e9ecef", paddingBottom: 0 } as React.CSSProperties,
  tab: (active: boolean): React.CSSProperties => ({
    padding: "10px 20px",
    border: "none",
    background: "none",
    fontSize: 14,
    fontWeight: active ? 700 : 400,
    color: active ? "#c4633a" : "#666",
    borderBottom: active ? "2px solid #c4633a" : "2px solid transparent",
    cursor: "pointer",
    marginBottom: "-2px",
  }),
  card: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" } as React.CSSProperties,
  cardTitle: { fontSize: 16, fontWeight: 700, marginBottom: 16, color: "#1a1a2e" } as React.CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#666", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" } as React.CSSProperties,
  input: { width: "100%", padding: "10px 12px", border: "1px solid #dee2e6", borderRadius: 8, fontSize: 14, color: "#1a1a2e", outline: "none", boxSizing: "border-box" as const } as React.CSSProperties,
  btn: { padding: "12px 24px", border: "none", borderRadius: 8, background: "#c4633a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" } as React.CSSProperties,
  btnSm: { padding: "4px 12px", border: "none", borderRadius: 6, background: "#f0f0f0", color: "#333", fontSize: 12, cursor: "pointer" } as React.CSSProperties,
  error: { padding: "10px 14px", borderRadius: 8, background: "#fff0f0", color: "#c0392b", fontSize: 13 } as React.CSSProperties,
  success: { padding: "10px 14px", borderRadius: 8, background: "#e8f5e9", color: "#2e7d32", fontSize: 13 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 14 } as React.CSSProperties,
  th: { textAlign: "left" as const, padding: "8px 12px", fontSize: 12, color: "#666", fontWeight: 600, borderBottom: "2px solid #f0f0f0" } as React.CSSProperties,
  td: { padding: "10px 12px", verticalAlign: "top" as const } as React.CSSProperties,
};

import { useState, useEffect, FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api.js";

const RESTAURANTS = [
  "Андерсон на Тверской",
  "Андерсон в Красной Пресне",
  "Андерсон на Кутузовском",
  "Андерсон на Островитянова",
  "Андерсон в Бутово",
  "Андерсон на Проспекте Мира",
];

interface EventData {
  title: string;
  description: string;
  date: string;
  restaurant: string;
  duration: number | "";
  ageMin: number | "";
  ageMax: number | "";
  price: number | "";
  capacity: number | "";
  imageUrl: string;
}

const initial: EventData = {
  title: "",
  description: "",
  date: "",
  restaurant: RESTAURANTS[0],
  duration: 60,
  ageMin: "",
  ageMax: "",
  price: "",
  capacity: "",
  imageUrl: "",
};

export function EventFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<EventData>(initial);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      api(`/events`)
        .then((data: any) => {
          const event = data.events.find((e: any) => e.id === id);
          if (event) {
            setForm({
              title: event.title,
              description: event.description || "",
              date: event.date.slice(0, 16),
              restaurant: event.restaurant,
              duration: event.duration ?? 60,
              ageMin: event.ageMin ?? "",
              ageMax: event.ageMax ?? "",
              price: event.price,
              capacity: event.capacity,
              imageUrl: event.imageUrl || "",
            });
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const body = {
        title: form.title,
        description: form.description || undefined,
        date: new Date(form.date).toISOString(),
        restaurant: form.restaurant,
        duration: form.duration !== "" ? Number(form.duration) : 60,
        ageMin: form.ageMin !== "" ? Number(form.ageMin) : undefined,
        ageMax: form.ageMax !== "" ? Number(form.ageMax) : undefined,
        price: Number(form.price),
        capacity: Number(form.capacity),
        imageUrl: form.imageUrl || undefined,
      };

      if (isEdit) {
        await api(`/events/${id}`, { method: "PUT", body });
      } else {
        await api("/events", { method: "POST", body });
      }

      navigate("/admin/events");
    } catch (err: any) {
      setError(err.message || "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof EventData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [key]: e.target.value });

  if (loading) return <div style={{ padding: 40, color: "#666" }}>Загрузка...</div>;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>
        {isEdit ? "Редактировать мероприятие" : "Новое мероприятие"}
      </h1>

      {error && (
        <div style={{
          background: "#fef2f2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          padding: "10px 14px",
          borderRadius: 8,
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 24,
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          maxWidth: 600,
        }}
      >
        <Field label="Название *">
          <input required value={form.title} onChange={set("title")} style={input} />
        </Field>

        <Field label="Описание">
          <textarea value={form.description} onChange={set("description")} style={{ ...input, height: 80, resize: "vertical" }} />
        </Field>

        <Field label="Ресторан *">
          <select value={form.restaurant} onChange={set("restaurant")} style={input}>
            {RESTAURANTS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <Field label="Дата и время *">
            <input type="datetime-local" required value={form.date} onChange={set("date")} style={input} />
          </Field>
          <Field label="Длительность (мин)">
            <input type="number" min={1} value={form.duration} onChange={set("duration")} style={input} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
          <Field label="Возраст от">
            <input type="number" min={0} value={form.ageMin} onChange={set("ageMin")} style={input} />
          </Field>
          <Field label="Возраст до">
            <input type="number" min={0} value={form.ageMax} onChange={set("ageMax")} style={input} />
          </Field>
          <Field label="Цена (₽) *">
            <input type="number" required min={0} value={form.price} onChange={set("price")} style={input} />
          </Field>
          <Field label="Мест *">
            <input type="number" required min={1} value={form.capacity} onChange={set("capacity")} style={input} />
          </Field>
        </div>

        <Field label="Ссылка на изображение">
          <input type="url" value={form.imageUrl} onChange={set("imageUrl")} placeholder="https://..." style={input} />
        </Field>

        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "10px 24px",
              background: saving ? "#94a3b8" : "#1a1a2e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "Сохранение..." : isEdit ? "Сохранить" : "Создать"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/events")}
            style={{
              padding: "10px 24px",
              background: "#fff",
              color: "#374151",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "'Inter', sans-serif",
};

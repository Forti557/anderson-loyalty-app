import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext.js";
import { LocationMap, type MapMarker } from "../components/LocationMap.js";
import { motion, AnimatePresence } from "framer-motion";

const restaurantCoords: Record<string, { lat: number; lng: number; address: string }> = {
  "Гиляровского": { lat: 55.7813, lng: 37.6336, address: "ул. Гиляровского, д. 39" },
  "На Льва Толстого": { lat: 55.7351, lng: 37.5878, address: "ул. Льва Толстого, д. 23" },
  "Фили": { lat: 55.7473, lng: 37.4871, address: "пр-д Береговой, д. 5А" },
  "Шуваловский": { lat: 55.7016, lng: 37.5064, address: "Мичуринский проспект, д. 7/1" },
  "Воронцовский парк": { lat: 55.6812, lng: 37.5709, address: "ул. Академика Пилюгина, д. 18" },
  "Бутово": { lat: 55.5434, lng: 37.5341, address: "Южнобутовская ул." },
  "Сокол": { lat: 55.8054, lng: 37.5149, address: "Москва, р-н Сокол" },
  "В Крылатском": { lat: 55.7567, lng: 37.4089, address: "Москва, Крылатское" },
  "Кропоткинская": { lat: 55.7449, lng: 37.6033, address: "Москва, р-н Хамовники" },
  "Жулебино": { lat: 55.6858, lng: 37.8561, address: "Москва, Жулебино" },
  "Медведково": { lat: 55.8872, lng: 37.6594, address: "Москва, Медведково" },
  "Форт Ясенево": { lat: 55.6063, lng: 37.5329, address: "Москва, Ясенево" },
  "В парке Царицыно": { lat: 55.6161, lng: 37.6687, address: "Москва, Царицыно" },
  "Таганская": { lat: 55.7408, lng: 37.6534, address: "Москва, Таганская ул." },
  "Обручева": { lat: 55.6594, lng: 37.5447, address: "Москва, ул. Обручева" },
  "Кусковская": { lat: 55.7361, lng: 37.8053, address: "Москва, Кусковская ул." },
  "Остров": { lat: 55.7680, lng: 37.6165, address: "Москва" },
  "Маршала Бирюзова": { lat: 55.7933, lng: 37.4988, address: "Москва, ул. Маршала Бирюзова" },
  "Донской Олимп": { lat: 55.7136, lng: 37.6006, address: "Москва" },
  "Ладья": { lat: 55.9887, lng: 37.1741, address: "г. Зеленоград, Площадь Юности, д. 2" },
  "Тюмень Осипенко": { lat: 57.1553, lng: 65.5610, address: "г. Тюмень, ул. Осипенко, д. 73" },
  "Тюмень Ямская": { lat: 57.1496, lng: 65.5340, address: "г. Тюмень, ул. Ямская, д. 122" },
  "Ярославль": { lat: 57.6261, lng: 39.8845, address: "г. Ярославль, ул. Республиканская, д. 68" },
  "Архангельск": { lat: 64.5401, lng: 40.5433, address: "г. Архангельск, ул. Воскресенская, д. 20" },
};

/* ── animation variants ── */
const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/* ── shared styles ── */
const cardStyle: React.CSSProperties = {
  background: "var(--color-card, #ffffff)",
  borderRadius: "var(--radius-2xl, 24px)",
  padding: "24px",
  boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))",
};

const inputStyle: React.CSSProperties = {
  padding: "14px 16px",
  borderRadius: "var(--radius-xl, 20px)",
  border: "2px solid transparent",
  background: "var(--color-bg, #faf6f1)",
  fontSize: "15px",
  fontFamily: "var(--font-body, Inter, sans-serif)",
  width: "100%",
  outline: "none",
  transition: "border-color 0.25s ease, box-shadow 0.25s ease",
  color: "#333",
};

const inputFocusStyle = `
  .profile-input:focus {
    border-color: var(--color-primary, #c4633a);
    box-shadow: 0 0 0 4px rgba(196, 99, 58, 0.15);
  }
  .profile-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 40px;
  }
  .profile-select:focus {
    border-color: var(--color-primary, #c4633a);
    box-shadow: 0 0 0 4px rgba(196, 99, 58, 0.15);
  }
  .info-row {
    transition: background-color 0.2s ease;
    border-radius: 12px;
    padding: 10px 12px;
    margin: 0 -12px;
  }
  .info-row:hover {
    background-color: rgba(196, 99, 58, 0.04);
  }
`;

interface Profile {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  level: number;
  levelName: string;
  cashbackPercent: number;
  bonusBalance: number;
  homeRestaurant: string | null;
  children: { id: string; name: string; birthDate: string }[];
}

/* ── icons (inline SVG) ── */
function PhoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #c4633a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #c4633a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/>
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #c4633a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #c4633a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  );
}

function ChildIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary, #c4633a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 00-16 0"/>
    </svg>
  );
}

/* ── main component ── */
export function ProfilePage() {
  const { apiFetch, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "", birthday: "", homeRestaurant: "",
  });
  const [newChild, setNewChild] = useState({ name: "", birthDate: "" });
  const [saving, setSaving] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [mapSelectedKey, setMapSelectedKey] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      const data = await apiFetch("/users/profile");
      setProfile(data);
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        phone: data.phone || "",
        email: data.email || "",
        birthday: data.birthday ? data.birthday.slice(0, 10) : "",
        homeRestaurant: data.homeRestaurant || "",
      });
    } catch {}
  };

  useEffect(() => { loadProfile(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiFetch("/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          ...form,
          birthday: form.birthday || undefined,
          homeRestaurant: form.homeRestaurant || undefined,
        }),
      });
      setEditing(false);
      await loadProfile();
    } catch {}
    setSaving(false);
  };

  const addChild = async () => {
    if (!newChild.name || !newChild.birthDate) return;
    try {
      await apiFetch("/users/children", { method: "POST", body: JSON.stringify(newChild) });
      setNewChild({ name: "", birthDate: "" });
      await loadProfile();
    } catch {}
  };

  const removeChild = async (childId: string) => {
    try {
      await apiFetch(`/users/children/${childId}`, { method: "DELETE" });
      await loadProfile();
    } catch {}
  };

  if (!profile) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "var(--color-text-secondary)" }}>
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ fontSize: "16px", fontFamily: "var(--font-body, Inter, sans-serif)" }}
        >
          Загружаем профиль...
        </motion.div>
      </div>
    );
  }

  const initial = (profile.firstName || "A").charAt(0).toUpperCase();

  return (
    <>
      <style>{inputFocusStyle}</style>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        style={{
          padding: "16px",
          paddingBottom: "32px",
          fontFamily: "var(--font-body, Inter, sans-serif)",
        }}
      >
        {/* ── Hero / Avatar ── */}
        <motion.div variants={fadeUp} style={{ textAlign: "center", marginBottom: "24px" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary, #c4633a), #e8955e)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow: "0 8px 24px rgba(196, 99, 58, 0.3)",
            }}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "36px",
                fontWeight: 700,
                fontFamily: "var(--font-display, Nunito, sans-serif)",
                lineHeight: 1,
              }}
            >
              {initial}
            </span>
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display, Nunito, sans-serif)",
              fontSize: "22px",
              fontWeight: 700,
              margin: "0 0 8px",
              color: "#1a1a1a",
            }}
          >
            {profile.firstName}{profile.lastName ? ` ${profile.lastName}` : ""}
          </h2>
          <span
            style={{
              display: "inline-block",
              padding: "5px 16px",
              borderRadius: "100px",
              background: "linear-gradient(135deg, var(--color-accent-green, #3d7a5f), #4e9a72)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.3px",
            }}
          >
            {profile.levelName || `Уровень ${profile.level}`}
          </span>
        </motion.div>

        {/* ── Profile Card ── */}
        <motion.div variants={fadeUp} style={{ ...cardStyle, marginBottom: "16px" }}>
          {editing ? (
            /* ── Edit Form ── */
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontFamily: "var(--font-display, Nunito, sans-serif)", fontWeight: 700, fontSize: "17px", marginBottom: "4px" }}>
                Редактирование
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Имя</label>
                <input className="profile-input" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="Имя" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Телефон</label>
                <input className="profile-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Телефон" inputMode="tel" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Email</label>
                <input className="profile-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Дата рождения</label>
                <input className="profile-input" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} type="date" style={inputStyle} />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" as const, letterSpacing: "0.5px", display: "block", marginBottom: "6px" }}>Домашний ресторан</label>
                <button
                  type="button"
                  onClick={() => { setMapSelectedKey(form.homeRestaurant || null); setShowMapPicker(true); }}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    textAlign: "left" as const,
                    color: form.homeRestaurant ? "#333" : "var(--color-text-tertiary, #aaa)",
                    border: "2px solid transparent",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: 0 }}>
                    <MapPinIcon />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {form.homeRestaurant ? `Андерсон ${form.homeRestaurant}` : "Выбрать на карте..."}
                    </span>
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: saving ? "#ccc" : "linear-gradient(135deg, var(--color-primary, #c4633a), #d4764d)",
                    color: "white",
                    border: "none",
                    borderRadius: "var(--radius-xl, 20px)",
                    fontWeight: 700,
                    fontSize: "15px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontFamily: "var(--font-body, Inter, sans-serif)",
                    boxShadow: saving ? "none" : "0 4px 16px rgba(196, 99, 58, 0.3)",
                    transition: "all 0.25s ease",
                  }}
                >
                  {saving ? "Сохраняем..." : "Сохранить"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  style={{
                    flex: 1,
                    padding: "14px",
                    background: "none",
                    border: "2px solid var(--color-border, #e5e5e5)",
                    borderRadius: "var(--radius-xl, 20px)",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "15px",
                    color: "var(--color-text-secondary, #888)",
                    fontFamily: "var(--font-body, Inter, sans-serif)",
                    transition: "all 0.25s ease",
                  }}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            /* ── View Mode ── */
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <InfoRow icon={<PhoneIcon />} label="Телефон" value={profile.phone} />
                <InfoRow icon={<MailIcon />} label="Email" value={profile.email} />
                <InfoRow icon={<CalendarIcon />} label="Дата рождения" value={profile.birthday ? new Date(profile.birthday).toLocaleDateString("ru-RU") : null} />
              </div>

              <button
                onClick={() => setEditing(true)}
                style={{
                  marginTop: "16px",
                  width: "100%",
                  padding: "14px",
                  background: "linear-gradient(135deg, var(--color-primary, #c4633a), #d4764d)",
                  color: "white",
                  border: "none",
                  borderRadius: "var(--radius-xl, 20px)",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "15px",
                  fontFamily: "var(--font-body, Inter, sans-serif)",
                  boxShadow: "0 4px 16px rgba(196, 99, 58, 0.3)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                Редактировать
              </button>
            </>
          )}
        </motion.div>

        {/* ── Home Restaurant ── */}
        {!editing && (
          <motion.div variants={fadeUp} style={{ marginBottom: "16px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "10px",
                paddingLeft: "4px",
                paddingRight: "4px",
              }}
            >
              <div style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-text-secondary, #888)",
                textTransform: "uppercase" as const,
                letterSpacing: "0.5px",
              }}>
                Домашний ресторан
              </div>
              <button
                onClick={() => { setMapSelectedKey(profile.homeRestaurant || null); setShowMapPicker(true); }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-primary, #c4633a)",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "4px 0",
                  fontFamily: "var(--font-body, Inter, sans-serif)",
                }}
              >
                {profile.homeRestaurant ? "Изменить" : "Выбрать"}
              </button>
            </div>

            {profile.homeRestaurant && restaurantCoords[profile.homeRestaurant] ? (
              <div
                onClick={() => { setMapSelectedKey(profile.homeRestaurant || null); setShowMapPicker(true); }}
                style={{
                  ...cardStyle,
                  padding: "0",
                  overflow: "hidden",
                  borderRadius: "var(--radius-2xl, 24px)",
                  boxShadow: "var(--shadow-lg, 0 8px 24px rgba(0,0,0,0.1))",
                  cursor: "pointer",
                }}
              >
                <LocationMap
                  markers={[{
                    id: 1,
                    lat: restaurantCoords[profile.homeRestaurant].lat,
                    lng: restaurantCoords[profile.homeRestaurant].lng,
                    title: `Андерсон ${profile.homeRestaurant}`,
                    address: restaurantCoords[profile.homeRestaurant].address,
                  }]}
                  selectedId={1}
                  height="160px"
                  zoom={15}
                  center={[restaurantCoords[profile.homeRestaurant].lat, restaurantCoords[profile.homeRestaurant].lng]}
                />
                <div style={{
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}>
                  <MapPinIcon />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-display, Nunito, sans-serif)" }}>
                      Андерсон {profile.homeRestaurant}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--color-text-secondary, #888)", marginTop: "2px" }}>
                      {restaurantCoords[profile.homeRestaurant].address}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setMapSelectedKey(null); setShowMapPicker(true); }}
                style={{
                  ...cardStyle,
                  width: "100%",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  cursor: "pointer",
                  border: "2px dashed var(--color-border, #e0d8cf)",
                  background: "transparent",
                  color: "var(--color-text-secondary, #888)",
                  fontSize: "14px",
                  fontWeight: 600,
                  fontFamily: "var(--font-body, Inter, sans-serif)",
                }}
              >
                <MapPinIcon />
                Выбрать домашний ресторан
              </button>
            )}
          </motion.div>
        )}

        {/* ── Children Section ── */}
        <motion.div variants={fadeUp} style={{ ...cardStyle, marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
            <ChildIcon />
            <span
              style={{
                fontFamily: "var(--font-display, Nunito, sans-serif)",
                fontWeight: 700,
                fontSize: "17px",
              }}
            >
              Дети
            </span>
          </div>

          {profile.children.length === 0 && (
            <p style={{ color: "var(--color-text-secondary, #888)", fontSize: "14px", marginBottom: "14px", lineHeight: 1.5 }}>
              Добавьте ребёнка — мы напомним о дне рождения и подготовим подарок!
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: profile.children.length > 0 ? "16px" : "0" }}>
            {profile.children.map((child) => (
              <div
                key={child.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  background: "var(--color-bg, #faf6f1)",
                  borderRadius: "16px",
                  transition: "background-color 0.2s ease",
                }}
              >
                <div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a1a" }}>{child.name}</div>
                  <div style={{ fontSize: "13px", color: "var(--color-text-secondary, #888)", marginTop: "2px" }}>
                    {new Date(child.birthDate).toLocaleDateString("ru-RU")}
                  </div>
                </div>
                <button
                  onClick={() => removeChild(child.id)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-text-secondary, #aaa)",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "color 0.2s ease, background 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--color-error, #e74c3c)";
                    e.currentTarget.style.background = "rgba(231,76,60,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--color-text-secondary, #aaa)";
                    e.currentTarget.style.background = "none";
                  }}
                  title="Удалить"
                >
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

          {/* Add child */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              alignItems: "stretch",
            }}
          >
            <input
              className="profile-input"
              value={newChild.name}
              onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
              placeholder="Имя"
              style={{ ...inputStyle, flex: 1 }}
            />
            <input
              className="profile-input"
              type="date"
              value={newChild.birthDate}
              onChange={(e) => setNewChild({ ...newChild, birthDate: e.target.value })}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={addChild}
              style={{
                background: "none",
                border: "2px dashed var(--color-primary, #c4633a)",
                borderRadius: "var(--radius-xl, 20px)",
                color: "var(--color-primary, #c4633a)",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: "22px",
                flexShrink: 0,
                width: "52px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--color-primary, #c4633a)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "var(--color-primary, #c4633a)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = "var(--color-primary, #c4633a)";
                e.currentTarget.style.borderColor = "var(--color-primary, #c4633a)";
              }}
            >
              +
            </button>
          </div>
        </motion.div>

        {/* ── Logout ── */}
        <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
          <button
            onClick={logout}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "14px 40px",
              borderRadius: "var(--radius-xl, 20px)",
              border: "2px solid var(--color-error, #e74c3c)",
              background: "transparent",
              color: "var(--color-error, #e74c3c)",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "var(--font-body, Inter, sans-serif)",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--color-error, #e74c3c)";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--color-error, #e74c3c)";
            }}
          >
            <LogoutIcon />
            Выйти
          </button>
        </motion.div>
      </motion.div>

      {/* ── Restaurant Map Picker Modal ── */}
      <AnimatePresence>
        {showMapPicker && (
          <RestaurantMapPicker
            selectedKey={mapSelectedKey}
            onSelect={async (key) => {
              if (editing) {
                setForm({ ...form, homeRestaurant: key });
              } else {
                try {
                  await apiFetch("/users/profile", {
                    method: "PUT",
                    body: JSON.stringify({ homeRestaurant: key }),
                  });
                  await loadProfile();
                } catch {}
              }
              setShowMapPicker(false);
            }}
            onClose={() => setShowMapPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ── Restaurant Map Picker ── */
const allRestaurants = Object.entries(restaurantCoords).map(([key, data], i) => ({
  id: i + 1,
  key,
  label: `Андерсон ${key}`,
  ...data,
}));

function RestaurantMapPicker({
  selectedKey,
  onSelect,
  onClose,
}: {
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onClose: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<number | null>(
    selectedKey ? allRestaurants.find((r) => r.key === selectedKey)?.id ?? null : null
  );

  const markers: MapMarker[] = allRestaurants.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    title: r.label,
    address: r.address,
  }));

  const handleMarkerClick = useCallback((id: number) => {
    setHoveredId(id);
    const el = document.getElementById(`picker-restaurant-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const selectedRestaurant = hoveredId ? allRestaurants.find((r) => r.id === hoveredId) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "var(--color-bg, #faf6f1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 16px",
        borderBottom: "1px solid var(--color-border-light, #eee)",
        background: "var(--color-card, #fff)",
        flexShrink: 0,
      }}>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
            alignItems: "center",
            color: "var(--color-text-secondary, #888)",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
        <span style={{
          fontFamily: "var(--font-display, Nunito, sans-serif)",
          fontWeight: 700,
          fontSize: "17px",
        }}>
          Выберите ресторан
        </span>
        <div style={{ width: "32px" }} />
      </div>

      {/* Map */}
      <div style={{ flexShrink: 0 }}>
        <LocationMap
          markers={markers}
          selectedId={hoveredId}
          onMarkerClick={handleMarkerClick}
          height="220px"
          center={[55.751, 37.618]}
          zoom={10}
        />
      </div>

      {/* Selected restaurant confirm bar */}
      <AnimatePresence>
        {selectedRestaurant && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "linear-gradient(135deg, rgba(196,99,58,0.08), rgba(212,168,67,0.08))",
              borderBottom: "1px solid var(--color-border-light, #eee)",
              flexShrink: 0,
            }}
          >
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary, #c4633a), var(--color-primary-dark, #9b3f1e))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-display, Nunito, sans-serif)" }}>
                {selectedRestaurant.label}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-secondary, #888)", marginTop: "1px" }}>
                {selectedRestaurant.address}
              </div>
            </div>
            <button
              onClick={() => onSelect(selectedRestaurant.key)}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, var(--color-primary, #c4633a), var(--color-primary-dark, #9b3f1e))",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-lg, 16px)",
                fontWeight: 700,
                fontSize: "14px",
                cursor: "pointer",
                flexShrink: 0,
                boxShadow: "0 4px 12px rgba(196,99,58,0.3)",
              }}
            >
              Выбрать
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Restaurant list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 16px 32px" }}>
        {allRestaurants.map((r) => {
          const isActive = hoveredId === r.id;
          const isCurrentHome = selectedKey === r.key;
          return (
            <div
              key={r.id}
              id={`picker-restaurant-${r.id}`}
              onClick={() => setHoveredId(r.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 12px",
                borderRadius: "var(--radius-lg, 16px)",
                cursor: "pointer",
                background: isActive
                  ? "rgba(196, 99, 58, 0.08)"
                  : "transparent",
                border: isActive
                  ? "2px solid var(--color-primary, #c4633a)"
                  : "2px solid transparent",
                marginBottom: "4px",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background: isActive
                  ? "linear-gradient(135deg, var(--color-primary, #c4633a), var(--color-accent-gold, #d4a843))"
                  : "var(--color-bg-warm, #f5efe8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                transition: "background 0.2s ease",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isActive ? "#fff" : "var(--color-primary, #c4633a)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: isActive ? 700 : 600,
                  fontSize: "15px",
                  color: isActive ? "var(--color-primary, #c4633a)" : "var(--color-text, #1a1a1a)",
                }}>
                  {r.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--color-text-secondary, #888)", marginTop: "1px" }}>
                  {r.address}
                </div>
              </div>
              {isCurrentHome && (
                <span style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--color-accent-green, #3d7a5f)",
                  background: "var(--color-accent-green-light, #e6f2ec)",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  flexShrink: 0,
                }}>
                  Текущий
                </span>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── InfoRow component ── */
function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null }) {
  return (
    <div
      className="info-row"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        fontSize: "14px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ flexShrink: 0, opacity: 0.85 }}>{icon}</div>
        <span style={{ color: "var(--color-text-secondary, #888)" }}>{label}</span>
      </div>
      <span style={{ fontWeight: 600, color: "#1a1a1a", textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}

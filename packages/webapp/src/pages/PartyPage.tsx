import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/BackButton.js";
import { track } from "../lib/analytics.js";
import { useAuth } from "../context/AuthContext.js";

const PHONE = "+74952219363";
const TG_MANAGER = "https://t.me/anderson_manager";

const programs = [
  { id: "classic", name: "Классический", price: 36000, desc: "Аниматор, игры, конкурсы — 2 часа", icon: "🎈" },
  { id: "show", name: "Шоу-программа", price: 48000, desc: "Шоу + аниматор + интерактив — 2.5 часа", icon: "🎪" },
  { id: "master", name: "Мастер-класс", price: 42000, desc: "Кулинарный/творческий МК + игры — 2 часа", icon: "👨‍🍳" },
  { id: "premium", name: "VIP Праздник", price: 65000, desc: "2 аниматора + шоу + декор + фото — 3 часа", icon: "👑" },
];

const addons = [
  { id: "decor", name: "Тематический декор", price: 8000, icon: "🎨" },
  { id: "photo", name: "Фотограф (1 час)", price: 6000, icon: "📸" },
  { id: "cake", name: "Торт от кондитера", price: 5500, icon: "🎂" },
  { id: "bubble", name: "Шоу мыльных пузырей", price: 5000, icon: "🫧" },
  { id: "face", name: "Аквагрим", price: 4000, icon: "🎭" },
  { id: "balloon", name: "Фигуры из шаров", price: 3500, icon: "🎈" },
];

const features = [
  { text: "Фирменные анимационные программы", icon: "🎭" },
  { text: "Любимые персонажи Андерсона", icon: "🧸" },
  { text: "Кулинарные мастер-классы", icon: "👨‍🍳" },
  { text: "Яркие шоу-программы", icon: "✨" },
  { text: "Декор и оформление зала", icon: "🎨" },
  { text: "Праздничный стол для детей и взрослых", icon: "🍰" },
];

function plural(n: number, one: string, few: string, many: string) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return many;
  if (mod10 === 1) return one;
  if (mod10 >= 2 && mod10 <= 4) return few;
  return many;
}

const RESTAURANTS = [
  "Андерсон на Тверской",
  "Андерсон в Красной Пресне",
  "Андерсон на Кутузовском",
  "Андерсон на Островитянова",
  "Андерсон в Бутово",
  "Андерсон на Проспекте Мира",
];

export function PartyPage() {
  const { apiFetch } = useAuth();
  const [program, setProgram] = useState(programs[0]);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [guests, setGuests] = useState(10);
  const [step, setStep] = useState<"calc" | "info" | "form">("info");

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formChildName, setFormChildName] = useState("");
  const [formChildAge, setFormChildAge] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formRestaurant, setFormRestaurant] = useState("");
  const [formWishes, setFormWishes] = useState("");
  const [formSending, setFormSending] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const [formError, setFormError] = useState("");

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addonsTotal = addons
    .filter((a) => selectedAddons.has(a.id))
    .reduce((sum, a) => sum + a.price, 0);

  // Food estimate: ~1500-2000 per person
  const foodEstimate = guests * 1800;
  const total = program.price + addonsTotal + foodEstimate;

  const buildTelegramMessage = () => {
    const addonNames = addons
      .filter((a) => selectedAddons.has(a.id))
      .map((a) => a.name)
      .join(", ");

    const msg = [
      `Здравствуйте! Хочу организовать праздник в Андерсоне.`,
      ``,
      `Программа: ${program.name} (${program.price.toLocaleString("ru-RU")} ₽)`,
      `Гостей: ${guests} ${plural(guests, "человек", "человека", "человек")}`,
      addonNames ? `Доп. услуги: ${addonNames}` : null,
      ``,
      `Примерный бюджет: ${total.toLocaleString("ru-RU")} ₽`,
    ].filter(Boolean).join("\n");

    return `${TG_MANAGER}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div style={{ padding: "16px", paddingBottom: 100 }}>
      <BackButton />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{
          fontFamily: "var(--font-display)", fontSize: "26px", fontWeight: 800,
          marginBottom: 4, letterSpacing: "-0.3px",
        }}>
          Праздник в Андерсоне
        </h2>
        <p style={{ fontSize: "14px", color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
          50+ программ для идеального дня рождения!
        </p>
      </motion.div>

      {/* Coordinator card */}
      <motion.a
        href={`tel:${PHONE}`}
        onClick={() => track("party_call")}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: "block", textDecoration: "none",
          background: "linear-gradient(135deg, #192d14 0%, #1e3a18 100%)",
          borderRadius: 20, padding: "18px 20px", marginBottom: 16,
          position: "relative", overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", top: -20, right: -10, fontSize: 80, opacity: 0.06, pointerEvents: "none" }}>🎉</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, position: "relative", zIndex: 1 }}>
          <span style={{ fontSize: 18 }}>📞</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#ddc669" }}>Координатор праздников</span>
        </div>
        <span style={{ fontWeight: 800, fontSize: 20, color: "#fff", fontFamily: "var(--font-display)", display: "block", marginBottom: 4, position: "relative", zIndex: 1 }}>
          +7 (495) 221-93-63
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", position: "relative", zIndex: 1 }}>
          Ежедневно 10:00–19:00 · Нажмите чтобы позвонить
        </span>
      </motion.a>

      {/* Segmented control: Info / Calculator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        style={{
          display: "flex", background: "var(--color-border-light, #eee8e0)",
          borderRadius: 16, padding: 4, marginBottom: 20, position: "relative",
        }}
      >
        {(["info", "calc", "form"] as const).map((t) => {
          const isActive = step === t;
          const label = t === "info" ? "О праздниках" : t === "calc" ? "Калькулятор" : "Заявка";
          return (
            <button
              key={t}
              onClick={() => setStep(t)}
              style={{
                flex: 1, padding: "10px 0", border: "none",
                background: "transparent", fontSize: 14, fontWeight: 600,
                fontFamily: "var(--font-body)", cursor: "pointer",
                position: "relative", zIndex: 2,
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                transition: "color 0.25s",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {label}
              {isActive && (
                <motion.div
                  layoutId="party-tab"
                  style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(135deg, #192d14, #1e3a18)",
                    borderRadius: 12, zIndex: -1,
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "info" ? (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Features */}
            <div style={{
              background: "var(--color-card)", borderRadius: 20,
              padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)",
            }}>
              <h3 style={{ fontSize: 17, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>
                Что мы предлагаем
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {features.map((f, i) => (
                  <motion.div
                    key={f.text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    style={{ display: "flex", gap: 12, alignItems: "center" }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: "var(--color-bg-warm, #faf6f1)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>
                      {f.icon}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{f.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Programs preview */}
            <div style={{
              background: "var(--color-card)", borderRadius: 20,
              padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)",
            }}>
              <h3 style={{ fontSize: 17, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16 }}>
                Программы
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {programs.map((p) => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 14px", borderRadius: 14,
                    background: "var(--color-bg-warm, #faf6f1)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 20 }}>{p.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)" }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{p.desc}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)",
                      color: "var(--color-primary)", whiteSpace: "nowrap",
                    }}>
                      от {(p.price / 1000).toFixed(0)}т ₽
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA to calculator */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => { setStep("calc"); track("party_calculator_open"); }}
              style={{
                width: "100%", padding: 16,
                background: "linear-gradient(135deg, #192d14, #1e3a18)",
                color: "#fff", border: "none", borderRadius: 16,
                fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)",
                boxShadow: "0 4px 20px rgba(25,45,20,0.3)",
                cursor: "pointer",
              }}
            >
              Рассчитать стоимость праздника
            </motion.button>
          </motion.div>
        ) : step === "calc" ? (
          <motion.div
            key="calc"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {/* Program selection */}
            <div style={{
              background: "var(--color-card)", borderRadius: 20,
              padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)",
            }}>
              <h3 style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 14 }}>
                Выберите программу
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {programs.map((p) => {
                  const isSelected = program.id === p.id;
                  return (
                    <motion.button
                      key={p.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setProgram(p)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", borderRadius: 14,
                        border: isSelected ? "2px solid #192d14" : "2px solid transparent",
                        background: isSelected ? "rgba(25,45,20,0.06)" : "var(--color-bg-warm, #faf6f1)",
                        cursor: "pointer", transition: "all 0.2s",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{p.icon}</span>
                        <div>
                          <div style={{
                            fontSize: 14, fontWeight: isSelected ? 800 : 600,
                            fontFamily: "var(--font-display)",
                            color: isSelected ? "#192d14" : "var(--color-text)",
                          }}>
                            {p.name}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{p.desc}</div>
                        </div>
                      </div>
                      <span style={{
                        fontSize: 14, fontWeight: 800, fontFamily: "var(--font-display)",
                        color: "#192d14", whiteSpace: "nowrap", marginLeft: 8,
                      }}>
                        {p.price.toLocaleString("ru-RU")} ₽
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Guests slider */}
            <div style={{
              background: "var(--color-card)", borderRadius: 20,
              padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700 }}>
                  Количество гостей
                </h3>
                <span style={{
                  fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)",
                  color: "#192d14",
                }}>
                  {guests}
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={40}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                style={{
                  width: "100%", height: 6,
                  appearance: "none", WebkitAppearance: "none",
                  background: `linear-gradient(to right, #192d14 ${((guests - 5) / 35) * 100}%, #e0dbd4 ${((guests - 5) / 35) * 100}%)`,
                  borderRadius: 3, outline: "none",
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--color-text-tertiary, #b0a89e)", marginTop: 6 }}>
                <span>5</span>
                <span>~{(foodEstimate / 1000).toFixed(0)}т ₽ на банкет</span>
                <span>40</span>
              </div>
            </div>

            {/* Add-ons */}
            <div style={{
              background: "var(--color-card)", borderRadius: 20,
              padding: 20, marginBottom: 16, boxShadow: "var(--shadow-sm)",
            }}>
              <h3 style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 14 }}>
                Дополнительные услуги
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {addons.map((a) => {
                  const isOn = selectedAddons.has(a.id);
                  return (
                    <motion.button
                      key={a.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => toggleAddon(a.id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        gap: 6, padding: "14px 8px", borderRadius: 14,
                        border: isOn ? "2px solid #192d14" : "2px solid transparent",
                        background: isOn ? "rgba(25,45,20,0.06)" : "var(--color-bg-warm, #faf6f1)",
                        cursor: "pointer", transition: "all 0.2s",
                        textAlign: "center",
                      }}
                    >
                      <span style={{ fontSize: 24 }}>{a.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: isOn ? 700 : 500, color: isOn ? "#192d14" : "var(--color-text)" }}>
                        {a.name}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#192d14" }}>
                        +{(a.price / 1000).toFixed(0)}т ₽
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                background: "linear-gradient(135deg, #192d14, #1e3a18)",
                borderRadius: 20, padding: 20, marginBottom: 16,
                color: "#fff",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, opacity: 0.7 }}>Программа</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{program.price.toLocaleString("ru-RU")} ₽</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, opacity: 0.7 }}>Банкет ({guests} чел × 1 800 ₽)</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{foodEstimate.toLocaleString("ru-RU")} ₽</span>
              </div>
              {addonsTotal > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, opacity: 0.7 }}>Доп. услуги</span>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{addonsTotal.toLocaleString("ru-RU")} ₽</span>
                </div>
              )}
              <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 14, fontWeight: 600 }}>Итого (примерно)</span>
                <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", color: "#ddc669" }}>
                  {total.toLocaleString("ru-RU")} ₽
                </span>
              </div>
            </motion.div>

            {/* CTA buttons */}
            <div style={{ display: "flex", gap: 10 }}>
              <motion.a
                href={buildTelegramMessage()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("party_telegram", { total, program: program.name, guests })}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: 16, textAlign: "center",
                  background: "#2AABEE", color: "#fff", textDecoration: "none",
                  border: "none", borderRadius: 16,
                  fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)",
                  boxShadow: "0 4px 16px rgba(42,171,238,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </motion.a>
              <motion.a
                href={`tel:${PHONE}`}
                onClick={() => track("party_call", { total, program: program.name })}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: 16, textAlign: "center",
                  background: "linear-gradient(135deg, #192d14, #1e3a18)",
                  color: "#fff", textDecoration: "none",
                  border: "none", borderRadius: 16,
                  fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)",
                  boxShadow: "0 4px 16px rgba(25,45,20,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Позвонить
              </motion.a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {formSent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  background: "var(--color-card)", borderRadius: 20,
                  padding: 32, textAlign: "center", boxShadow: "var(--shadow-sm)",
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontSize: 20, fontFamily: "var(--font-display)", fontWeight: 800, marginBottom: 8 }}>
                  Заявка отправлена!
                </h3>
                <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: 20 }}>
                  Наш координатор свяжется с вами в ближайшее время для уточнения деталей.
                </p>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setFormSent(false); setStep("info"); }}
                  style={{
                    padding: "12px 32px",
                    background: "linear-gradient(135deg, #192d14, #1e3a18)",
                    color: "#fff", border: "none", borderRadius: 14,
                    fontSize: 14, fontWeight: 700, fontFamily: "var(--font-display)",
                    cursor: "pointer",
                  }}
                >
                  Отлично!
                </motion.button>
              </motion.div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setFormError("");
                  setFormSending(true);
                  try {
                    const addonNames = addons
                      .filter((a) => selectedAddons.has(a.id))
                      .map((a) => a.name)
                      .join(", ");

                    await apiFetch("/party-requests", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        name: formName,
                        phone: formPhone,
                        childName: formChildName || undefined,
                        childAge: formChildAge ? Number(formChildAge) : undefined,
                        date: formDate || undefined,
                        guestsCount: guests,
                        program: program.name + (addonNames ? ` + ${addonNames}` : ""),
                        wishes: formWishes || undefined,
                        restaurant: formRestaurant || undefined,
                        total,
                      }),
                    });
                    track("party_request_submit", { program: program.name, guests, total });
                    setFormSent(true);
                  } catch (err: any) {
                    setFormError(err?.message || "Ошибка отправки. Попробуйте ещё раз.");
                  } finally {
                    setFormSending(false);
                  }
                }}
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div style={{
                  background: "var(--color-card)", borderRadius: 20,
                  padding: 20, boxShadow: "var(--shadow-sm)",
                }}>
                  <h3 style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 14 }}>
                    Контактные данные
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <input
                      required
                      placeholder="Ваше имя *"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      style={formInput}
                    />
                    <input
                      required
                      type="tel"
                      placeholder="Телефон *"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      style={formInput}
                    />
                  </div>
                </div>

                <div style={{
                  background: "var(--color-card)", borderRadius: 20,
                  padding: 20, boxShadow: "var(--shadow-sm)",
                }}>
                  <h3 style={{ fontSize: 15, fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 14 }}>
                    Детали праздника
                  </h3>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <input
                        placeholder="Имя ребёнка"
                        value={formChildName}
                        onChange={(e) => setFormChildName(e.target.value)}
                        style={formInput}
                      />
                      <input
                        type="number"
                        placeholder="Возраст"
                        min={1}
                        max={17}
                        value={formChildAge}
                        onChange={(e) => setFormChildAge(e.target.value)}
                        style={formInput}
                      />
                    </div>

                    <input
                      type="date"
                      placeholder="Желаемая дата"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      style={{ ...formInput, color: formDate ? "var(--color-text)" : "var(--color-text-secondary)" }}
                    />

                    <select
                      value={formRestaurant}
                      onChange={(e) => setFormRestaurant(e.target.value)}
                      style={{ ...formInput, color: formRestaurant ? "var(--color-text)" : "var(--color-text-secondary)" }}
                    >
                      <option value="">Выберите ресторан</option>
                      {RESTAURANTS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>

                    <textarea
                      placeholder="Пожелания (необязательно)"
                      value={formWishes}
                      onChange={(e) => setFormWishes(e.target.value)}
                      rows={3}
                      style={{ ...formInput, resize: "vertical", minHeight: 60 }}
                    />
                  </div>
                </div>

                {/* Selected config summary */}
                <div style={{
                  background: "var(--color-bg-warm, #faf6f1)", borderRadius: 16,
                  padding: "14px 16px", fontSize: 13, color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 600, color: "var(--color-text)" }}>Выбрано:</span>{" "}
                  {program.name}, {guests} гостей
                  {addonsTotal > 0 && `, доп. услуги на ${addonsTotal.toLocaleString("ru-RU")} ₽`}
                  {" · "}
                  <span style={{ fontWeight: 700, color: "#192d14" }}>
                    ~{total.toLocaleString("ru-RU")} ₽
                  </span>
                </div>

                {formError && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    color: "#dc2626", padding: "10px 14px", borderRadius: 12,
                    fontSize: 13, textAlign: "center",
                  }}>
                    {formError}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={formSending}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: "100%", padding: 16,
                    background: formSending ? "#94a3b8" : "linear-gradient(135deg, #192d14, #1e3a18)",
                    color: "#fff", border: "none", borderRadius: 16,
                    fontSize: 15, fontWeight: 700, fontFamily: "var(--font-display)",
                    boxShadow: formSending ? "none" : "0 4px 20px rgba(25,45,20,0.3)",
                    cursor: formSending ? "default" : "pointer",
                  }}
                >
                  {formSending ? "Отправка..." : "Отправить заявку"}
                </motion.button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const formInput: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid var(--color-border-light, #e0dbd4)",
  borderRadius: 12,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "var(--font-body)",
  background: "var(--color-bg-warm, #faf6f1)",
  color: "var(--color-text)",
  WebkitAppearance: "none",
};

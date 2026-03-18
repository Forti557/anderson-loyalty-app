import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.js";

/* ===== Slide gradient palettes ===== */
const slideGradients = [
  "linear-gradient(165deg, #fde8d8 0%, #f5c6a0 40%, #e8845c 100%)",
  "linear-gradient(165deg, #fdf5e3 0%, #f5e6c0 40%, #d4a843 100%)",
  "linear-gradient(165deg, #e6f2ec 0%, #b8d9c8 40%, #3d7a5f 100%)",
];

const slideTitleColors = ["#5c2a10", "#4a3510", "#1a3d2a"];
const slideTextColors = ["#8a5a3a", "#7a6530", "#3a6a50"];

/* ===== Animation variants ===== */
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
    scale: 0.95,
  }),
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.07 },
  },
};

const staggerItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ===== Date picker helpers ===== */
const months = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

function daysInMonth(month: number, year: number): number {
  if (!month || !year) return 31;
  return new Date(year, month, 0).getDate();
}

function parseDateStr(val: string): { day: string; month: string; year: string } {
  if (!val) return { day: "", month: "", year: "" };
  const [y, m, d] = val.split("-");
  return { day: d || "", month: m || "", year: y || "" };
}

function toDateStr(day: string, month: string, year: string): string {
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

const selectBaseStyle: React.CSSProperties = {
  flex: 1,
  padding: "12px 8px",
  border: "none",
  borderBottom: "2px solid var(--color-border)",
  borderRadius: 0,
  background: "transparent",
  fontSize: "var(--text-base)",
  fontFamily: "var(--font-body)",
  color: "var(--color-text)",
  outline: "none",
  appearance: "none",
  WebkitAppearance: "none",
  cursor: "pointer",
  textAlign: "center" as const,
  transition: "border-color var(--duration-normal) ease",
};

function DateSelect({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const initial = parseDateStr(value);
  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const currentYear = new Date().getFullYear();
  const maxDays = daysInMonth(Number(month), Number(year));

  const update = (d: string, m: string, y: string) => {
    // Clamp day if month/year changed
    const clamped = d && Number(d) > daysInMonth(Number(m), Number(y))
      ? String(daysInMonth(Number(m), Number(y)))
      : d;
    setDay(clamped);
    setMonth(m);
    setYear(y);
    // Only emit full date when all parts are filled
    if (clamped && m && y) {
      onChange(toDateStr(clamped, m, y));
    } else {
      onChange("");
    }
  };

  const placeholderColor = "var(--color-text-tertiary)";

  return (
    <div>
      {label && (
        <div style={{
          fontSize: "var(--text-xs)",
          color: "var(--color-text-tertiary)",
          marginBottom: "var(--space-sm)",
          fontWeight: 500,
        }}>
          {label}
        </div>
      )}
      <div style={{ display: "flex", gap: "10px" }}>
        {/* Day */}
        <select
          className="onb-input"
          value={day}
          onChange={(e) => update(e.target.value, month, year)}
          style={{ ...selectBaseStyle, color: day ? "var(--color-text)" : placeholderColor }}
        >
          <option value="" disabled>День</option>
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
            <option key={d} value={String(d)}>{d}</option>
          ))}
        </select>

        {/* Month */}
        <select
          className="onb-input"
          value={month}
          onChange={(e) => update(day, e.target.value, year)}
          style={{ ...selectBaseStyle, flex: 1.5, color: month ? "var(--color-text)" : placeholderColor }}
        >
          <option value="" disabled>Месяц</option>
          {months.map((name, i) => (
            <option key={i} value={String(i + 1)}>{name}</option>
          ))}
        </select>

        {/* Year */}
        <select
          className="onb-input"
          value={year}
          onChange={(e) => update(day, month, e.target.value)}
          style={{ ...selectBaseStyle, color: year ? "var(--color-text)" : placeholderColor }}
        >
          <option value="" disabled>Год</option>
          {Array.from({ length: 80 }, (_, i) => currentYear - i).map((y) => (
            <option key={y} value={String(y)}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ===== Types ===== */
interface ChildEntry {
  name: string;
  birthDate: string;
}

/* ===== Component ===== */
interface OnboardingPageProps {
  tempToken: string;
  phone: string;
}

export function OnboardingPage({ tempToken, phone }: OnboardingPageProps) {
  const { register } = useAuth();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [birthday, setBirthday] = useState("");
  const [children, setChildren] = useState<ChildEntry[]>([]);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const slides = [
    {
      emoji: "\uD83C\uDFE0",
      title: "Андерсон \u2014 кафе для больших маленьких",
      text: "Место, где взрослые могут быть детьми, а дети чувствуют себя самыми важными. Маленькие ритуалы и большие традиции \u2014 с 2009 года.",
    },
    {
      emoji: "\uD83C\uDF81",
      title: "Большие маленькие поводы каждый день",
      text: "Кешбэк до 15% с каждого визита, штамп-карта с подарками и бонусы за дни рождения. Покажите QR-код \u2014 и всё начислится само.",
    },
    {
      emoji: "\uD83D\uDC9B",
      title: "Мы рады всем, кто однажды был ребёнком!",
      text: "Мастер-классы, праздники, кондитерская и уютная атмосфера \u2014 34 кафе в Москве и регионах. Присоединяйтесь к нашей семье!",
    },
  ];

  const goNext = () => {
    setDirection(1);
    setStep(step + 1);
  };

  // Onboarding slides
  if (step < 3) {
    const progressWidth = ((step + 1) / 3) * 100;

    return (
      <div
        style={{
          position: "relative",
          minHeight: "100dvh",
          overflow: "hidden",
        }}
      >
        {/* Decorative background shapes */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            right: "-60px",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            left: "-40px",
            width: "160px",
            height: "160px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            right: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            style={{
              padding: "0 var(--space-2xl)",
              minHeight: "100dvh",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              background: slideGradients[step],
            }}
          >
            {/* Emoji with glow */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                fontSize: "80px",
                marginBottom: "var(--space-3xl)",
                filter: "drop-shadow(0 8px 24px rgba(196, 99, 58, 0.25))",
                lineHeight: 1,
              }}
            >
              {slides[step].emoji}
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-3xl)",
                textAlign: "center",
                marginBottom: "var(--space-lg)",
                lineHeight: 1.25,
                color: slideTitleColors[step],
                letterSpacing: "-0.02em",
                maxWidth: "340px",
              }}
            >
              {slides[step].title}
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-base)",
                textAlign: "center",
                lineHeight: 1.65,
                color: slideTextColors[step],
                maxWidth: "320px",
                marginBottom: "var(--space-4xl)",
              }}
            >
              {slides[step].text}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Bottom controls — fixed */}
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "var(--space-2xl) var(--space-2xl) calc(var(--space-3xl) + var(--safe-bottom))",
            background: "linear-gradient(to top, rgba(250,246,241,0.97) 60%, rgba(250,246,241,0) 100%)",
          }}
        >
          {/* Pill progress bar */}
          <div
            style={{
              width: "100%",
              height: "6px",
              borderRadius: "var(--radius-full)",
              background: "var(--color-border)",
              marginBottom: "var(--space-xl)",
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{ width: `${progressWidth}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                height: "100%",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(90deg, var(--color-primary), var(--color-primary-light))",
              }}
            />
          </div>

          {/* CTA Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={goNext}
            style={{
              width: "100%",
              padding: "18px",
              border: "none",
              borderRadius: "var(--radius-xl)",
              fontSize: "var(--text-lg)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              color: "var(--color-text-inverse)",
              background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
              boxShadow: "var(--shadow-glow), var(--shadow-md)",
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Shimmer overlay */}
            <span
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background:
                  "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2.5s ease-in-out infinite",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative" }}>
              {step < 2 ? "Дальше" : "Давай начнём!"}
            </span>
          </motion.button>
        </div>
      </div>
    );
  }

  // Registration form
  const addChild = () => setChildren([...children, { name: "", birthDate: "" }]);
  const removeChild = (i: number) => setChildren(children.filter((_, idx) => idx !== i));
  const updateChild = (i: number, field: keyof ChildEntry, value: string) => {
    const updated = [...children];
    updated[i] = { ...updated[i], [field]: value };
    setChildren(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const validChildren = children.filter((c) => c.name && c.birthDate);
      await register({
        tempToken,
        firstName,
        lastName: "",
        phone,
        email: email || undefined,
        birthday: birthday || undefined,
        children: validChildren.length > 0 ? validChildren : undefined,
        privacyAccepted,
      });
    } catch (err: any) {
      setError(err.message || "Что-то пошло не так, попробуйте ещё раз");
      setSubmitting(false);
    }
  };

  /* ---- Shared input style (bottom-border minimal) ---- */
  const inputWrapStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 0 10px",
    border: "none",
    borderBottom: "2px solid var(--color-border)",
    borderRadius: 0,
    background: "transparent",
    fontSize: "var(--text-base)",
    fontFamily: "var(--font-body)",
    color: "var(--color-text)",
    outline: "none",
    transition: "border-color var(--duration-normal) ease",
  };

  const inputFocusCSS = `
    .onb-input:focus {
      border-bottom-color: var(--color-primary);
      box-shadow: 0 2px 0 0 var(--color-primary-glow);
    }
    .onb-input::placeholder {
      color: var(--color-text-tertiary);
      transition: color var(--duration-fast) ease;
    }
    .onb-input:focus::placeholder {
      color: var(--color-primary-light);
    }
    @keyframes pulseBtn {
      0%, 100% { box-shadow: 0 0 0 0 rgba(196, 99, 58, 0.3); }
      50% { box-shadow: 0 0 0 10px rgba(196, 99, 58, 0); }
    }
    .add-child-btn {
      animation: pulseBtn 2.5s ease-in-out infinite;
    }
    .add-child-btn:hover {
      animation: none;
      background: var(--color-primary) !important;
      color: white !important;
    }
  `;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="registration"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "relative",
          minHeight: "100dvh",
          background: "var(--color-bg)",
          overflow: "hidden",
        }}
      >
        <style>{inputFocusCSS}</style>

        {/* Decorative background circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-80px",
            width: "280px",
            height: "280px",
            borderRadius: "50%",
            background: "var(--color-primary-glow)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "200px",
            left: "-60px",
            width: "180px",
            height: "180px",
            borderRadius: "50%",
            background: "rgba(212, 168, 67, 0.06)",
            pointerEvents: "none",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            padding: "var(--space-4xl) var(--space-2xl) calc(var(--space-4xl) + var(--safe-bottom))",
            maxWidth: "480px",
            margin: "0 auto",
          }}
        >
          {/* Header */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h2
              variants={staggerItem}
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "var(--text-2xl)",
                marginBottom: "var(--space-sm)",
                color: "var(--color-text)",
              }}
            >
              Расскажите о себе
            </motion.h2>
            <motion.p
              variants={staggerItem}
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                marginBottom: "var(--space-3xl)",
                lineHeight: 1.5,
              }}
            >
              Чтобы мы могли радовать вас и вашу семью
            </motion.p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.96 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-md)",
                  background: "var(--color-error-light)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--space-lg) var(--space-xl)",
                  marginBottom: "var(--space-2xl)",
                  border: "1px solid rgba(192, 57, 43, 0.12)",
                }}
              >
                <span style={{ fontSize: "20px", flexShrink: 0 }}>⚠</span>
                <span
                  style={{
                    fontSize: "var(--text-sm)",
                    color: "var(--color-error)",
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  {error}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}
          >
            {/* Personal info section */}
            <motion.div variants={staggerItem}>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-lg)",
                }}
              >
                Личные данные
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                <div style={inputWrapStyle}>
                  <input
                    className="onb-input"
                    type="text"
                    placeholder="Как вас зовут? *"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--color-border-light)" }} />

            {/* Contact section */}
            <motion.div variants={staggerItem}>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-lg)",
                }}
              >
                Контакты
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
                {/* Phone is shown as read-only — already verified via SMS */}
                <div style={{ ...inputWrapStyle, display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <span style={{ fontSize: "18px" }}>📱</span>
                  <span style={{ color: "var(--color-text)", fontSize: "var(--text-base)", fontWeight: 500 }}>{phone}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-success, #2e7d32)", marginLeft: "auto" }}>✓ подтверждён</span>
                </div>
                <div style={inputWrapStyle}>
                  <input
                    className="onb-input"
                    type="email"
                    placeholder="Email (необязательно)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--color-border-light)" }} />

            {/* Birthday section */}
            <motion.div variants={staggerItem}>
              <div
                style={{
                  fontSize: "var(--text-xs)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-sm)",
                }}
              >
                День рождения
              </div>
              <p
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-tertiary)",
                  marginBottom: "var(--space-md)",
                }}
              >
                Необязательно — но мы подготовим сюрприз
              </p>
              <DateSelect value={birthday} onChange={setBirthday} />
            </motion.div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--color-border-light)" }} />

            {/* Children section */}
            <motion.div variants={staggerItem}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "var(--space-lg)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--color-text-tertiary)",
                      marginBottom: "2px",
                    }}
                  >
                    Дети
                  </div>
                  {children.length === 0 && (
                    <p
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-tertiary)",
                        marginTop: "4px",
                      }}
                    >
                      Мы напомним о празднике и подготовим подарок! 🎂
                    </p>
                  )}
                </div>
                <motion.button
                  type="button"
                  className="add-child-btn"
                  whileTap={{ scale: 0.92 }}
                  onClick={addChild}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    background: "transparent",
                    border: "2px solid var(--color-primary)",
                    color: "var(--color-primary)",
                    borderRadius: "var(--radius-full)",
                    padding: "8px 18px",
                    fontSize: "var(--text-sm)",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all var(--duration-normal) ease",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
                  <span>Добавить</span>
                </motion.button>
              </div>

              <AnimatePresence>
                {children.map((child, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={{ opacity: 0, height: 0, scale: 0.95 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      background: "var(--color-card)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-lg)",
                      marginBottom: "var(--space-md)",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid var(--color-border-light)",
                      overflow: "hidden",
                    }}
                  >
                    {/* Child card header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "var(--space-md)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-sm)",
                          fontWeight: 700,
                          fontFamily: "var(--font-display)",
                          color: "var(--color-primary)",
                        }}
                      >
                        🧒 Ребёнок {i + 1}
                      </span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() => removeChild(i)}
                        style={{
                          background: "var(--color-error-light)",
                          border: "none",
                          color: "var(--color-error)",
                          fontSize: "14px",
                          cursor: "pointer",
                          padding: "4px 10px",
                          borderRadius: "var(--radius-sm)",
                          fontWeight: 600,
                          transition: "all var(--duration-fast) ease",
                        }}
                      >
                        Убрать
                      </motion.button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
                      <input
                        className="onb-input"
                        type="text"
                        placeholder="Имя ребёнка"
                        value={child.name}
                        onChange={(e) => updateChild(i, "name", e.target.value)}
                        style={inputStyle}
                      />
                      <DateSelect
                        value={child.birthDate}
                        onChange={(v) => updateChild(i, "birthDate", v)}
                        label="Дата рождения"
                      />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--color-border-light)" }} />

            {/* Privacy checkbox */}
            <motion.label
              variants={staggerItem}
              style={{
                display: "flex",
                gap: "var(--space-md)",
                alignItems: "flex-start",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "22px",
                  height: "22px",
                  flexShrink: 0,
                  marginTop: "1px",
                }}
              >
                <input
                  type="checkbox"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  style={{
                    position: "absolute",
                    opacity: 0,
                    width: "100%",
                    height: "100%",
                    cursor: "pointer",
                    margin: 0,
                  }}
                />
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "6px",
                    border: privacyAccepted
                      ? "2px solid var(--color-primary)"
                      : "2px solid var(--color-border)",
                    background: privacyAccepted ? "var(--color-primary)" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all var(--duration-normal) ease",
                    pointerEvents: "none",
                  }}
                >
                  {privacyAccepted && (
                    <svg
                      width="14"
                      height="10"
                      viewBox="0 0 14 10"
                      fill="none"
                      style={{ display: "block" }}
                    >
                      <path
                        d="M1 5L5 9L13 1"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <span
                style={{
                  fontSize: "var(--text-sm)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.4,
                }}
              >
                Соглашаюсь на обработку персональных данных
              </span>
            </motion.label>

            {/* Submit button */}
            <motion.button
              variants={staggerItem}
              type="submit"
              disabled={submitting}
              whileTap={{ scale: 0.97 }}
              style={{
                width: "100%",
                padding: "18px",
                border: "none",
                borderRadius: "var(--radius-xl)",
                fontSize: "var(--text-lg)",
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: "var(--color-text-inverse)",
                background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)",
                boxShadow: "var(--shadow-glow), var(--shadow-lg)",
                cursor: submitting ? "not-allowed" : "pointer",
                position: "relative",
                overflow: "hidden",
                opacity: submitting ? 0.7 : 1,
                marginTop: "var(--space-sm)",
                transition: "opacity var(--duration-normal) ease",
              }}
            >
              {/* Shimmer overlay */}
              {!submitting && (
                <span
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.2) 50%, transparent 65%)",
                    backgroundSize: "200% 100%",
                    animation: "shimmer 2.5s ease-in-out infinite",
                    pointerEvents: "none",
                  }}
                />
              )}
              <span style={{ position: "relative" }}>
                {submitting ? "Регистрируем..." : "Получить 200 бонусов и 5% кешбэк 🎉"}
              </span>
            </motion.button>
          </motion.form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { motion } from "framer-motion";
import { BackButton } from "../components/BackButton.js";
import { track } from "../lib/analytics.js";

const TG_MANAGER = "https://t.me/anderson_manager";
const PHONE = "+74950219069";

const services = [
  {
    id: 1,
    name: "Доставка",
    description: "Готовые сеты, праздничное меню, десерты с доставкой на ваше мероприятие",
    details: "Вы выбираете блюда из меню или готовые сеты — мы привозим в назначенное время и место",
    icon: "🚗",
    accent: "var(--color-primary)",
  },
  {
    id: 2,
    name: "Доставка с обслуживанием",
    description: "Доставка еды + кейтеринговое обслуживание на вашей площадке",
    details: "Наши официанты сервируют, обслуживают гостей и убирают после мероприятия",
    icon: "🍽️",
    accent: "var(--color-accent-green)",
  },
  {
    id: 3,
    name: "Мероприятия под ключ",
    description: "Полная организация: еда, подрядчики, развлекательная программа, артисты",
    details: "Берём на себя всё — от подбора меню до поиска площадки и организации шоу-программы",
    icon: "🎪",
    accent: "var(--color-accent-gold)",
  },
];

const steps = [
  { step: "1", text: "Позвоните или напишите в Telegram" },
  { step: "2", text: "Мы подберём меню под ваше мероприятие" },
  { step: "3", text: "Привезём и при необходимости обслужим на месте" },
];

export function CateringPage() {
  return (
    <div style={{ padding: "var(--space-lg)" }}>
      <BackButton />
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 style={{ marginBottom: "var(--space-xs)" }}>Кейтеринг</h2>
        <p style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-lg)" }}>
          Вкус Андерсона — на вашем мероприятии
        </p>
      </motion.div>

      {/* Contact */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "linear-gradient(135deg, var(--color-accent-gold-light), #fef9ee)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-lg) var(--space-xl)",
          marginBottom: "var(--space-xl)",
          border: "1px solid rgba(212,168,67,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "6px" }}>
          <span style={{ fontSize: "18px" }}>📞</span>
          <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-accent-gold)" }}>
            Заказ кейтеринга
          </span>
        </div>
        <a href={`tel:${PHONE}`} onClick={() => track("catering_call")} style={{ fontWeight: 800, fontSize: "var(--text-lg)", color: "var(--color-text)", fontFamily: "var(--font-display)", display: "block", marginBottom: "4px", textDecoration: "none" }}>
          +7 (495) 021-90-69
        </a>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
          Индивидуальное меню или готовые сеты · Нажмите чтобы позвонить
        </span>
      </motion.div>

      {/* Services */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        {services.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            style={{
              background: "var(--color-card)",
              borderRadius: "var(--radius-xl)",
              padding: "var(--space-xl)",
              boxShadow: "var(--shadow-sm)",
              borderLeft: `4px solid ${s.accent}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", marginBottom: "var(--space-md)" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "var(--radius-md)",
                background: "var(--color-bg-warm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <h4 style={{ fontWeight: 700, fontSize: "var(--text-lg)", fontFamily: "var(--font-display)" }}>{s.name}</h4>
            </div>
            <p style={{ fontSize: "var(--text-sm)", fontWeight: 500, marginBottom: "var(--space-sm)", lineHeight: 1.4 }}>
              {s.description}
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", lineHeight: 1.5, marginBottom: "var(--space-lg)" }}>
              {s.details}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.a
                href={`${TG_MANAGER}?text=${encodeURIComponent(`Здравствуйте! Интересует кейтеринг «${s.name}». Расскажите подробнее?`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("catering_telegram", { service: s.name })}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: "12px", textAlign: "center",
                  background: "#2AABEE", color: "#fff", textDecoration: "none",
                  borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 700,
                }}
              >
                Telegram
              </motion.a>
              <motion.a
                href={`tel:${PHONE}`}
                onClick={() => track("catering_call", { service: s.name })}
                whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: "12px", textAlign: "center",
                  background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                  color: "var(--color-text-inverse)", textDecoration: "none",
                  borderRadius: "var(--radius-md)", fontSize: "var(--text-sm)", fontWeight: 700,
                }}
              >
                Позвонить
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          background: "var(--color-card)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-xl)",
          marginTop: "var(--space-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h3 style={{ fontSize: "var(--text-lg)", marginBottom: "var(--space-lg)" }}>Как это работает</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
          {steps.map((item) => (
            <div key={item.step} style={{ display: "flex", gap: "var(--space-md)", alignItems: "center" }}>
              <div style={{
                width: "32px",
                height: "32px",
                borderRadius: "var(--radius-full)",
                background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-light))",
                color: "var(--color-text-inverse)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-sm)",
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {item.step}
              </div>
              <span style={{ fontSize: "var(--text-sm)", fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

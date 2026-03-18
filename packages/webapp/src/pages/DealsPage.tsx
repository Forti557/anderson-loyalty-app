import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/BackButton.js";

/* ===== Types ===== */
interface Deal {
  id: number;
  title: string;
  description: string;
  partner: string;
  partnerLogo: string;
  category: string;
  discount: string;
  oldPrice: number | null;
  newPrice: number | null;
  promoCode: string | null;
  cashback: string | null;
  expiresAt: string;
  url: string;
  badge: string | null;
  hot: boolean;
}

/* ===== Mock data (PikabuDeals style) ===== */
const deals: Deal[] = [
  {
    id: 1,
    title: "Набор LEGO Duplo «Семейный дом на колёсах»",
    description: "Идеальный подарок для детей 2-5 лет. 31 деталь, фигурки мамы, папы и ребёнка. Развивает мелкую моторику и воображение.",
    partner: "Детский мир",
    partnerLogo: "DM",
    category: "Детям",
    discount: "-42%",
    oldPrice: 3499,
    newPrice: 1999,
    promoCode: "ANDERSON42",
    cashback: null,
    expiresAt: "15 марта",
    url: "#",
    badge: "ХИТ",
    hot: true,
  },
  {
    id: 2,
    title: "Семейная подписка Яндекс Плюс на 3 месяца",
    description: "Кино, музыка, Букмейт и кешбэк баллами за покупки. До 4 аккаунтов для всей семьи.",
    partner: "Яндекс",
    partnerLogo: "Я",
    category: "Развлечения",
    discount: "-50%",
    oldPrice: 999,
    newPrice: 499,
    promoCode: null,
    cashback: "+10% бонусов",
    expiresAt: "20 марта",
    url: "#",
    badge: null,
    hot: false,
  },
  {
    id: 3,
    title: "Фотокнига A4 на 40 страниц в Netprint",
    description: "Сохраните семейные воспоминания в качественной фотокниге с твёрдой обложкой. Загрузите фото — получите через 3 дня.",
    partner: "Netprint",
    partnerLogo: "NP",
    category: "Фото",
    discount: "-35%",
    oldPrice: 2200,
    newPrice: 1430,
    promoCode: "FAMILY35",
    cashback: null,
    expiresAt: "31 марта",
    url: "#",
    badge: "Новинка",
    hot: false,
  },
  {
    id: 4,
    title: "Билеты в океанариум «Москвариум» для семьи",
    description: "2 взрослых + 2 детских билета на основную экспозицию. 12 000 морских обитателей, шоу косаток каждый день.",
    partner: "Москвариум",
    partnerLogo: "MK",
    category: "Развлечения",
    discount: "-30%",
    oldPrice: 4800,
    newPrice: 3360,
    promoCode: null,
    cashback: "+15% бонусов",
    expiresAt: "10 марта",
    url: "#",
    badge: null,
    hot: true,
  },
  {
    id: 5,
    title: "Детский кулинарный набор «Юный шеф»",
    description: "Безопасные ножи, скалка, формочки, фартук и поварской колпак. Всё для первых кулинарных шедевров вашего ребёнка!",
    partner: "Ozon",
    partnerLogo: "OZ",
    category: "Детям",
    discount: "-25%",
    oldPrice: 2800,
    newPrice: 2100,
    promoCode: "CHEF25",
    cashback: null,
    expiresAt: "25 марта",
    url: "#",
    badge: null,
    hot: false,
  },
  {
    id: 6,
    title: "Сертификат в батутный парк FlipFly на 2 часа",
    description: "Неограниченное время на всех батутах, поролоновая яма, скалодром. Для детей от 3 лет и взрослых. Любой день.",
    partner: "FlipFly",
    partnerLogo: "FF",
    category: "Спорт",
    discount: "-20%",
    oldPrice: 1800,
    newPrice: 1440,
    promoCode: null,
    cashback: "+10% бонусов",
    expiresAt: "30 марта",
    url: "#",
    badge: null,
    hot: false,
  },
  {
    id: 7,
    title: "Набор настольных игр «Семейный вечер» (3 в 1)",
    description: "Alias, Дженга и Uno в одной коробке. Идеально для вечеров с детьми от 6 лет. Компактная упаковка для путешествий.",
    partner: "Мосигра",
    partnerLogo: "MI",
    category: "Детям",
    discount: "-38%",
    oldPrice: 3200,
    newPrice: 1990,
    promoCode: "GAMES38",
    cashback: null,
    expiresAt: "18 марта",
    url: "#",
    badge: "ХИТ",
    hot: true,
  },
  {
    id: 8,
    title: "Онлайн-курс рисования для детей 5-12 лет",
    description: "24 видеоурока, все материалы в комплекте. Гуашь, акварель, пастель. Сертификат по окончании. Доступ навсегда.",
    partner: "Skillbox",
    partnerLogo: "SB",
    category: "Обучение",
    discount: "-60%",
    oldPrice: 4900,
    newPrice: 1960,
    promoCode: "DRAW60",
    cashback: null,
    expiresAt: "22 марта",
    url: "#",
    badge: "Новинка",
    hot: false,
  },
];

const categories = ["Все", "Детям", "Развлечения", "Спорт", "Фото", "Обучение"];

const categoryIcons: Record<string, string> = {
  "Все": "\uD83D\uDD25",
  "Детям": "\uD83E\uDDE8",
  "Развлечения": "\uD83C\uDFAC",
  "Спорт": "\u26BD",
  "Фото": "\uD83D\uDCF8",
  "Обучение": "\uD83C\uDF93",
};

/* ===== Animations ===== */
const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

/* ===== Component ===== */
export function DealsPage() {
  const [activeCategory, setActiveCategory] = useState("Все");
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const filtered = activeCategory === "Все"
    ? deals
    : deals.filter((d) => d.category === activeCategory);

  const handleCopyPromo = (deal: Deal) => {
    if (!deal.promoCode) return;
    navigator.clipboard.writeText(deal.promoCode).catch(() => {});
    setCopiedId(deal.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const hotDeals = deals.filter((d) => d.hot);

  return (
    <div style={{ padding: "var(--space-lg)", paddingBottom: "var(--space-4xl)" }}>
      <BackButton />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: "var(--space-lg)" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-2xl)",
            fontWeight: 800,
            marginBottom: "var(--space-xs)",
            letterSpacing: "-0.3px",
          }}
        >
          Витрина предложений
        </h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.4 }}>
          Скидки и бонусы от партнёров Андерсона для участников программы лояльности
        </p>
      </motion.div>

      {/* Hot deals banner */}
      {hotDeals.length > 0 && (
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.05 }}
          style={{
            background: "linear-gradient(135deg, #c4633a 0%, #d4a843 100%)",
            borderRadius: "var(--radius-xl)",
            padding: "var(--space-lg) var(--space-xl)",
            marginBottom: "var(--space-lg)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", top: "-15px", right: "-10px", fontSize: "80px", opacity: 0.12, pointerEvents: "none", transform: "rotate(10deg)" }}>
            {"\uD83D\uDD25"}
          </div>
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ fontSize: "18px" }}>{"\uD83D\uDD25"}</span>
              <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "#fff" }}>
                Горячие предложения
              </span>
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>
              {hotDeals.length} {hotDeals.length === 1 ? "предложение" : hotDeals.length < 5 ? "предложения" : "предложений"} с лучшими скидками — успейте воспользоваться!
            </p>
          </div>
        </motion.div>
      )}

      {/* Category pills */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          gap: "8px",
          overflowX: "auto",
          scrollbarWidth: "none",
          marginBottom: "var(--space-lg)",
          padding: "2px 0",
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
                border: "none",
                fontSize: "var(--text-xs)",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                background: isActive
                  ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))"
                  : "var(--color-card)",
                color: isActive ? "#fff" : "var(--color-text-secondary)",
                boxShadow: isActive ? "0 4px 12px rgba(196,99,58,0.25)" : "var(--shadow-sm)",
                transition: "all 0.2s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: "14px" }}>{categoryIcons[cat]}</span>
              {cat}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Deal cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0 }}
          variants={{ animate: { transition: { staggerChildren: 0.05 } } }}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
        >
          {filtered.map((deal) => (
            <motion.div
              key={deal.id}
              variants={fadeUp}
              transition={{ duration: 0.35 }}
              style={{
                background: "var(--color-card)",
                borderRadius: "var(--radius-xl)",
                overflow: "hidden",
                boxShadow: deal.hot ? "0 4px 20px rgba(196,99,58,0.15)" : "var(--shadow-sm)",
                border: deal.hot ? "1px solid rgba(196,99,58,0.15)" : "1px solid transparent",
              }}
            >
              {/* Card header: partner + badge + discount */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "var(--space-md) var(--space-lg) 0",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Partner logo circle */}
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "var(--radius-md)",
                    background: "var(--color-bg-warm)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-display)",
                    flexShrink: 0,
                  }}>
                    {deal.partnerLogo}
                  </div>
                  <div>
                    <div style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--color-text-secondary)" }}>
                      {deal.partner}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>
                      до {deal.expiresAt}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {deal.badge && (
                    <span style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      background: deal.badge === "ХИТ" ? "var(--color-error-light)" : "var(--color-accent-green-light)",
                      color: deal.badge === "ХИТ" ? "var(--color-error)" : "var(--color-accent-green)",
                    }}>
                      {deal.badge}
                    </span>
                  )}
                  <span style={{
                    fontSize: "var(--text-sm)",
                    fontWeight: 800,
                    fontFamily: "var(--font-display)",
                    color: "var(--color-accent-green)",
                    background: "var(--color-accent-green-light)",
                    padding: "4px 10px",
                    borderRadius: "var(--radius-full)",
                  }}>
                    {deal.discount}
                  </span>
                </div>
              </div>

              {/* Title + description */}
              <div style={{ padding: "var(--space-md) var(--space-lg)" }}>
                <h4 style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-base)",
                  fontWeight: 700,
                  lineHeight: 1.35,
                  marginBottom: "6px",
                }}>
                  {deal.title}
                </h4>
                <p style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}>
                  {deal.description}
                </p>
              </div>

              {/* Price + action */}
              <div style={{
                padding: "0 var(--space-lg) var(--space-lg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "var(--space-md)",
              }}>
                {/* Price block */}
                <div>
                  {deal.oldPrice && (
                    <span style={{
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-tertiary)",
                      textDecoration: "line-through",
                      marginRight: "8px",
                    }}>
                      {deal.oldPrice.toLocaleString("ru-RU")} \u20BD
                    </span>
                  )}
                  {deal.newPrice && (
                    <span style={{
                      fontSize: "var(--text-xl)",
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                      color: "var(--color-text)",
                    }}>
                      {deal.newPrice.toLocaleString("ru-RU")} \u20BD
                    </span>
                  )}
                  {deal.cashback && (
                    <div style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--color-accent-gold)",
                      marginTop: "2px",
                    }}>
                      {deal.cashback}
                    </div>
                  )}
                </div>

                {/* Promo code or CTA */}
                {deal.promoCode ? (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCopyPromo(deal)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "10px 16px",
                      borderRadius: "var(--radius-lg)",
                      border: copiedId === deal.id
                        ? "2px solid var(--color-accent-green)"
                        : "2px dashed var(--color-primary)",
                      background: copiedId === deal.id
                        ? "var(--color-accent-green-light)"
                        : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      flexShrink: 0,
                    }}
                  >
                    {copiedId === deal.id ? (
                      <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--color-accent-green)" }}>
                        Скопировано!
                      </span>
                    ) : (
                      <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        <span style={{
                          fontSize: "var(--text-xs)",
                          fontWeight: 700,
                          fontFamily: "var(--font-body)",
                          color: "var(--color-primary)",
                          letterSpacing: "0.5px",
                        }}>
                          {deal.promoCode}
                        </span>
                      </>
                    )}
                  </motion.button>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "var(--radius-lg)",
                      border: "none",
                      background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                      color: "#fff",
                      fontSize: "var(--text-xs)",
                      fontWeight: 700,
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(196,99,58,0.25)",
                      flexShrink: 0,
                    }}
                  >
                    Получить
                  </motion.button>
                )}
              </div>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                textAlign: "center",
                padding: "48px 24px",
              }}
            >
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "var(--color-bg-warm)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                margin: "0 auto 16px",
              }}>
                {"\uD83D\uDD0D"}
              </div>
              <p style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-base)",
                marginBottom: "6px",
              }}>
                Пока нет предложений
              </p>
              <p style={{
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
              }}>
                В этой категории скоро появятся новые скидки
              </p>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

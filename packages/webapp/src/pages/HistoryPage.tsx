import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.js";
import { track } from "../lib/analytics.js";
import { BackButton } from "../components/BackButton.js";

type Tab = "all" | "accrual" | "redemption";

interface Transaction {
  id: string;
  type: "ACCRUAL" | "REDEMPTION" | "WELCOME_BONUS" | "BIRTHDAY_BONUS" | "EXPIRED";
  amount: number;
  bonuses: number;
  description: string | null;
  restaurant: string | null;
  expiresAt: string | null;
  createdAt: string;
}

const typeConfig: Record<string, { icon: string; label: string; isPositive: boolean }> = {
  ACCRUAL: { icon: "💰", label: "Кешбэк", isPositive: true },
  WELCOME_BONUS: { icon: "🎁", label: "Приветственный подарок", isPositive: true },
  BIRTHDAY_BONUS: { icon: "🎂", label: "Подарок на день рождения", isPositive: true },
  REDEMPTION: { icon: "🛒", label: "Списание", isPositive: false },
  EXPIRED: { icon: "⏰", label: "Сгорание бонусов", isPositive: false },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export function HistoryPage() {
  const { apiFetch, registered } = useAuth();
  const [tab, setTab] = useState<Tab>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    track("page_view", { page: "history" });
  }, []);

  useEffect(() => {
    if (!registered) return;
    setLoading(true);
    const params = tab !== "all" ? `?type=${tab}` : "";
    apiFetch(`/users/transactions${params}`)
      .then((res: any) => {
        setTransactions(res?.transactions ?? []);
      })
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [registered, tab]);

  const tabs: { key: Tab; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "accrual", label: "Начисления" },
    { key: "redemption", label: "Списания" },
  ];

  const totalEarned = transactions
    .filter((t) => typeConfig[t.type]?.isPositive)
    .reduce((sum, t) => sum + t.bonuses, 0);

  const totalSpent = transactions
    .filter((t) => !typeConfig[t.type]?.isPositive)
    .reduce((sum, t) => sum + Math.abs(t.bonuses), 0);

  return (
    <div
      style={{
        padding: "16px 16px 32px",
        minHeight: "100vh",
        background: "var(--color-bg, #faf6f1)",
        fontFamily: "var(--font-body, 'Inter', sans-serif)",
      }}
    >
      <BackButton />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ marginBottom: "20px" }}
      >
        <h2
          style={{
            marginBottom: "4px",
            fontSize: "28px",
            fontWeight: 800,
            fontFamily: "var(--font-display, 'Nunito', sans-serif)",
            color: "var(--color-text, #1a1a1a)",
            letterSpacing: "-0.3px",
          }}
        >
          История
        </h2>
        <p
          style={{
            color: "var(--color-text-secondary, #8a8a8a)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Все операции с вашими бонусами
        </p>
      </motion.div>

      {/* Summary bar */}
      {(totalEarned > 0 || totalSpent > 0) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "var(--color-card, #ffffff)",
              borderRadius: "var(--radius-xl, 20px)",
              padding: "16px",
              boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary, #8a8a8a)", fontWeight: 500 }}>
              Получено
            </span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                color: "var(--color-success, #2d8a5e)",
              }}
            >
              +{totalEarned}
            </span>
          </div>
          <div
            style={{
              flex: 1,
              background: "var(--color-card, #ffffff)",
              borderRadius: "var(--radius-xl, 20px)",
              padding: "16px",
              boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "12px", color: "var(--color-text-secondary, #8a8a8a)", fontWeight: 500 }}>
              Потрачено
            </span>
            <span
              style={{
                fontSize: "22px",
                fontWeight: 800,
                fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                color: totalSpent > 0 ? "var(--color-error, #c0392b)" : "var(--color-text-secondary, #8a8a8a)",
              }}
            >
              {totalSpent > 0 ? `-${totalSpent}` : "0"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Pill-shaped segmented control */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        style={{
          display: "flex",
          background: "#eee8e0",
          borderRadius: "16px",
          padding: "4px",
          marginBottom: "24px",
          position: "relative",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "10px 0",
              border: "none",
              background: "transparent",
              fontSize: "14px",
              fontWeight: 600,
              fontFamily: "var(--font-body, 'Inter', sans-serif)",
              cursor: "pointer",
              position: "relative",
              zIndex: 2,
              color: tab === t.key ? "#ffffff" : "var(--color-text-secondary, #8a8a8a)",
              transition: "color 0.25s ease",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {t.label}
            {tab === t.key && (
              <motion.div
                layoutId="tab-highlight"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--color-primary, #c4633a)",
                  borderRadius: "12px",
                  zIndex: -1,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </motion.div>

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              width: 32, height: 32, margin: "0 auto 12px",
              border: "3px solid #eee8e0",
              borderTopColor: "var(--color-primary, #c4633a)",
              borderRadius: "50%",
            }}
          />
          <p style={{ color: "var(--color-text-secondary)", fontSize: "14px" }}>Загружаем историю...</p>
        </div>
      )}

      {/* Transaction cards */}
      {!loading && (
        <AnimatePresence mode="wait">
          {transactions.length > 0 ? (
            <motion.div
              key={tab}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={{
                animate: { transition: { staggerChildren: 0.06 } },
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {transactions.map((tx) => {
                const config = typeConfig[tx.type] ?? { icon: "📋", label: tx.type, isPositive: true };
                const accentColor = config.isPositive
                  ? "var(--color-success, #2d8a5e)"
                  : "var(--color-error, #c0392b)";
                const accentBgTint = config.isPositive
                  ? "rgba(45, 138, 94, 0.06)"
                  : "rgba(192, 57, 43, 0.06)";

                const isExpiringSoon = tx.expiresAt && config.isPositive &&
                  new Date(tx.expiresAt).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000 &&
                  new Date(tx.expiresAt).getTime() > Date.now();

                return (
                  <motion.div
                    key={tx.id}
                    variants={fadeInUp}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      background: `linear-gradient(135deg, var(--color-card, #ffffff) 0%, ${accentBgTint} 100%)`,
                      borderRadius: "var(--radius-xl, 20px)",
                      boxShadow: "var(--shadow-md, 0 4px 12px rgba(0,0,0,0.08))",
                      display: "flex",
                      alignItems: "stretch",
                      overflow: "hidden",
                    }}
                  >
                    {/* Left accent bar */}
                    <div
                      style={{
                        width: "5px",
                        flexShrink: 0,
                        background: accentColor,
                        borderRadius: "5px 0 0 5px",
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "18px 16px 18px 14px",
                      }}
                    >
                      {/* Icon circle */}
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "50%",
                          background: config.isPositive
                            ? "rgba(45, 138, 94, 0.12)"
                            : "rgba(192, 57, 43, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "22px",
                          flexShrink: 0,
                        }}
                      >
                        {config.icon}
                      </div>

                      {/* Text block */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: "15px",
                            color: "var(--color-text, #1a1a1a)",
                            fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                            marginBottom: "3px",
                          }}
                        >
                          {tx.description || config.label}
                        </div>
                        {tx.restaurant && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--color-text-secondary, #8a8a8a)",
                              lineHeight: 1.3,
                              marginBottom: "2px",
                            }}
                          >
                            {tx.restaurant}
                          </div>
                        )}
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--color-text-secondary, #b0a89e)",
                            fontWeight: 500,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          {formatDate(tx.createdAt)}
                          {isExpiringSoon && (
                            <span style={{
                              fontSize: "10px",
                              color: "var(--color-error, #c0392b)",
                              fontWeight: 600,
                            }}>
                              сгорят {formatDateShort(tx.expiresAt!)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "20px",
                          fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                          color: accentColor,
                          flexShrink: 0,
                          letterSpacing: "-0.5px",
                        }}
                      >
                        {config.isPositive ? `+${tx.bonuses}` : `-${Math.abs(tx.bonuses)}`}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            /* Empty state */
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fce8df 0%, #f5ddd0 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "44px",
                  marginBottom: "20px",
                  boxShadow: "0 8px 24px rgba(196, 99, 58, 0.15)",
                }}
              >
                {"\uD83C\uDF82"}
              </div>
              <p
                style={{
                  fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                  fontWeight: 700,
                  fontSize: "17px",
                  color: "var(--color-text, #1a1a1a)",
                  marginBottom: "6px",
                }}
              >
                {tab === "redemption" ? "Ещё не списывали бонусы" : "Пока пусто"}
              </p>
              <p
                style={{
                  color: "var(--color-text-secondary, #8a8a8a)",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  maxWidth: "260px",
                  margin: 0,
                }}
              >
                {tab === "redemption"
                  ? "Покажите QR-код официанту — спишите бонусы при оплате"
                  : "Посетите Андерсон — и здесь появятся новые записи"}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

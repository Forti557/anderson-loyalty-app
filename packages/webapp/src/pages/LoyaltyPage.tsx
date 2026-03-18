import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.js";
import { LOYALTY_LEVELS } from "@anderson/shared";
import { motion } from "framer-motion";
import { QrCodeCard } from "../components/QrCodeCard.js";

interface UserData {
  firstName: string;
  level: number;
  levelName: string;
  cashbackPercent: number;
  bonusBalance: number;
  totalSpent: number;
  nextLevelThreshold: number | null;
  stampsCollected?: number;
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

/* Decorative star for hero background */
function Star({ size, top, left, opacity }: { size: number; top: string; left: string; opacity: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ position: "absolute", top, left, opacity, pointerEvents: "none" }}
    >
      <path
        d="M12 2l2.09 6.26L20.18 9.27l-5.09 3.9L16.18 19.27 12 15.77l-4.18 3.5 1.09-6.1-5.09-3.9 6.09-1.01z"
        fill="rgba(255,255,255,0.15)"
      />
    </svg>
  );
}

export function LoyaltyPage() {
  const { apiFetch, registered } = useAuth();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (registered) {
      apiFetch("/users/profile").then(setUser).catch(() => {});
    }
  }, [registered]);

  const currentLevel = user
    ? LOYALTY_LEVELS.find((l) => l.level === user.level) ?? LOYALTY_LEVELS[0]
    : LOYALTY_LEVELS[0];
  const nextLevel = user ? LOYALTY_LEVELS.find((l) => l.level === user.level + 1) : LOYALTY_LEVELS[1];
  const progress = user && nextLevel ? Math.min(100, (user.totalSpent / nextLevel.threshold) * 100) : 0;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      style={{ padding: "16px", paddingBottom: "32px" }}
    >
      {/* ── Hero Card ── */}
      <motion.div
        variants={fadeUp}
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(145deg, #8b3a1f, var(--color-primary))",
          borderRadius: "var(--radius-2xl)",
          padding: "28px 24px 24px",
          marginBottom: "16px",
          boxShadow: "var(--shadow-lg), 0 8px 32px rgba(196,99,58,0.3)",
          color: "#fff",
        }}
      >
        {/* Decorative stars */}
        <Star size={20} top="12px" left="85%" opacity={0.5} />
        <Star size={14} top="60px" left="92%" opacity={0.35} />
        <Star size={18} top="30%" left="5%" opacity={0.25} />
        <Star size={12} top="70%" left="15%" opacity={0.4} />
        <Star size={16} top="80%" left="88%" opacity={0.3} />
        <Star size={10} top="15%" left="45%" opacity={0.2} />
        <Star size={22} top="55%" left="75%" opacity={0.18} />

        {/* Level pill */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "5px 14px",
            background: "rgba(255,255,255,0.2)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 600,
            marginBottom: "20px",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {currentLevel.nameRu} — кешбэк {currentLevel.cashback}%
        </div>

        {/* Balance */}
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "42px",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "4px",
            letterSpacing: "-0.5px",
          }}
        >
          {user?.bonusBalance?.toLocaleString("ru-RU") ?? "0"}
        </div>
        <div
          style={{
            fontSize: "15px",
            fontWeight: 500,
            opacity: 0.75,
            marginBottom: "24px",
          }}
        >
          бонусов на счёте
        </div>

        {/* QR Code — real, auto-refreshing */}
        <QrCodeCard compact />
      </motion.div>

      {/* ── Progress to next level ── */}
      {nextLevel && (
        <motion.div
          variants={fadeUp}
          style={{
            background: "var(--color-card)",
            borderRadius: "var(--radius-xl)",
            padding: "20px",
            marginBottom: "16px",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontWeight: 700, fontSize: "15px", fontFamily: "var(--font-display)" }}>
              До уровня «{nextLevel.nameRu}»
            </div>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--color-accent-green)",
              }}
            >
              {Math.round(progress)}%
            </div>
          </div>

          {/* Progress bar */}
          <div
            style={{
              background: "#f0ebe5",
              borderRadius: "10px",
              height: "10px",
              overflow: "hidden",
              marginBottom: "10px",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              style={{
                height: "100%",
                background: "linear-gradient(90deg, var(--color-primary), var(--color-accent-gold))",
                borderRadius: "10px",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "12px",
              color: "var(--color-text-secondary)",
            }}
          >
            <span>{(user?.totalSpent || 0).toLocaleString("ru-RU")} ₽</span>
            <span>{nextLevel.threshold.toLocaleString("ru-RU")} ₽</span>
          </div>
        </motion.div>
      )}

      {/* ── Quick Links ── */}
      <motion.div
        variants={fadeUp}
        style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
      >
        {/* Stamps link */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
          <Link
            to="/stamps"
            style={{
              display: "block",
              textDecoration: "none",
              color: "var(--color-text)",
              background: "linear-gradient(135deg, #fdf5ef, #fde8d8)",
              borderRadius: "var(--radius-xl)",
              padding: "20px 16px",
              textAlign: "center",
              boxShadow: "var(--shadow-md)",
              border: "1px solid rgba(196,99,58,0.08)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                margin: "0 auto 10px",
                background: "linear-gradient(135deg, var(--color-primary), #d4773f)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: "2px" }}>
              Штамп-карта
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>{user?.stampsCollected ?? 0} / 10</div>
          </Link>
        </motion.div>

        {/* History link */}
        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ flex: 1 }}>
          <Link
            to="/history"
            style={{
              display: "block",
              textDecoration: "none",
              color: "var(--color-text)",
              background: "linear-gradient(135deg, #f0f7f3, #dff0e6)",
              borderRadius: "var(--radius-xl)",
              padding: "20px 16px",
              textAlign: "center",
              boxShadow: "var(--shadow-md)",
              border: "1px solid rgba(61,122,95,0.08)",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                margin: "0 auto 10px",
                background: "linear-gradient(135deg, var(--color-accent-green), #4d9a73)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 700, fontFamily: "var(--font-display)", marginBottom: "2px" }}>
              История
            </div>
            <div style={{ fontSize: "12px", color: "var(--color-text-secondary)" }}>Операции</div>
          </Link>
        </motion.div>
      </motion.div>

      {/* ── Levels Table ── */}
      <motion.div
        variants={fadeUp}
        style={{
          background: "var(--color-card)",
          borderRadius: "var(--radius-xl)",
          padding: "20px",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          style={{
            fontWeight: 700,
            fontSize: "16px",
            fontFamily: "var(--font-display)",
            marginBottom: "16px",
          }}
        >
          Уровни программы
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {LOYALTY_LEVELS.map((level, i) => {
            const active = level.level === (user?.level || 1);
            return (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, delay: 0.5 + i * 0.07 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderRadius: "14px",
                  background: active
                    ? "linear-gradient(90deg, rgba(196,99,58,0.08), rgba(212,168,67,0.06))"
                    : "transparent",
                  borderLeft: active ? "3px solid var(--color-primary)" : "3px solid transparent",
                  boxShadow: active ? "0 0 16px rgba(196,99,58,0.1)" : "none",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: active ? "var(--color-primary)" : "#d4cfc8",
                      boxShadow: active ? "0 0 8px rgba(196,99,58,0.4)" : "none",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontWeight: active ? 700 : 400,
                      fontSize: "14px",
                      color: active ? "var(--color-primary-dark, var(--color-primary))" : "var(--color-text)",
                    }}
                  >
                    {level.nameRu}
                  </span>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: "14px",
                    color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                    background: active ? "rgba(196,99,58,0.1)" : "transparent",
                    padding: active ? "3px 10px" : "3px 0",
                    borderRadius: "8px",
                  }}
                >
                  {level.cashback}%
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

import { useEffect, useState } from "react";
import { STAMPS_PER_CARD } from "@anderson/shared";
import { useAuth } from "../context/AuthContext.js";
import { BackButton } from "../components/BackButton.js";
import { track } from "../lib/analytics.js";
import { motion } from "framer-motion";

export function StampsPage() {
  const { apiFetch, registered } = useAuth();
  const [collected, setCollected] = useState(0);

  useEffect(() => {
    track("stamp_card_view");
    if (registered) {
      apiFetch("/users/profile").then((p: any) => {
        setCollected(p?.stampsCollected ?? 0);
      }).catch(() => {});
    }
  }, [registered]);
  const remaining = STAMPS_PER_CARD - collected;
  const progress = collected / STAMPS_PER_CARD;

  // Arc progress calculations
  const arcRadius = 40;
  const arcCircumference = 2 * Math.PI * arcRadius;
  const arcOffset = arcCircumference * (1 - progress);

  // Decorative sparkle positions for filled stamps
  const sparkles = [
    { top: "-4px", right: "-2px", size: 8 },
    { top: "2px", left: "-4px", size: 6 },
    { bottom: "-2px", right: "4px", size: 5 },
  ];

  return (
    <div
      style={{
        padding: "20px 16px 32px",
        minHeight: "100vh",
        background: "var(--color-bg, #faf6f1)",
        fontFamily: "var(--font-body, 'Inter', sans-serif)",
      }}
    >
      <BackButton />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ textAlign: "center", marginBottom: "28px", marginTop: "8px" }}
      >
        <div style={{ fontSize: "36px", marginBottom: "4px" }}>🎟️</div>
        <h2
          style={{
            fontFamily: "var(--font-display, 'Nunito', sans-serif)",
            fontSize: "26px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #c4633a, #d4a843)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "0 0 6px",
          }}
        >
          Штамп-карта
        </h2>
        <p
          style={{
            color: "var(--color-text-secondary, #8a8175)",
            fontSize: "14px",
            margin: 0,
          }}
        >
          Каждый визит — шаг к вашему подарку!
        </p>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "28px",
        }}
      >
        <div style={{ position: "relative", width: "100px", height: "100px" }}>
          <svg
            viewBox="0 0 100 100"
            style={{
              transform: "rotate(-90deg)",
              width: "100%",
              height: "100%",
            }}
          >
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r={arcRadius}
              fill="none"
              stroke="#ece5dc"
              strokeWidth="7"
              strokeLinecap="round"
            />
            {/* Progress arc */}
            <motion.circle
              cx="50"
              cy="50"
              r={arcRadius}
              fill="none"
              stroke="url(#progressGradient)"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={arcCircumference}
              initial={{ strokeDashoffset: arcCircumference }}
              animate={{ strokeDashoffset: arcOffset }}
              transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
            />
            <defs>
              <linearGradient
                id="progressGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#c4633a" />
                <stop offset="100%" stopColor="#d4a843" />
              </linearGradient>
            </defs>
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                fontSize: "24px",
                fontWeight: 800,
                color: "#c4633a",
                lineHeight: 1,
              }}
            >
              {collected}/{STAMPS_PER_CARD}
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "var(--color-text-secondary, #8a8175)",
                marginTop: "2px",
              }}
            >
              визитов
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stamp grid 5x2 */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: "12px",
          marginBottom: "24px",
          padding: "0 4px",
        }}
      >
        {Array.from({ length: STAMPS_PER_CARD }).map((_, i) => {
          const isFilled = i < collected;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3 + i * 0.07,
              }}
              whileInView={
                isFilled
                  ? {
                      scale: [1, 1.1, 1],
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 10,
                        delay: i * 0.05,
                      },
                    }
                  : undefined
              }
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "50%",
                border: isFilled
                  ? "none"
                  : "2px dashed rgba(196, 99, 58, 0.25)",
                background: isFilled
                  ? "linear-gradient(145deg, #d4a843, #c4633a)"
                  : "var(--color-card, #ffffff)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isFilled
                  ? "0 4px 16px rgba(212, 168, 67, 0.35), 0 0 20px rgba(212, 168, 67, 0.15)"
                  : "0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              {isFilled ? (
                <>
                  <span style={{ fontSize: "20px", color: "#fff" }}>★</span>
                  {/* Decorative sparkles */}
                  {sparkles.map((s, si) => (
                    <motion.div
                      key={si}
                      animate={{
                        opacity: [0.4, 1, 0.4],
                        scale: [0.8, 1.2, 0.8],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: si * 0.6 + i * 0.2,
                      }}
                      style={{
                        position: "absolute",
                        top: s.top,
                        right: s.right,
                        left: s.left,
                        bottom: s.bottom,
                        width: `${s.size}px`,
                        height: `${s.size}px`,
                        borderRadius: "50%",
                        background: "#d4a843",
                        pointerEvents: "none",
                      }}
                    />
                  ))}
                </>
              ) : (
                <span
                  style={{
                    fontFamily: "var(--font-display, 'Nunito', sans-serif)",
                    fontSize: "15px",
                    fontWeight: 700,
                    color: "rgba(196, 99, 58, 0.3)",
                  }}
                >
                  {i + 1}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Gift reward card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        style={{
          background: "linear-gradient(135deg, #d4a843 0%, #c4633a 100%)",
          borderRadius: "var(--radius-2xl, 24px)",
          padding: "24px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative background circles */}
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-10px",
            left: "-10px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "30%",
            right: "15%",
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "25%",
            left: "20%",
            width: "4px",
            height: "4px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎁</div>
          <p
            style={{
              fontFamily: "var(--font-display, 'Nunito', sans-serif)",
              fontSize: "18px",
              fontWeight: 800,
              color: "#fff",
              margin: "0 0 6px",
              lineHeight: 1.3,
            }}
          >
            {remaining === STAMPS_PER_CARD
              ? "Впереди — подарок от Андерсона!"
              : remaining === 0
                ? "Поздравляем! Подарок ваш! 🎉"
                : `Ещё ${remaining} ${remaining === 1 ? "визит" : remaining < 5 ? "визита" : "визитов"} до подарка!`}
          </p>
          <p
            style={{
              fontSize: "13px",
              color: "rgba(255,255,255,0.85)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Десерт на выбор или скидка 15% на организацию праздника
          </p>
        </div>
      </motion.div>
    </div>
  );
}

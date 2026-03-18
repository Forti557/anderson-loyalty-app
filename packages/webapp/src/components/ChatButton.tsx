import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { track } from "../lib/analytics.js";

const TG_MANAGER = "https://t.me/anderson_manager";

export function ChatButton() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Hide on onboarding
  if (location.pathname.startsWith("/onboarding")) return null;

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 199,
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(2px)", WebkitBackdropFilter: "blur(2px)",
            }}
          />
        )}
      </AnimatePresence>

      {/* Chat popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              position: "fixed",
              bottom: "calc(var(--safe-bottom, 20px) + 80px)",
              right: 16,
              zIndex: 201,
              width: "calc(100% - 32px)",
              maxWidth: 320,
              background: "var(--color-card, #fff)",
              borderRadius: 24,
              boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div style={{
              background: "linear-gradient(135deg, #192d14, #1e3a18)",
              padding: "20px 20px 16px",
              color: "#fff",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 22,
                }}>
                  A
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--font-display)" }}>
                    Андерсон
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    Обычно отвечаем за 5 минут
                  </div>
                </div>
              </div>
            </div>

            {/* Message bubble */}
            <div style={{ padding: "16px 20px 20px" }}>
              <div style={{
                background: "var(--color-bg-warm, #faf6f1)",
                borderRadius: "4px 16px 16px 16px",
                padding: "12px 14px",
                fontSize: 14,
                lineHeight: 1.5,
                color: "var(--color-text)",
                marginBottom: 16,
              }}>
                Здравствуйте! Чем можем помочь? Напишите нам — ответим в Telegram.
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {[
                  { text: "Забронировать столик", msg: "Здравствуйте! Хочу забронировать столик." },
                  { text: "Заказать торт", msg: "Здравствуйте! Хочу заказать торт." },
                  { text: "Узнать про праздник", msg: "Здравствуйте! Интересует организация праздника." },
                ].map((q) => (
                  <motion.a
                    key={q.text}
                    href={`${TG_MANAGER}?text=${encodeURIComponent(q.msg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      track("chat_quick_action", { action: q.text });
                      setOpen(false);
                    }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: "block",
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid var(--color-border-light, #eee8e0)",
                      background: "transparent",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "var(--color-text)",
                      textDecoration: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    {q.text}
                  </motion.a>
                ))}
              </div>

              {/* Main CTA */}
              <motion.a
                href={`${TG_MANAGER}?text=${encodeURIComponent("Здравствуйте!")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  track("chat_open_telegram");
                  setOpen(false);
                }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  width: "100%",
                  padding: 14,
                  background: "#2AABEE",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(42,171,238,0.3)",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Написать в Telegram
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        onClick={() => {
          setOpen(!open);
          if (!open) track("chat_button_click");
        }}
        whileTap={{ scale: 0.9 }}
        animate={open ? { rotate: 0 } : { rotate: 0 }}
        style={{
          position: "fixed",
          bottom: "calc(var(--safe-bottom, 20px) + 74px)",
          right: 16,
          zIndex: 200,
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "none",
          background: open
            ? "var(--color-text, #1b2540)"
            : "linear-gradient(135deg, #192d14, #1e3a18)",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(25,45,20,0.35)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
      </motion.button>
    </>
  );
}

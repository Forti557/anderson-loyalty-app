import { useState, useEffect, useCallback, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.js";
import { QR_TTL_SECONDS } from "@anderson/shared";

interface QrData {
  token: string;
  signature: string;
  expiresAt: string;
  ttl: number;
}

export function QrCodeCard({ compact = false }: { compact?: boolean }) {
  const { apiFetch, registered } = useAuth();
  const [qr, setQr] = useState<QrData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(QR_TTL_SECONDS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const refreshRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const generateQr = useCallback(async () => {
    if (!registered) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch("/qr/generate", { method: "POST" });
      setQr(data);
      setSecondsLeft(data.ttl || QR_TTL_SECONDS);
    } catch (err: any) {
      setError("Не удалось загрузить QR-код");
      console.error("QR generate error:", err);
    } finally {
      setLoading(false);
    }
  }, [apiFetch, registered]);

  // Generate on mount
  useEffect(() => {
    generateQr();
  }, [generateQr]);

  // Countdown timer
  useEffect(() => {
    if (!qr) return;

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [qr]);

  // Auto-refresh when expired
  useEffect(() => {
    if (secondsLeft === 0 && qr) {
      refreshRef.current = setTimeout(() => {
        generateQr();
      }, 300);
      return () => clearTimeout(refreshRef.current);
    }
  }, [secondsLeft, qr, generateQr]);

  const progress = qr ? secondsLeft / (qr.ttl || QR_TTL_SECONDS) : 1;
  const qrValue = qr ? `anderson://loyalty/${qr.token}` : "";

  if (compact) {
    return (
      <motion.div
        whileTap={{ scale: 0.95 }}
        onClick={generateQr}
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.15)",
          padding: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loading || !qr ? (
          <div style={{
            width: 56, height: 56,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: "2px solid rgba(221,198,105,0.3)",
                borderTopColor: "#ddc669",
              }}
            />
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <QRCodeSVG
              value={qrValue}
              size={56}
              bgColor="transparent"
              fgColor="#ffffff"
              level="M"
            />
            {/* Timer ring */}
            <svg
              width="64" height="64"
              viewBox="0 0 64 64"
              style={{ position: "absolute", top: -4, left: -4 }}
            >
              <circle
                cx="32" cy="32" r="30"
                fill="none" stroke="rgba(221,198,105,0.2)"
                strokeWidth="2"
              />
              <motion.circle
                cx="32" cy="32" r="30"
                fill="none" stroke="#ddc669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 30}
                strokeDashoffset={2 * Math.PI * 30 * (1 - progress)}
                style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
              />
            </svg>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{
        background: "var(--color-card, #ffffff)",
        borderRadius: 24,
        padding: "28px 24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
      }}
    >
      {/* QR Code */}
      <div style={{ position: "relative" }}>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                width: 200, height: 200,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: "3px solid #f0ebe5",
                  borderTopColor: "var(--color-primary, #c4633a)",
                }}
              />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={generateQr}
              style={{
                width: 200, height: 200,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 8, cursor: "pointer",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary, #8a8a8a)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span style={{
                fontSize: 13, color: "var(--color-text-secondary, #8a8a8a)",
                fontWeight: 500,
              }}>
                Нажмите для обновления
              </span>
            </motion.div>
          ) : qr ? (
            <motion.div
              key={qr.token}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <QRCodeSVG
                value={qrValue}
                size={200}
                bgColor="transparent"
                fgColor="var(--color-text, #1a1a1a)"
                level="M"
                imageSettings={{
                  src: "",
                  x: undefined,
                  y: undefined,
                  height: 0,
                  width: 0,
                  excavate: false,
                }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Circular progress ring */}
        {qr && !loading && !error && (
          <svg
            width="220" height="220"
            viewBox="0 0 220 220"
            style={{ position: "absolute", top: -10, left: -10, pointerEvents: "none" }}
          >
            <circle
              cx="110" cy="110" r="106"
              fill="none" stroke="#f0ebe5"
              strokeWidth="3"
            />
            <motion.circle
              cx="110" cy="110" r="106"
              fill="none"
              stroke={secondsLeft <= 10 ? "#e74c3c" : "var(--color-primary, #c4633a)"}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 106}
              animate={{ strokeDashoffset: 2 * Math.PI * 106 * (1 - progress) }}
              transition={{ duration: 0.5, ease: "linear" }}
              style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
            />
          </svg>
        )}
      </div>

      {/* Timer text */}
      {qr && !loading && !error && (
        <motion.div
          animate={{ color: secondsLeft <= 10 ? "#e74c3c" : "var(--color-text-secondary, #8a8a8a)" }}
          style={{
            fontSize: 13, fontWeight: 600,
            fontFamily: "var(--font-body, 'Inter', sans-serif)",
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Обновится через {secondsLeft} сек
        </motion.div>
      )}

      {/* Instruction */}
      <div style={{
        textAlign: "center",
        fontSize: 13,
        color: "var(--color-text-secondary, #8a8a8a)",
        lineHeight: 1.5,
        maxWidth: 260,
      }}>
        Покажите QR-код официанту для начисления бонусов
      </div>
    </motion.div>
  );
}

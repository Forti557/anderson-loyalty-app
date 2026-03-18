import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.js";

type Step = "phone" | "otp";

interface LoginPageProps {
  onNeedRegistration: (tempToken: string, phone: string) => void;
}

export function LoginPage({ onNeedRegistration }: LoginPageProps) {
  const { sendOtp, verifyOtp } = useAuth();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await sendOtp(phone);
      setStep("otp");
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits filled
    if (digit && index === 5) {
      const code = [...newOtp.slice(0, 5), digit].join("");
      if (code.length === 6) handleVerifyOtp(code);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const finalCode = code || otp.join("");
    if (finalCode.length < 6) return;

    setError("");
    setLoading(true);
    try {
      const result = await verifyOtp(phone, finalCode);
      if (!result.registered && result.tempToken && result.phone) {
        onNeedRegistration(result.tempToken, result.phone);
      }
      // If registered — AuthContext already updated state, app will re-render
    } catch (err: any) {
      setError(err.message || "Неверный код");
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    try {
      await sendOtp(phone);
      setResendTimer(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Не удалось отправить код");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-2xl)",
      }}
    >
      {/* Logo / Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: "var(--space-4xl)" }}
      >
        <div style={{ fontSize: "56px", marginBottom: "var(--space-md)" }}>🧁</div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "var(--text-2xl)",
            color: "var(--color-text)",
            letterSpacing: "-0.02em",
          }}
        >
          Андерсон
        </div>
        <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", marginTop: "4px" }}>
          Программа лояльности
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step === "phone" ? (
          <motion.div
            key="phone"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", maxWidth: "360px" }}
          >
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-xl)",
                color: "var(--color-text)",
                marginBottom: "var(--space-sm)",
                textAlign: "center",
              }}
            >
              Войти или зарегистрироваться
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                marginBottom: "var(--space-3xl)",
                lineHeight: 1.5,
              }}
            >
              Введите номер телефона — пришлём код подтверждения
            </p>

            <form onSubmit={handleSendOtp} style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
              <input
                type="tel"
                inputMode="tel"
                placeholder="+7 (900) 123-45-67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                autoFocus
                style={{
                  width: "100%",
                  padding: "16px var(--space-xl)",
                  border: "2px solid var(--color-border)",
                  borderRadius: "var(--radius-xl)",
                  fontSize: "var(--text-lg)",
                  fontFamily: "var(--font-body)",
                  color: "var(--color-text)",
                  background: "var(--color-card)",
                  outline: "none",
                  textAlign: "center",
                  letterSpacing: "0.05em",
                  transition: "border-color 0.2s ease",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: "var(--color-error-light)",
                      border: "1px solid rgba(192,57,43,0.15)",
                      borderRadius: "var(--radius-lg)",
                      padding: "var(--space-md) var(--space-lg)",
                      fontSize: "var(--text-sm)",
                      color: "var(--color-error)",
                      textAlign: "center",
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
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
                  boxShadow: "var(--shadow-glow), var(--shadow-md)",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Отправляем..." : "Получить код"}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: "100%", maxWidth: "360px" }}
          >
            <button
              onClick={() => { setStep("phone"); setError(""); setOtp(["", "", "", "", "", ""]); }}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-text-secondary)",
                fontSize: "var(--text-sm)",
                cursor: "pointer",
                marginBottom: "var(--space-2xl)",
                padding: 0,
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              ← Изменить номер
            </button>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "var(--text-xl)",
                color: "var(--color-text)",
                marginBottom: "var(--space-sm)",
                textAlign: "center",
              }}
            >
              Код из SMS
            </h2>
            <p
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--color-text-secondary)",
                textAlign: "center",
                marginBottom: "var(--space-3xl)",
                lineHeight: 1.5,
              }}
            >
              Отправили код на {phone}
            </p>

            {/* OTP input boxes */}
            <div style={{ display: "flex", gap: "var(--space-md)", justifyContent: "center", marginBottom: "var(--space-2xl)" }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { otpRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpInput(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={{
                    width: "48px",
                    height: "56px",
                    border: `2px solid ${digit ? "var(--color-primary)" : "var(--color-border)"}`,
                    borderRadius: "var(--radius-lg)",
                    fontSize: "var(--text-2xl)",
                    fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    color: "var(--color-text)",
                    background: "var(--color-card)",
                    textAlign: "center",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--color-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = digit ? "var(--color-primary)" : "var(--color-border)")}
                />
              ))}
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    background: "var(--color-error-light)",
                    border: "1px solid rgba(192,57,43,0.15)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--space-md) var(--space-lg)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-error)",
                    textAlign: "center",
                    marginBottom: "var(--space-lg)",
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => handleVerifyOtp()}
              disabled={loading || otp.join("").length < 6}
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
                boxShadow: "var(--shadow-glow), var(--shadow-md)",
                cursor: loading || otp.join("").length < 6 ? "not-allowed" : "pointer",
                opacity: loading || otp.join("").length < 6 ? 0.6 : 1,
                marginBottom: "var(--space-lg)",
              }}
            >
              {loading ? "Проверяем..." : "Войти"}
            </motion.button>

            <button
              onClick={handleResend}
              disabled={resendTimer > 0}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                fontSize: "var(--text-sm)",
                color: resendTimer > 0 ? "var(--color-text-tertiary)" : "var(--color-primary)",
                cursor: resendTimer > 0 ? "default" : "pointer",
                padding: "var(--space-md)",
              }}
            >
              {resendTimer > 0 ? `Отправить повторно через ${resendTimer} сек.` : "Отправить код повторно"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

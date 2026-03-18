import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/BackButton.js";
import { track } from "../lib/analytics.js";

const TG_MANAGER = "https://t.me/anderson_manager";
const PHONE = "+74952219363";

interface Cake {
  id: number;
  name: string;
  weight: string;
  price: number;
  servings: string;
  tag: string | null;
  accent: string;
  desc: string;
  ingredients: string;
}

const cakes: Cake[] = [
  { id: 1, name: "Наполеон классический", weight: "1.5 кг", price: 3200, servings: "8–10 порций", tag: "Хит", accent: "#ddc669", desc: "Хрустящие слои с нежным заварным кремом", ingredients: "Слоёное тесто, заварной крем, ваниль" },
  { id: 2, name: "Шоколадный трюфель", weight: "1.2 кг", price: 3500, servings: "6–8 порций", tag: "Новинка", accent: "#a64833", desc: "Насыщенный шоколадный вкус с ганашем", ingredients: "Бельгийский шоколад, сливки, какао" },
  { id: 3, name: "Морковный с кремом", weight: "1.5 кг", price: 2800, servings: "8–10 порций", tag: null, accent: "#3d7a5f", desc: "Влажный бисквит с крем-чизом", ingredients: "Морковь, грецкий орех, крем-чиз, корица" },
  { id: 4, name: "Клубничный чизкейк", weight: "1.2 кг", price: 3000, servings: "6–8 порций", tag: "Хит", accent: "#c45a7a", desc: "Классический NY чизкейк с клубникой", ingredients: "Сливочный сыр, клубника, песочная основа" },
  { id: 5, name: "Детский «Единорог»", weight: "2 кг", price: 5500, servings: "12–15 порций", tag: "Для детей", accent: "#345482", desc: "Яркий торт для маленького именинника", ingredients: "Ванильный бисквит, сливочный крем, мастика" },
  { id: 6, name: "Медовик фирменный", weight: "1.5 кг", price: 2900, servings: "8–10 порций", tag: null, accent: "#ddc669", desc: "Тающие медовые коржи со сметанным кремом", ingredients: "Мёд, сметанный крем, карамельная прослойка" },
  { id: 7, name: "Фисташковый", weight: "1.5 кг", price: 4200, servings: "8–10 порций", tag: "Новинка", accent: "#3d7a5f", desc: "Нежный бисквит с фисташковым муссом", ingredients: "Фисташковая паста, малина, мусс" },
  { id: 8, name: "Манго-Маракуйя", weight: "1.2 кг", price: 3800, servings: "6–8 порций", tag: null, accent: "#ddc669", desc: "Тропический торт с экзотическими фруктами", ingredients: "Манго, маракуйя, кокосовый мусс" },
];

const tagStyles: Record<string, { bg: string; color: string }> = {
  "Хит": { bg: "rgba(221,198,105,0.15)", color: "#a07c2e" },
  "Новинка": { bg: "rgba(61,122,95,0.12)", color: "#3d7a5f" },
  "Для детей": { bg: "rgba(52,84,130,0.12)", color: "#345482" },
};

export function CakesPage() {
  const [selectedCake, setSelectedCake] = useState<Cake | null>(null);
  const [inscription, setInscription] = useState("");
  const [date, setDate] = useState("");

  const buildTelegramMessage = (cake: Cake) => {
    const parts = [
      `Здравствуйте! Хочу заказать торт в Андерсоне.`,
      ``,
      `Торт: ${cake.name} (${cake.weight})`,
      `Цена: ${cake.price.toLocaleString("ru-RU")} ₽`,
      inscription ? `Надпись: ${inscription}` : null,
      date ? `К дате: ${date}` : null,
    ].filter(Boolean).join("\n");
    return `${TG_MANAGER}?text=${encodeURIComponent(parts)}`;
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
          Торты на заказ
        </h2>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginBottom: 20, lineHeight: 1.4 }}>
          Домашние торты от кондитеров Андерсона — с доставкой или самовывозом
        </p>
      </motion.div>

      {/* Personalization banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          background: "linear-gradient(135deg, rgba(221,198,105,0.12), rgba(221,198,105,0.04))",
          borderRadius: 20, padding: "16px 20px", marginBottom: 20,
          border: "1px solid rgba(221,198,105,0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#a07c2e" }}>Персонализация</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 }}>
          Любой торт можно дополнить надписью, фигурками и оформить в нужной тематике. Уточните у координатора!
        </p>
      </motion.div>

      {/* Cakes grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cakes.map((cake, i) => (
          <motion.div
            key={cake.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.4 }}
            onClick={() => { setSelectedCake(cake); track("cake_select", { cake: cake.name }); }}
            style={{
              background: "var(--color-card)",
              borderRadius: 20, padding: 16,
              boxShadow: "var(--shadow-sm, 0 2px 8px rgba(0,0,0,0.04))",
              borderLeft: `4px solid ${cake.accent}`,
              cursor: "pointer",
              transition: "transform 0.15s",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "var(--font-display)" }}>{cake.name}</span>
                  {cake.tag && (
                    <span style={{
                      fontSize: 11, fontWeight: 600,
                      background: tagStyles[cake.tag]?.bg || "rgba(0,0,0,0.06)",
                      color: tagStyles[cake.tag]?.color || "var(--color-text-secondary)",
                      padding: "2px 8px", borderRadius: 20,
                    }}>
                      {cake.tag}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>
                  {cake.desc}
                </div>
                <div style={{ fontSize: 11, color: "var(--color-text-tertiary, #b0a89e)" }}>
                  {cake.weight} · {cake.servings}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-display)", marginBottom: 6 }}>
                  {cake.price.toLocaleString("ru-RU")} ₽
                </div>
                <div style={{
                  padding: "6px 14px", borderRadius: 12,
                  background: "linear-gradient(135deg, var(--color-primary, #c4633a), var(--color-primary-dark, #a04e2b))",
                  color: "#fff", fontSize: 12, fontWeight: 700,
                  display: "inline-block",
                }}>
                  Заказать
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Order Bottom Sheet */}
      <AnimatePresence>
        {selectedCake && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCake(null)}
              style={{
                position: "fixed", inset: 0, zIndex: 900,
                background: "rgba(0,0,0,0.45)",
                backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
              }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              style={{
                position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 901,
                background: "var(--color-bg, #faf6f1)",
                borderRadius: "24px 24px 0 0",
                padding: "12px 20px calc(var(--safe-bottom, 20px) + 20px)",
                maxHeight: "75vh", overflow: "auto",
              }}
            >
              {/* Handle */}
              <div style={{ width: 40, height: 4, borderRadius: 4, background: "rgba(0,0,0,0.12)", margin: "0 auto 16px" }} />

              {/* Cake info */}
              <div style={{
                background: "var(--color-card)", borderRadius: 20,
                padding: 20, marginBottom: 16,
                borderLeft: `4px solid ${selectedCake.accent}`,
              }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                  {selectedCake.name}
                </h3>
                <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
                  {selectedCake.desc}
                </p>
                <p style={{ fontSize: 12, color: "var(--color-text-tertiary, #b0a89e)", marginBottom: 8 }}>
                  {selectedCake.ingredients}
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {selectedCake.weight}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)" }}>
                    {selectedCake.servings}
                  </span>
                </div>
                <div style={{
                  fontWeight: 800, fontSize: 24, fontFamily: "var(--font-display)",
                  color: "var(--color-primary, #c4633a)", marginTop: 12,
                }}>
                  {selectedCake.price.toLocaleString("ru-RU")} ₽
                </div>
              </div>

              {/* Optional fields */}
              <div style={{
                background: "var(--color-card)", borderRadius: 20,
                padding: 20, marginBottom: 16,
              }}>
                <label style={{ display: "block", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    Надпись на торте (необязательно)
                  </span>
                  <input
                    type="text"
                    value={inscription}
                    onChange={(e) => setInscription(e.target.value)}
                    placeholder="С днём рождения, Маша!"
                    maxLength={50}
                    style={{
                      width: "100%", padding: "12px 14px",
                      borderRadius: 14, border: "1px solid var(--color-border-light, #eee8e0)",
                      background: "var(--color-bg-warm, #faf6f1)",
                      fontSize: 14, fontFamily: "var(--font-body)",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
                <label style={{ display: "block" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>
                    К какой дате
                  </span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    style={{
                      width: "100%", padding: "12px 14px",
                      borderRadius: 14, border: "1px solid var(--color-border-light, #eee8e0)",
                      background: "var(--color-bg-warm, #faf6f1)",
                      fontSize: 14, fontFamily: "var(--font-body)",
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                </label>
              </div>

              {/* CTA */}
              <div style={{ display: "flex", gap: 10 }}>
                <motion.a
                  href={buildTelegramMessage(selectedCake)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("cake_order_telegram", { cake: selectedCake.name, price: selectedCake.price })}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: 16, textAlign: "center",
                    background: "#2AABEE", color: "#fff", textDecoration: "none",
                    borderRadius: 16, fontSize: 14, fontWeight: 700,
                    fontFamily: "var(--font-display)",
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
                  onClick={() => track("cake_order_call", { cake: selectedCake.name })}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    flex: 1, padding: 16, textAlign: "center",
                    background: "linear-gradient(135deg, var(--color-primary, #c4633a), var(--color-primary-dark, #a04e2b))",
                    color: "#fff", textDecoration: "none",
                    borderRadius: 16, fontSize: 14, fontWeight: 700,
                    fontFamily: "var(--font-display)",
                    boxShadow: "0 4px 16px rgba(196,99,58,0.3)",
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
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

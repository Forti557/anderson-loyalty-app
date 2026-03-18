import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/BackButton.js";
import { LocationMap, type MapMarker } from "../components/LocationMap.js";

const cities = ["Москва", "Регионы"] as const;

const restaurants = [
  { id: 1, name: "Гиляровского", address: "ул. Гиляровского, д. 39", city: "Москва", metro: "Проспект Мира", hours: "пн-пт 8:00–22:00, сб-вс 9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7813, lng: 37.6336 },
  { id: 2, name: "На Льва Толстого", address: "ул. Льва Толстого, д. 23", city: "Москва", metro: "Парк культуры", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7351, lng: 37.5878 },
  { id: 3, name: "Фили", address: "пр-д Береговой, д. 5А", city: "Москва", metro: "Фили", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7473, lng: 37.4871 },
  { id: 4, name: "Шуваловский", address: "Мичуринский проспект, д. 7/1", city: "Москва", metro: "Раменки", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7016, lng: 37.5064 },
  { id: 5, name: "Воронцовский парк", address: "ул. Академика Пилюгина, д. 18", city: "Москва", metro: "Новые Черёмушки", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.6812, lng: 37.5709 },
  { id: 6, name: "Бутово", address: "Южнобутовская ул.", city: "Москва", metro: "Бунинская Аллея", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.5434, lng: 37.5341 },
  { id: 7, name: "Сокол", address: "Москва, р-н Сокол", city: "Москва", metro: "Сокол", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.8054, lng: 37.5149 },
  { id: 8, name: "В Крылатском", address: "Москва, Крылатское", city: "Москва", metro: "Крылатское", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7567, lng: 37.4089 },
  { id: 9, name: "Кропоткинская", address: "Москва, р-н Хамовники", city: "Москва", metro: "Кропоткинская", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7449, lng: 37.6033 },
  { id: 10, name: "Жулебино", address: "Москва, Жулебино", city: "Москва", metro: "Жулебино", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.6858, lng: 37.8561 },
  { id: 11, name: "Медведково", address: "Москва, Медведково", city: "Москва", metro: "Медведково", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.8872, lng: 37.6594 },
  { id: 12, name: "Форт Ясенево", address: "Москва, Ясенево", city: "Москва", metro: "Ясенево", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.6063, lng: 37.5329 },
  { id: 13, name: "В парке Царицыно", address: "Москва, Царицыно", city: "Москва", metro: "Царицыно", hours: "10:00–22:00", gameRoom: "10:00–22:00", lat: 55.6161, lng: 37.6687 },
  { id: 14, name: "Таганская", address: "Москва, Таганская ул.", city: "Москва", metro: "Таганская", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7408, lng: 37.6534 },
  { id: 15, name: "Обручева", address: "Москва, ул. Обручева", city: "Москва", metro: "Калужская", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.6594, lng: 37.5447 },
  { id: 16, name: "Кусковская", address: "Москва, Кусковская ул.", city: "Москва", metro: "Перово", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7361, lng: 37.8053 },
  { id: 17, name: "Остров", address: "Москва", city: "Москва", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7680, lng: 37.6165 },
  { id: 18, name: "Маршала Бирюзова", address: "Москва, ул. Маршала Бирюзова", city: "Москва", metro: "Октябрьское Поле", hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7933, lng: 37.4988 },
  { id: 19, name: "Донской Олимп", address: "Москва", city: "Москва", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7136, lng: 37.6006 },
  { id: 20, name: "Ладья", address: "г. Зеленоград, Площадь Юности, д. 2", city: "Москва", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.9887, lng: 37.1741 },
  { id: 21, name: "Anderson Festival", address: "Москва", city: "Москва", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 55.7558, lng: 37.5800 },
  { id: 22, name: "Тюмень Осипенко", address: "г. Тюмень, ул. Осипенко, д. 73", city: "Тюмень", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 57.1553, lng: 65.5610 },
  { id: 23, name: "Тюмень Ямская", address: "г. Тюмень, ул. Ямская, д. 122", city: "Тюмень", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 57.1496, lng: 65.5340 },
  { id: 24, name: "Ярославль", address: "г. Ярославль, ул. Республиканская, д. 68", city: "Ярославль", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 57.6261, lng: 39.8845 },
  { id: 25, name: "Архангельск", address: "г. Архангельск, ул. Воскресенская, д. 20, ТРК Титан Арена, 3 этаж", city: "Архангельск", metro: null, hours: "9:00–22:00", gameRoom: "10:00–22:00", lat: 64.5401, lng: 40.5433 },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function RestaurantsPage() {
  const [cityFilter, setCityFilter] = useState<string>("Москва");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filtered = restaurants.filter((r) =>
    cityFilter === "Москва" ? r.city === "Москва" : r.city !== "Москва"
  );

  const mapMarkers: MapMarker[] = filtered.map((r) => ({
    id: r.id,
    lat: r.lat,
    lng: r.lng,
    title: `Андерсон ${r.name}`,
    address: r.address,
  }));

  const mapCenter: [number, number] = cityFilter === "Москва"
    ? [55.751, 37.618]
    : [57.5, 50.0];

  const handleMarkerClick = useCallback((id: number) => {
    setSelectedId((prev) => (prev === id ? null : id));
    const el = document.getElementById(`restaurant-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const moscowCount = restaurants.filter((r) => r.city === "Москва").length;
  const regionCount = restaurants.filter((r) => r.city !== "Москва").length;

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
          Рестораны
        </h2>
        <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
          34 кафе для больших маленьких
        </p>
      </motion.div>

      {/* Call center */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.05 }}
        style={{
          background: "linear-gradient(135deg, var(--color-accent-gold-light), #fef9ee)",
          borderRadius: "var(--radius-xl)",
          padding: "var(--space-lg) var(--space-xl)",
          marginBottom: "var(--space-lg)",
          border: "1px solid rgba(212,168,67,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", marginBottom: "6px" }}>
          <span style={{ fontSize: "18px" }}>📞</span>
          <span style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--color-accent-gold)" }}>
            Единый колл-центр
          </span>
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: "var(--text-lg)",
            color: "var(--color-text)",
            fontFamily: "var(--font-display)",
            display: "block",
            marginBottom: "4px",
          }}
        >
          +7 (495) 221-93-63
        </span>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }}>
          Ежедневно 9:00–21:00 · Telegram для заказов
        </span>
      </motion.div>

      {/* City filter — segmented control */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.1 }}
        style={{
          display: "flex",
          background: "var(--color-border-light)",
          borderRadius: "var(--radius-lg)",
          padding: "4px",
          marginBottom: "var(--space-lg)",
          position: "relative",
        }}
      >
        {cities.map((c) => {
          const isActive = cityFilter === c;
          const count = c === "Москва" ? moscowCount : regionCount;
          return (
            <button
              key={c}
              onClick={() => { setCityFilter(c); setSelectedId(null); }}
              style={{
                flex: 1,
                padding: "10px 0",
                border: "none",
                background: "transparent",
                fontSize: "var(--text-sm)",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                cursor: "pointer",
                position: "relative",
                zIndex: 2,
                color: isActive ? "var(--color-text-inverse)" : "var(--color-text-secondary)",
                transition: "color 0.25s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              {c} ({count})
              {isActive && (
                <motion.div
                  layoutId="city-filter-bg"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
                    borderRadius: "var(--radius-md)",
                    zIndex: -1,
                    boxShadow: "var(--shadow-sm)",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Map */}
      <motion.div
        {...fadeUp}
        transition={{ delay: 0.15 }}
        style={{
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          marginBottom: "var(--space-lg)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <LocationMap
          markers={mapMarkers}
          selectedId={selectedId}
          onMarkerClick={handleMarkerClick}
          height="260px"
          center={mapCenter}
          zoom={cityFilter === "Москва" ? 10 : 4}
        />
      </motion.div>

      {/* Restaurant list */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cityFilter}
          initial="initial"
          animate="animate"
          exit={{ opacity: 0 }}
          variants={{ animate: { transition: { staggerChildren: 0.04 } } }}
          style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}
        >
          {filtered.map((r) => {
            const isSelected = selectedId === r.id;
            return (
              <motion.div
                key={r.id}
                id={`restaurant-${r.id}`}
                variants={fadeUp}
                transition={{ duration: 0.35 }}
                onClick={() => setSelectedId(r.id === selectedId ? null : r.id)}
                style={{
                  background: "var(--color-card)",
                  borderRadius: "var(--radius-xl)",
                  padding: "var(--space-lg)",
                  boxShadow: isSelected ? "var(--shadow-lg)" : "var(--shadow-sm)",
                  border: isSelected
                    ? "2px solid var(--color-primary)"
                    : "2px solid transparent",
                  cursor: "pointer",
                  transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.15s ease",
                  transform: isSelected ? "scale(1.01)" : "scale(1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-md)" }}>
                  {/* Icon */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "var(--radius-md)",
                      background: isSelected
                        ? "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))"
                        : "var(--color-bg-warm)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "background 0.25s ease",
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isSelected ? "#fff" : "var(--color-primary)"}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: "var(--text-base)",
                        fontFamily: "var(--font-display)",
                        marginBottom: "4px",
                      }}
                    >
                      Андерсон {r.name}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--text-xs)",
                        color: "var(--color-text-secondary)",
                        marginBottom: "4px",
                        lineHeight: 1.4,
                      }}
                    >
                      {r.address}
                    </div>
                    {r.metro && (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "var(--text-xs)",
                          color: "var(--color-primary)",
                          fontWeight: 600,
                          marginBottom: "6px",
                        }}
                      >
                        <span
                          style={{
                            width: "14px",
                            height: "14px",
                            borderRadius: "var(--radius-full)",
                            background: "var(--color-primary)",
                            color: "#fff",
                            fontSize: "9px",
                            fontWeight: 800,
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          M
                        </span>
                        {r.metro}
                      </div>
                    )}
                    <div style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", marginBottom: "var(--space-sm)" }}>
                      {r.hours}
                    </div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          background: "var(--color-accent-gold-light)",
                          color: "var(--color-accent-gold)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          fontWeight: 600,
                        }}
                      >
                        Детская {r.gameRoom}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          background: "var(--color-accent-green-light)",
                          color: "var(--color-accent-green)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          fontWeight: 600,
                        }}
                      >
                        Праздники
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          background: "var(--color-primary-glow)",
                          color: "var(--color-primary)",
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          fontWeight: 600,
                        }}
                      >
                        МК
                      </span>
                    </div>

                    {/* Action buttons when selected */}
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.25 }}
                        style={{ display: "flex", gap: 8, marginTop: 10 }}
                      >
                        <a
                          href={`https://yandex.ru/maps/?rtext=~${r.lat},${r.lng}&rtt=auto`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1, padding: "10px", textAlign: "center",
                            background: "linear-gradient(135deg, var(--color-primary, #c4633a), var(--color-primary-dark, #a04e2b))",
                            color: "#fff", textDecoration: "none",
                            borderRadius: "var(--radius-md, 12px)",
                            fontSize: "var(--text-xs, 12px)", fontWeight: 700,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          Маршрут
                        </a>
                        <a
                          href="tel:+74952219363"
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            flex: 1, padding: "10px", textAlign: "center",
                            background: "var(--color-bg-warm, #faf6f1)",
                            color: "var(--color-primary, #c4633a)", textDecoration: "none",
                            borderRadius: "var(--radius-md, 12px)",
                            fontSize: "var(--text-xs, 12px)", fontWeight: 700,
                            border: "1px solid var(--color-primary, #c4633a)",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          Позвонить
                        </a>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

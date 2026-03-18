import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/BackButton.js";
import { LocationMap, type MapMarker } from "../components/LocationMap.js";
import { track } from "../lib/analytics.js";

const API_URL = import.meta.env.VITE_API_URL || "";
const TG_MANAGER = "https://t.me/anderson_manager";

interface FeedEvent {
  id: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  image: string;
  age: string;
  holidayType: string;
  denyPayment: boolean;
  description: string;
  price: number;
  cafeId: number;
  cafeName: string;
  tickets: number;
  lat: number;
  lng: number;
}

interface EventDisplay extends FeedEvent {
  category: string;
  color: string;
  dateStr: string;
  time: string;
  duration: string;
}

const CATEGORY_MAP: Record<string, string> = {
  "Мастер-класс творческий": "Творческие",
  "Мастер-класс кулинарный": "Кулинарные",
  "Анимационные программы": "Анимация",
  "Семейное мероприятие": "Семейные",
};

const CATEGORY_ICONS: Record<string, string> = {
  "Все": "✨",
  "Творческие": "🎨",
  "Кулинарные": "👨‍🍳",
  "Анимация": "🎭",
  "Семейные": "👨‍👩‍👧",
};

const CATEGORY_COLORS: Record<string, string> = {
  "Творческие": "#dd998e",
  "Кулинарные": "#ddc669",
  "Анимация": "#c3d4d8",
  "Семейные": "#ffe3ca",
};

const CAFE_NAMES: Record<number, { name: string; lat: number; lng: number }> = {
  371:    { name: "Сокол",              lat: 55.8054, lng: 37.5149 },
  372:    { name: "Маршала Бирюзова",   lat: 55.7933, lng: 37.4988 },
  379:    { name: "Воронцовский парк",  lat: 55.6812, lng: 37.5709 },
  381:    { name: "Обручева",           lat: 55.6594, lng: 37.5447 },
  386:    { name: "Шуваловский",        lat: 55.7016, lng: 37.5064 },
  388:    { name: "Гиляровского",       lat: 55.7813, lng: 37.6336 },
  402:    { name: "Медведково",         lat: 55.8872, lng: 37.6594 },
  411:    { name: "Кропоткинская",      lat: 55.7449, lng: 37.6033 },
  120806: { name: "Бутово",            lat: 55.5434, lng: 37.5341 },
  131807: { name: "Льва Толстого",     lat: 55.7351, lng: 37.5878 },
  134309: { name: "Фили",              lat: 55.7473, lng: 37.4871 },
};

function parseDate(str: string): string {
  const [datePart, timePart] = str.split(" ");
  if (!datePart) return str;
  const [d, m, y] = datePart.split(".");
  return `${y}-${m}-${d}T${timePart ?? "00:00:00"}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ").replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function getText(el: Element, tag: string): string {
  return el.querySelector(tag)?.textContent?.trim() ?? "";
}

async function loadFeedEvents(): Promise<FeedEvent[]> {
  const res = await fetch(`${API_URL}/api/v1/events/feed`);
  const text = await res.text();

  // Try JSON first (production API), then XML (dev Vite proxy)
  if (text.trimStart().startsWith("{")) {
    const json = JSON.parse(text);
    if (json.success) return json.data as FeedEvent[];
    throw new Error("API error");
  }

  // Parse XML with DOMParser
  const doc = new DOMParser().parseFromString(text, "text/xml");
  const results: FeedEvent[] = [];
  let idx = 0;

  doc.querySelectorAll("event").forEach((ev) => {
    const cafes = Array.from(ev.querySelectorAll("cafe")).map((c) => ({
      id: parseInt(c.querySelector("id")?.textContent ?? "0"),
      tickets: parseInt(c.querySelector("tickets")?.textContent ?? "0"),
    }));

    const dateFrom = parseDate(getText(ev, "date_from"));
    const dateTo = parseDate(getText(ev, "date_to"));
    const price = parseFloat(getText(ev, "price")) || 0;
    const name = getText(ev, "name");
    const image = getText(ev, "image");
    const age = getText(ev, "age");
    const holidayType = getText(ev, "holiday_type");
    const denyPayment = getText(ev, "deny_payment") === "Y";
    const description = stripHtml(getText(ev, "detail_text"));

    for (const cafe of cafes) {
      const info = CAFE_NAMES[cafe.id] ?? { name: "Андерсон", lat: 55.751, lng: 37.618 };
      results.push({
        id: `feed-${idx++}`,
        name, dateFrom, dateTo, image, age, holidayType,
        denyPayment, description, price,
        cafeId: cafe.id,
        cafeName: `Андерсон ${info.name}`,
        tickets: cafe.tickets,
        lat: info.lat, lng: info.lng,
      });
    }
  });

  const now = new Date();
  return results
    .filter((e) => new Date(e.dateFrom) >= now)
    .sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());
}

const months = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const weekDays = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}
function toDateStr(iso: string) {
  return iso.slice(0, 10);
}
function formatTime(iso: string) {
  return iso.slice(11, 16);
}
function formatDuration(from: string, to: string) {
  const a = new Date(from), b = new Date(to);
  const mins = Math.round((b.getTime() - a.getTime()) / 60000);
  if (!mins || mins <= 0) return "";
  if (mins < 60) return `${mins} мин`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}ч ${m}мин` : `${h}ч`;
}

export function EventsPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Все");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [viewMonth, setViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [showMap, setShowMap] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [bookingEvent, setBookingEvent] = useState<EventDisplay | null>(null);
  const [childrenCount, setChildrenCount] = useState(1);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFeedEvents()
      .then(setEvents)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const categories = ["Все", ...Array.from(new Set(
    events.map((e) => CATEGORY_MAP[e.holidayType] || e.holidayType)
  ))];

  const mapped: EventDisplay[] = events.map((e) => ({
    ...e,
    category: CATEGORY_MAP[e.holidayType] || e.holidayType,
    color: CATEGORY_COLORS[CATEGORY_MAP[e.holidayType]] || "#c4633a",
    dateStr: toDateStr(e.dateFrom),
    time: formatTime(e.dateFrom),
    duration: formatDuration(e.dateFrom, e.dateTo),
  }));

  const filtered = mapped.filter((e) => {
    if (activeCategory !== "Все" && e.category !== activeCategory) return false;
    if (selectedDate && e.dateStr !== selectedDate) return false;
    return true;
  });

  const eventDates = new Set(mapped.map((e) => e.dateStr));

  const mapMarkers: MapMarker[] = filtered.map((e) => ({
    id: e.id as unknown as number,
    lat: e.lat,
    lng: e.lng,
    title: e.name,
    address: e.cafeName,
  }));

  const daysInMonth = getDaysInMonth(viewMonth.year, viewMonth.month);
  const firstDay = getFirstDayOfWeek(viewMonth.year, viewMonth.month);

  const prevMonth = () => setViewMonth((m) =>
    m.month === 0 ? { year: m.year - 1, month: 11 } : { year: m.year, month: m.month - 1 }
  );
  const nextMonth = () => setViewMonth((m) =>
    m.month === 11 ? { year: m.year + 1, month: 0 } : { year: m.year, month: m.month + 1 }
  );

  const formatDateStr = (day: number) => {
    const m = String(viewMonth.month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${viewMonth.year}-${m}-${d}`;
  };

  const getEventColorsForDate = (dateStr: string) =>
    mapped.filter((e) => e.dateStr === dateStr).map((e) => e.color);

  if (loading) {
    return (
      <div style={{ padding: "16px", minHeight: "100vh", background: "var(--color-bg)" }}>
        <BackButton />
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Афиша</h2>
        {[1,2,3].map((i) => (
          <div key={i} style={{
            background: "var(--color-card)", borderRadius: 20, marginBottom: 14, overflow: "hidden",
            boxShadow: "var(--shadow-md)",
          }}>
            <div style={{
              height: 160, background: "linear-gradient(90deg, #f0ebe4 25%, #faf6f1 50%, #f0ebe4 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.5s infinite",
            }} />
            <div style={{ padding: "14px 16px" }}>
              <div style={{ height: 18, borderRadius: 8, background: "#f0ebe4", marginBottom: 8, width: "70%" }} />
              <div style={{ height: 14, borderRadius: 8, background: "#f0ebe4", width: "50%" }} />
            </div>
          </div>
        ))}
        <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "32px 16px", minHeight: "100vh", background: "var(--color-bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <BackButton />
        <div style={{ fontSize: 56, marginBottom: 16 }}>😔</div>
        <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, color: "var(--color-text)", marginBottom: 8 }}>
          Не удалось загрузить афишу
        </p>
        <p style={{ fontSize: 14, color: "var(--color-text-secondary)", textAlign: "center" }}>
          Проверьте соединение и попробуйте снова
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 16px 32px", minHeight: "100vh", background: "var(--color-bg)" }}>
      <BackButton />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--color-text)", marginBottom: 4, letterSpacing: "-0.3px" }}>
          Афиша
        </h2>
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 20, lineHeight: 1.4 }}>
          Мастер-классы, анимация и маленькие чудеса для детей
        </p>
      </motion.div>

      {/* Category pills */}
      <div ref={scrollRef} style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", marginBottom: 16, paddingBottom: 4, WebkitOverflowScrolling: "touch" }}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <motion.button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              whileTap={{ scale: 0.95 }}
              style={{
                flexShrink: 0,
                padding: "8px 18px",
                borderRadius: "var(--radius-xl)",
                border: "none",
                background: isActive ? "linear-gradient(135deg, #c4633a 0%, #d4a843 100%)" : "var(--color-card)",
                color: isActive ? "#fff" : "var(--color-text)",
                fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer",
                boxShadow: isActive ? "0 4px 14px rgba(196,99,58,0.35)" : "0 1px 4px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span style={{ fontSize: 14 }}>{CATEGORY_ICONS[cat] || "📅"}</span>
              {cat}
            </motion.button>
          );
        })}
      </div>

      {/* Calendar / Map toggle */}
      <div style={{ position: "relative", display: "flex", background: "var(--color-card)", borderRadius: 14, padding: 4, marginBottom: 16, boxShadow: "0 1px 6px rgba(0,0,0,0.06)" }}>
        <motion.div
          layoutId="seg"
          style={{
            position: "absolute", top: 4, left: showMap ? "calc(50% + 2px)" : 4,
            width: "calc(50% - 6px)", height: "calc(100% - 8px)",
            borderRadius: 11, background: "linear-gradient(135deg, #c4633a 0%, #d4a843 100%)",
            boxShadow: "0 2px 8px rgba(196,99,58,0.3)",
          }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        {[false, true].map((isMap) => (
          <button key={String(isMap)} onClick={() => setShowMap(isMap)} style={{
            flex: 1, position: "relative", zIndex: 1, padding: 10, borderRadius: 11, border: "none",
            background: "transparent", color: showMap === isMap ? "#fff" : "var(--color-text)",
            fontSize: 13, fontFamily: "var(--font-body)", fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "color 0.2s",
          }}>
            {isMap ? (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>На карте</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Календарь</>
            )}
          </button>
        ))}
      </div>

      {/* Calendar or Map */}
      <AnimatePresence mode="wait">
        {showMap ? (
          <motion.div key="map" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
            <LocationMap
              markers={mapMarkers}
              selectedId={selectedEventId as unknown as number}
              onMarkerClick={(id) => {
                const sid = String(id);
                setSelectedEventId(sid === selectedEventId ? null : sid);
                const el = document.getElementById(`event-${sid}`);
                if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
              height="280px"
              center={[55.751, 37.618]}
              zoom={10}
            />
          </motion.div>
        ) : (
          <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
            style={{ background: "var(--color-card)", borderRadius: "var(--radius-2xl)", padding: 20, marginBottom: 16, boxShadow: "var(--shadow-md)" }}>
            {/* Month nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <motion.button whileTap={{ scale: 0.85 }} onClick={prevMonth} style={{ background: "rgba(196,99,58,0.08)", border: "none", padding: "8px 12px", borderRadius: 12, color: "#c4633a", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </motion.button>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16 }}>
                {months[viewMonth.month]} {viewMonth.year}
              </span>
              <motion.button whileTap={{ scale: 0.85 }} onClick={nextMonth} style={{ background: "rgba(196,99,58,0.08)", border: "none", padding: "8px 12px", borderRadius: 12, color: "#c4633a", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </motion.button>
            </div>
            {/* Weekday headers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center", marginBottom: 4 }}>
              {weekDays.map((d) => (
                <div key={d} style={{ fontSize: 11, color: "var(--color-text-secondary)", padding: "6px 0", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{d}</div>
              ))}
            </div>
            {/* Days grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = formatDateStr(day);
                const hasEvent = eventDates.has(dateStr);
                const isSel = selectedDate === dateStr;
                const colors = getEventColorsForDate(dateStr);
                return (
                  <motion.button key={day} onClick={() => setSelectedDate(isSel ? null : dateStr)} whileTap={{ scale: 0.9 }}
                    animate={isSel ? { scale: 1.1 } : { scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25 }}
                    style={{
                      width: 40, height: 40, margin: "2px auto", borderRadius: 12, border: "none",
                      background: isSel ? "linear-gradient(135deg, #c4633a 0%, #d4a843 100%)" : hasEvent ? "rgba(196,99,58,0.06)" : "transparent",
                      color: isSel ? "#fff" : "var(--color-text)",
                      fontSize: 14, fontWeight: hasEvent ? 700 : 400, cursor: "pointer",
                      position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      boxShadow: isSel ? "0 3px 10px rgba(196,99,58,0.3)" : "none",
                    }}>
                    {day}
                    {hasEvent && !isSel && (
                      <div style={{ position: "absolute", bottom: 3, display: "flex", gap: 2 }}>
                        {colors.slice(0, 3).map((c, idx) => (
                          <span key={idx} style={{ width: 5, height: 3, borderRadius: 2, background: c }} />
                        ))}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            {selectedDate && (
              <motion.button initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} onClick={() => setSelectedDate(null)}
                style={{ marginTop: 12, background: "rgba(196,99,58,0.08)", border: "none", color: "#c4633a", fontSize: 13, cursor: "pointer", fontWeight: 600, padding: "6px 14px", borderRadius: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                Сбросить дату
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events list */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ background: "var(--color-card)", borderRadius: "var(--radius-2xl)", textAlign: "center", padding: "48px 24px", boxShadow: "var(--shadow-md)" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎨</div>
            <p style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, marginBottom: 8, color: "var(--color-text)" }}>Нет событий</p>
            <p style={{ fontSize: 14, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>Попробуйте выбрать другую категорию или дату</p>
          </motion.div>
        ) : (
          <motion.div key={`list-${activeCategory}-${selectedDate}`}>
            {filtered.map((event, index) => {
              const isExpanded = expandedDesc === event.id;
              return (
                <motion.div
                  key={event.id}
                  id={`event-${event.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, delay: index * 0.06, ease: [0.25, 0.46, 0.45, 0.94] }}
                  style={{
                    background: "var(--color-card)",
                    borderRadius: "var(--radius-xl)",
                    marginBottom: 14,
                    boxShadow: selectedEventId === event.id ? "0 4px 20px rgba(196,99,58,0.2)" : "var(--shadow-md)",
                    overflow: "hidden",
                    border: selectedEventId === event.id ? "2px solid rgba(196,99,58,0.3)" : "2px solid transparent",
                    transition: "border-color 0.3s, box-shadow 0.3s",
                  }}
                >
                  {/* Event image */}
                  {event.image && (
                    <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                      <img
                        src={event.image}
                        alt={event.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      {/* Category badge over image */}
                      <div style={{
                        position: "absolute", top: 10, left: 10,
                        background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)",
                        borderRadius: 10, padding: "4px 10px",
                        fontSize: 11, fontWeight: 700, color: "#fff",
                        fontFamily: "var(--font-body)",
                        display: "flex", alignItems: "center", gap: 4,
                      }}>
                        {CATEGORY_ICONS[event.category] || "📅"} {event.category}
                      </div>
                      {/* Price badge over image */}
                      <div style={{
                        position: "absolute", top: 10, right: 10,
                        background: event.price === 0 ? "rgba(61,122,95,0.9)" : "rgba(212,168,67,0.9)",
                        backdropFilter: "blur(6px)", borderRadius: 10, padding: "4px 12px",
                        fontSize: 13, fontWeight: 800, color: "#fff",
                        fontFamily: "var(--font-body)",
                      }}>
                        {event.price === 0 ? "Бесплатно" : `${event.price.toLocaleString("ru-RU")} ₽`}
                      </div>
                    </div>
                  )}

                  {/* Card content */}
                  <div style={{ padding: event.image ? "14px 16px 16px" : "16px" }}>
                    {/* Title + price (if no image) */}
                    {!event.image && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, lineHeight: 1.35, color: "var(--color-text)", margin: 0, flex: 1 }}>
                          {event.name}
                        </h3>
                        <span style={{
                          flexShrink: 0, padding: "4px 12px", borderRadius: 12,
                          background: event.price === 0 ? "rgba(61,122,95,0.12)" : "rgba(212,168,67,0.12)",
                          color: event.price === 0 ? "#3d7a5f" : "#a07c2e",
                          fontSize: 14, fontWeight: 700,
                        }}>
                          {event.price === 0 ? "Бесплатно" : `${event.price.toLocaleString("ru-RU")} ₽`}
                        </span>
                      </div>
                    )}

                    {/* Title (when image present) */}
                    {event.image && (
                      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, lineHeight: 1.35, color: "var(--color-text)", margin: "0 0 8px", letterSpacing: "-0.2px" }}>
                        {event.name}
                      </h3>
                    )}

                    {/* Date & time */}
                    <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {new Date(event.dateFrom).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })} в {event.time}
                      {event.duration && <> · {event.duration}</>}
                    </div>

                    {/* Restaurant */}
                    <motion.div whileTap={{ scale: 0.97 }} onClick={() => { setShowMap(true); setSelectedEventId(event.id); }}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 10, background: "rgba(196,99,58,0.07)", cursor: "pointer", marginBottom: 10 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c4633a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span style={{ fontSize: 12, color: "#c4633a", fontWeight: 600, fontFamily: "var(--font-body)" }}>{event.cafeName}</span>
                    </motion.div>

                    {/* Tags */}
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, background: "rgba(61,122,95,0.12)", color: "#3d7a5f", padding: "4px 10px", borderRadius: 8, fontWeight: 600 }}>
                        {event.age}
                      </span>
                      <span style={{
                        fontSize: 11, padding: "4px 10px", borderRadius: 8, fontWeight: 600,
                        background: event.tickets <= 3 ? "rgba(220,53,53,0.12)" : "rgba(61,122,95,0.10)",
                        color: event.tickets <= 3 ? "#c42a2a" : "#3d7a5f",
                        boxShadow: event.tickets <= 3 ? "0 0 8px rgba(220,53,53,0.2)" : "none",
                      }}>
                        {event.tickets <= 3 ? `Осталось ${event.tickets} места!` : `${event.tickets} мест`}
                      </span>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{
                          fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.55,
                          display: "-webkit-box", WebkitLineClamp: isExpanded ? "unset" : 3,
                          WebkitBoxOrient: "vertical", overflow: isExpanded ? "visible" : "hidden",
                          margin: 0,
                        }}>
                          {event.description}
                        </p>
                        {event.description.length > 150 && (
                          <button onClick={() => setExpandedDesc(isExpanded ? null : event.id)}
                            style={{ background: "none", border: "none", color: "#c4633a", fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 0 0", fontFamily: "var(--font-body)" }}>
                            {isExpanded ? "Свернуть" : "Читать полностью"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* CTA */}
                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setBookingEvent(event); setChildrenCount(1); track("event_view", { event: event.name }); }}
                      style={{
                        width: "100%", padding: 12,
                        background: event.tickets <= 3 ? "linear-gradient(135deg,#c42a2a 0%,#e74c3c 100%)" : "linear-gradient(135deg,#c4633a 0%,#d4a843 100%)",
                        color: "#fff", border: "none", borderRadius: 14, fontSize: 14,
                        fontFamily: "var(--font-body)", fontWeight: 700, cursor: "pointer",
                        boxShadow: event.tickets <= 3 ? "0 3px 12px rgba(220,53,53,0.3)" : "0 3px 12px rgba(196,99,58,0.3)",
                      }}>
                      {event.tickets <= 3 ? "Записаться (мало мест!)" : "Записаться"}
                    </motion.button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Bottom Sheet */}
      <AnimatePresence>
        {bookingEvent && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setBookingEvent(null)}
              style={{ position: "fixed", inset: 0, zIndex: 900, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 350 }}
              style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 901, background: "var(--color-bg)", borderRadius: "24px 24px 0 0", padding: "12px 20px calc(var(--safe-bottom, 20px) + 20px)", maxHeight: "80vh", overflow: "auto" }}
            >
              <div style={{ width: 40, height: 4, borderRadius: 4, background: "rgba(0,0,0,0.12)", margin: "0 auto 16px" }} />

              {/* Image in sheet */}
              {bookingEvent.image && (
                <div style={{ height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 16 }}>
                  <img src={bookingEvent.image} alt={bookingEvent.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}

              {/* Event info */}
              <div style={{ background: "var(--color-card)", borderRadius: 20, padding: 20, marginBottom: 16, borderLeft: `4px solid ${bookingEvent.color}` }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{bookingEvent.name}</h3>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6 }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {new Date(bookingEvent.dateFrom).toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "long" })} в {formatTime(bookingEvent.dateFrom)}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 8 }}>
                  {bookingEvent.cafeName} · {bookingEvent.age}
                  {bookingEvent.duration && ` · ${bookingEvent.duration}`}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20, fontWeight: 800, fontFamily: "var(--font-display)", color: bookingEvent.price === 0 ? "#3d7a5f" : "var(--color-text)" }}>
                    {bookingEvent.price === 0 ? "Бесплатно" : `${bookingEvent.price.toLocaleString("ru-RU")} ₽`}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: bookingEvent.tickets <= 3 ? "#c42a2a" : "#3d7a5f", background: bookingEvent.tickets <= 3 ? "rgba(220,53,53,0.1)" : "rgba(61,122,95,0.1)", padding: "4px 10px", borderRadius: 8 }}>
                    Осталось {bookingEvent.tickets} мест
                  </span>
                </div>
              </div>

              {/* Children count */}
              <div style={{ background: "var(--color-card)", borderRadius: 20, padding: 20, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Количество детей</div>
                <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
                  {[[-1, "−"], [1, "+"]].map(([delta, label]) => (
                    <motion.button key={String(label)} whileTap={{ scale: 0.9 }}
                      onClick={() => setChildrenCount((c) => Math.max(1, Math.min(bookingEvent.tickets, c + (delta as number))))}
                      style={{
                        width: 44, height: 44, borderRadius: "50%", border: "2px solid var(--color-border-light)",
                        background: "transparent", fontSize: 20, fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: (delta === -1 && childrenCount <= 1) || (delta === 1 && childrenCount >= bookingEvent.tickets) ? "#ccc" : "var(--color-text)",
                      }}>
                      {label}
                    </motion.button>
                  ))}
                  <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "var(--font-display)", minWidth: 40, textAlign: "center" }}>
                    {childrenCount}
                  </span>
                </div>
                {bookingEvent.price > 0 && childrenCount > 1 && (
                  <div style={{ textAlign: "center", fontSize: 13, color: "var(--color-text-secondary)", marginTop: 8 }}>
                    Итого: {(bookingEvent.price * childrenCount).toLocaleString("ru-RU")} ₽
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <motion.a
                  href={`${TG_MANAGER}?text=${encodeURIComponent(`Здравствуйте! Хочу записать ${childrenCount > 1 ? childrenCount + " детей" : "ребёнка"} на:\n\n${bookingEvent.name}\n${new Date(bookingEvent.dateFrom).toLocaleDateString("ru-RU")} в ${formatTime(bookingEvent.dateFrom)}\n${bookingEvent.cafeName}`)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => track("event_book", { event: bookingEvent.name, children: childrenCount })}
                  whileTap={{ scale: 0.97 }}
                  style={{ flex: 1, padding: 16, textAlign: "center", background: "#2AABEE", color: "#fff", textDecoration: "none", borderRadius: 16, fontSize: 14, fontWeight: 700, fontFamily: "var(--font-body)", boxShadow: "0 4px 16px rgba(42,171,238,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  Записаться
                </motion.a>
                <motion.a href="tel:+74952219363" whileTap={{ scale: 0.97 }}
                  style={{ padding: "16px 20px", background: "linear-gradient(135deg,#c4633a 0%,#d4a843 100%)", color: "#fff", textDecoration: "none", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(196,99,58,0.3)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </motion.a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
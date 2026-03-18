import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext.js";
import { LOYALTY_LEVELS, STAMPS_PER_CARD } from "@anderson/shared";
import { track } from "../lib/analytics.js";
import { QrBottomSheet } from "../components/QrBottomSheet.js";

/* ================================================================ */
/*  ICONS (SVG instead of emoji)                                     */
/* ================================================================ */

function Icon({ name, color = "currentColor", size = 20 }: { name: string; color?: string; size?: number }) {
  const p = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "menu": return <svg {...p}><path d="M4 6h16M4 12h16M4 18h10" /></svg>;
    case "pin": return <svg {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "stamp": return <svg {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8" cy="8" r="1.5" fill={color} stroke="none" /><circle cx="16" cy="8" r="1.5" fill={color} stroke="none" /><circle cx="8" cy="16" r="1.5" fill={color} stroke="none" /><circle cx="16" cy="16" r="1.5" /><circle cx="12" cy="12" r="1.5" fill={color} stroke="none" /></svg>;
    case "heart": return <svg {...p}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>;
    case "cake": return <svg {...p}><path d="M2 21h20v-4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" /><path d="M4 15v-2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" /><path d="M12 4v7" /><circle cx="12" cy="3" r="1" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
    case "party": return <svg {...p}><path d="M5.8 11.3 2 22l10.7-3.8" /><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" /></svg>;
    case "catering": return <svg {...p}><path d="M2 12h20" /><path d="M20 12c0-4.4-3.6-8-8-8s-8 3.6-8 8" /><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7" /></svg>;
    case "deals": return <svg {...p}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>;
    case "qr": return <svg {...p}><rect x="2" y="2" width="8" height="8" rx="1" /><rect x="14" y="2" width="8" height="8" rx="1" /><rect x="2" y="14" width="8" height="8" rx="1" /><rect x="14" y="14" width="4" height="4" rx=".5" /><line x1="22" y1="14" x2="22" y2="22" /><line x1="18" y1="22" x2="22" y2="22" /></svg>;
    case "user": return <svg {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "star": return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>;
    default: return null;
  }
}

/* ================================================================ */
/*  DATA                                                             */
/* ================================================================ */

interface Story {
  id: number;
  title: string;
  color: string;
  emoji: string;
  thumb: string;
  slides: { text: string; bg: string; img: string }[];
}

const stories: Story[] = [
  { id: 1, title: "Традиции", color: "#192d14", emoji: "\uD83C\uDFE0", thumb: "/stories/story-traditions-1.jpg", slides: [
    { text: "Андерсон \u2014 кафе для больших маленьких. Мы здесь с 2009 года и стали частью семейных традиций тысяч семей.", bg: "#192d14", img: "/stories/story-traditions-1.jpg" },
    { text: "Маленький повод в Андерсоне становится большим событием. Утренний завтрак, встреча после школы, спонтанный кусочек торта.", bg: "#320e06", img: "/stories/story-traditions-2.jpg" },
    { text: "34 кафе в Москве и регионах. Часть экосистемы ВкусВилла. Приходите \u2014 здесь вас знают!", bg: "#1b2540", img: "/stories/story-traditions-3.jpg" },
  ]},
  { id: 2, title: "Праздники", color: "#1b2540", emoji: "\uD83C\uDF89", thumb: "/stories/story-party-1.jpg", slides: [
    { text: "Каждый визит \u2014 маленький праздник. А день рождения Андерсон превратит в настоящее волшебство!", bg: "#1b2540", img: "/stories/story-party-1.jpg" },
    { text: "50+ программ, шоу, мастер-классы и декор \u2014 координатор праздников позаботится обо всём.", bg: "#345482", img: "/stories/story-party-2.jpg" },
  ]},
  { id: 3, title: "Кондитерская", color: "#a64833", emoji: "\uD83C\uDF82", thumb: "/stories/story-bakery-1.jpg", slides: [
    { text: "Домашние торты от кондитеров Андерсона. Традиционные рецепты в современном прочтении.", bg: "#402a01", img: "/stories/story-bakery-1.jpg" },
    { text: "Персонализация, доставка, любая тематика.", bg: "#bf5b04", img: "/stories/story-bakery-2.jpg" },
  ]},
  { id: 4, title: "Забота", color: "#73192a", emoji: "\uD83D\uDC9B", thumb: "/stories/story-care-1.jpg", slides: [
    { text: "Мы помним имена и дни рождения. И думаем о комфорте наперёд.", bg: "#73192a", img: "/stories/story-care-1.jpg" },
    { text: "Кусочек торта для именинника, стикерпак на память \u2014 маленькие ритуалы, которые дарят тепло.", bg: "#320e06", img: "/stories/story-care-2.jpg" },
  ]},
  { id: 5, title: "Вместе", color: "#345482", emoji: "\uD83E\uDDE1", thumb: "/stories/story-together-1.jpg", slides: [
    { text: "Здесь легко встретить своих \u2014 и вернуться уже не просто в кафе, а к друзьям.", bg: "#192d14", img: "/stories/story-together-1.jpg" },
    { text: "Мастер-классы, клуб родителей, совместные завтраки \u2014 пространство, где рождаются истории.", bg: "#345482", img: "/stories/story-together-2.jpg" },
  ]},
];

const banners = [
  { id: 1, title: "Клуб Друзей \u2014 200 бонусов", sub: "Копите баллы с каждого визита и тратьте до 20% от счёта", bg: "#192d14", accent: "#ddc669", to: "/loyalty", img: "/banners/cafe-interior.jpg" },
  { id: 2, title: "Праздник от 36 000 \u20BD", sub: "50+ программ, аниматоры, декор и координатор. 30 залов в Москве", bg: "#1b2540", accent: "#c3d4d8", to: "/party", img: "/banners/party-kids.jpg" },
  { id: 3, title: "Торты от кондитеров", sub: "Фисташковый, Медовик, Манго-Маракуйя \u2014 от 11 000 \u20BD с доставкой", bg: "#73192a", accent: "#dd998e", to: "/cakes", img: "/banners/cake-pistachio.jpg" },
  { id: 4, title: "Кейтеринг и выездное меню", sub: "Банкетное меню, фуршетные закуски, напитки \u2014 от 250 \u20BD/чел", bg: "#402a01", accent: "#ddc669", to: "/catering", img: "/banners/cake-mango.jpg" },
  { id: 5, title: "Доставка из Андерсона", sub: "Римская пицца, салаты, паста и десерты \u2014 на дом или в офис", bg: "#345482", accent: "#c3d4d8", to: "/menu", img: "/banners/pizza.jpg" },
];

const services = [
  { to: "/menu", label: "Меню", icon: "menu", bg: "#192d14" },
  { to: "/restaurants", label: "Рестораны", icon: "pin", bg: "#345482" },
  { to: "/loyalty", label: "Бонусы", icon: "heart", bg: "#bf5b04" },
  { to: "/cakes", label: "Торты", icon: "cake", bg: "#73192a" },
  { to: "/events", label: "Афиша", icon: "calendar", bg: "#1b2540" },
  { to: "/party", label: "Праздники", icon: "party", bg: "#a64833" },
  { to: "/catering", label: "Кейтеринг", icon: "catering", bg: "#402a01" },
  { to: "/deals", label: "Витрина", icon: "deals", bg: "#345482" },
];

/* ================================================================ */
/*  ANIMATION                                                        */
/* ================================================================ */

const ease = [0.22, 1, 0.36, 1] as const;
const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease },
  }),
};

const storyRingGradient = "conic-gradient(from 30deg, #192d14, #ddc669, #a64833, #345482, #192d14)";

/* ================================================================ */
/*  STORY VIEWER                                                     */
/* ================================================================ */

function StoryViewer({ story, slideIdx, onTap, onClose }: {
  story: Story; slideIdx: number;
  onTap: (e: React.MouseEvent) => void; onClose: () => void;
}) {
  const slide = story.slides[slideIdx];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25, ease }}
      onClick={onTap}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: slide.bg,
        cursor: "pointer", overflow: "hidden",
      }}
    >
      {/* Background image */}
      <motion.div
        key={`bg${slideIdx}`}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease }}
        style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${slide.img})`,
          backgroundSize: "cover", backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay for text readability */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(to bottom,
          ${slide.bg}cc 0%,
          transparent 30%,
          transparent 40%,
          ${slide.bg}e6 65%,
          ${slide.bg} 100%)`,
      }} />
      {/* Progress */}
      <div style={{ position: "absolute", top: "calc(var(--safe-top, 0px) + 12px)", left: "16px", right: "16px", display: "flex", gap: "4px", zIndex: 2 }}>
        {story.slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: "2.5px", borderRadius: 99, background: "rgba(255,255,255,0.25)", overflow: "hidden" }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: i <= slideIdx ? "100%" : "0%" }}
              transition={{ duration: i === slideIdx ? 3 : 0.2, ease: i === slideIdx ? "linear" : "easeOut" }}
              style={{ height: "100%", background: "#fff", borderRadius: 99 }}
            />
          </div>
        ))}
      </div>
      {/* Close */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: "absolute", top: "calc(var(--safe-top, 0px) + 28px)", right: "16px", zIndex: 2,
          background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "16px",
          width: "34px", height: "34px", borderRadius: 99,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >&times;</motion.button>
      {/* Content — positioned at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "0 28px 60px", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <motion.div key={`t${slideIdx}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.4 }} style={{ fontSize: "24px", fontFamily: "var(--font-display)", fontWeight: 800, color: "#fff", marginBottom: "12px", textAlign: "center", textShadow: "0 2px 12px rgba(0,0,0,0.3)" }}>
          {story.title}
        </motion.div>
        <motion.div key={`s${slideIdx}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4 }} style={{ fontSize: "15px", color: "rgba(255,255,255,0.9)", textAlign: "center", lineHeight: 1.65, maxWidth: "300px", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
          {slide.text}
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ================================================================ */
/*  MAIN COMPONENT                                                   */
/* ================================================================ */

interface UserProfile {
  firstName: string;
  level: number;
  levelName: string;
  cashbackPercent: number;
  bonusBalance: number;
  stampsCollected?: number;
}

export function HomePage() {
  const navigate = useNavigate();
  const { apiFetch, registered } = useAuth();
  const [bannerIdx, setBannerIdx] = useState(0);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [slideIdx, setSlideIdx] = useState(0);
  const [qrOpen, setQrOpen] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const storyTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Load profile data
  useEffect(() => {
    if (registered) {
      apiFetch("/users/profile").then(setProfile).catch(() => {});
    }
  }, [registered]);

  useEffect(() => {
    if (!activeStory) return;
    storyTimerRef.current = setTimeout(() => {
      if (slideIdx < activeStory.slides.length - 1) setSlideIdx((i) => i + 1);
      else { setActiveStory(null); setSlideIdx(0); }
    }, 3000);
    return () => clearTimeout(storyTimerRef.current);
  }, [activeStory, slideIdx]);

  const openStory = (s: Story) => { setActiveStory(s); setSlideIdx(0); track("story_open", { story: s.title }); };
  const handleStoryTap = (e: React.MouseEvent) => {
    if (!activeStory) return;
    clearTimeout(storyTimerRef.current);
    if (e.clientX < window.innerWidth / 3) { if (slideIdx > 0) setSlideIdx((i) => i - 1); }
    else if (slideIdx < activeStory.slides.length - 1) setSlideIdx((i) => i + 1);
    else { track("story_complete", { story: activeStory.title }); setActiveStory(null); setSlideIdx(0); }
  };

  const firstName = profile?.firstName || "Гость";
  const bonusBalance = profile?.bonusBalance ?? 0;
  const level = LOYALTY_LEVELS.find((l) => l.level === (profile?.level ?? 1)) ?? LOYALTY_LEVELS[0];
  const stampsCollected = profile?.stampsCollected ?? 0;

  return (
    <div style={{ paddingTop: "var(--safe-top, 0px)", paddingBottom: "var(--space-xl)" }}>
      {/* ===== Story Viewer ===== */}
      <AnimatePresence>
        {activeStory && (
          <StoryViewer
            story={activeStory} slideIdx={slideIdx}
            onTap={handleStoryTap}
            onClose={() => { setActiveStory(null); setSlideIdx(0); }}
          />
        )}
      </AnimatePresence>

      {/* ===== HERO CARD: Balance + QR ===== */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease }}
        style={{ padding: "12px 16px 0" }}
      >
        <div
          onClick={() => navigate("/loyalty")}
          style={{
            background: "linear-gradient(155deg, #192d14 0%, #1e3a18 50%, #243d1e 100%)",
            borderRadius: 22, padding: "20px",
            position: "relative", overflow: "hidden", cursor: "pointer",
            boxShadow: "0 8px 32px rgba(25,45,20,0.35), 0 2px 8px rgba(25,45,20,0.15)",
          }}
        >
          {/* Dot pattern */}
          <div style={{
            position: "absolute", inset: 0, opacity: 0.04,
            backgroundImage: "radial-gradient(circle at 1.5px 1.5px, #ddc669 0.75px, transparent 0)",
            backgroundSize: "20px 20px", pointerEvents: "none",
          }} />
          {/* Glow orb */}
          <div style={{
            position: "absolute", top: -40, right: -20,
            width: 140, height: 140, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(221,198,105,0.12), transparent 70%)",
            pointerEvents: "none",
          }} />
          {/* Watermark A */}
          <div style={{
            position: "absolute", top: -20, right: -10,
            fontFamily: "Georgia, serif", fontSize: "160px", fontWeight: 700,
            color: "rgba(221,198,105,0.04)", lineHeight: 1, pointerEvents: "none",
          }}>A</div>

          {/* Top row: greeting + QR + profile */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Link to="/profile" onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 14,
                  background: "rgba(221,198,105,0.15)", border: "1px solid rgba(221,198,105,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Georgia, serif", fontSize: "18px", fontWeight: 700, color: "#ddc669",
                }}>
                  {firstName.charAt(0).toUpperCase()}
                </div>
              </Link>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>
                  {firstName}
                </div>
                <div style={{ fontSize: "11px", color: "rgba(221,198,105,0.6)", fontWeight: 500, marginTop: 1 }}>
                  {level.nameRu}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <motion.div
                whileTap={{ scale: 0.88 }}
                onClick={(e) => { e.stopPropagation(); setQrOpen(true); track("qr_open"); }}
                style={{
                  width: 42, height: 42, borderRadius: 14,
                  background: "rgba(221,198,105,0.12)", border: "1px solid rgba(221,198,105,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Icon name="qr" color="#ddc669" size={19} />
              </motion.div>
              <Link to="/profile" onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none" }}>
                <motion.div
                  whileTap={{ scale: 0.88 }}
                  style={{
                    width: 42, height: 42, borderRadius: 14,
                    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Icon name="user" color="rgba(255,255,255,0.5)" size={18} />
                </motion.div>
              </Link>
            </div>
          </div>

          {/* Balance */}
          <div style={{ position: "relative", zIndex: 1, marginBottom: 16 }}>
            <div style={{ fontSize: "11px", fontWeight: 600, color: "rgba(221,198,105,0.6)", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: 6 }}>
              Бонусный счёт
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                {bonusBalance.toLocaleString("ru-RU")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: 500, color: "rgba(255,255,255,0.3)" }}>
                бонусов
              </span>
              <span style={{ fontSize: "12px", fontWeight: 600, color: "#ddc669", marginLeft: "auto", opacity: 0.8 }}>
                {level.cashback}% кешбэк
              </span>
            </div>
          </div>

          {/* Stamps progress */}
          <div style={{
            background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "10px 14px",
            border: "1px solid rgba(255,255,255,0.04)", position: "relative", zIndex: 1,
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Icon name="stamp" color="#ddc669" size={16} />
              <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>
                Штампы
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {Array.from({ length: STAMPS_PER_CARD }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.04, type: "spring", stiffness: 300, damping: 24 }}
                  style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: i < stampsCollected ? "#ddc669" : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
              <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginLeft: 4, fontWeight: 500 }}>
                {stampsCollected}/{STAMPS_PER_CARD}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ===== STORIES ===== */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        style={{
          display: "flex", gap: 12, padding: "14px 16px 4px",
          overflowX: "auto", scrollbarWidth: "none",
        }}
      >
        {stories.map((s, idx) => (
          <motion.div
            key={s.id}
            custom={idx}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            whileTap={{ scale: 0.9 }}
            style={{ flexShrink: 0, textAlign: "center", width: 66, cursor: "pointer" }}
            onClick={() => openStory(s)}
          >
            <div style={{
              width: 66, height: 66, borderRadius: 20, marginBottom: 5,
              background: storyRingGradient,
              padding: 2.5,
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: 17.5,
                overflow: "hidden", position: "relative",
              }}>
                <img
                  src={s.thumb}
                  alt={s.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 600, color: "var(--color-text-tertiary)", lineHeight: 1.2 }}>
              {s.title}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ===== BANNER CAROUSEL ===== */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease }}
        style={{ padding: "10px 16px" }}
      >
        <div style={{ position: "relative", borderRadius: 18, overflow: "hidden" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={bannerIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35, ease }}
              onClick={() => { track("banner_click", { banner: banners[bannerIdx].title, to: banners[bannerIdx].to }); navigate(banners[bannerIdx].to); }}
              style={{
                background: banners[bannerIdx].bg,
                borderRadius: 18, padding: "22px 20px",
                minHeight: 120, position: "relative", overflow: "hidden",
                display: "flex", alignItems: "center",
                cursor: "pointer",
              }}
            >
              {/* Accent glow */}
              <div style={{
                position: "absolute", top: -30, right: 40,
                width: 120, height: 120, borderRadius: "50%",
                background: `radial-gradient(circle, ${banners[bannerIdx].accent}20, transparent 70%)`,
                pointerEvents: "none",
              }} />
              {/* Text */}
              <div style={{ flex: 1, position: "relative", zIndex: 1, paddingRight: 10 }}>
                <div style={{
                  fontSize: "17px", fontFamily: "var(--font-display)", fontWeight: 800,
                  color: "#fff", marginBottom: 6, lineHeight: 1.25,
                }}>
                  {banners[bannerIdx].title}
                </div>
                <div style={{
                  fontSize: "12px", color: "rgba(255,255,255,0.55)", lineHeight: 1.4,
                }}>
                  {banners[bannerIdx].sub}
                </div>
              </div>
              {/* Image */}
              <div style={{
                width: 90, height: 90, borderRadius: 14, overflow: "hidden",
                flexShrink: 0, position: "relative", zIndex: 1,
                background: "rgba(255,255,255,0.08)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
                <img
                  src={banners[bannerIdx].img}
                  alt=""
                  style={{
                    width: "100%", height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 5, marginTop: 10 }}>
          {banners.map((_, i) => (
            <motion.div
              key={i} onClick={() => setBannerIdx(i)}
              animate={{
                width: i === bannerIdx ? 18 : 5,
                background: i === bannerIdx ? "var(--color-text)" : "var(--color-border)",
                opacity: i === bannerIdx ? 1 : 0.5,
              }}
              transition={{ duration: 0.3, ease }}
              style={{ height: 5, borderRadius: 99, cursor: "pointer" }}
            />
          ))}
        </div>
      </motion.div>

      {/* ===== SERVICES GRID ===== */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{ padding: "6px 16px 0" }}
      >
        <h3 style={{
          fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 800,
          color: "var(--color-text)", letterSpacing: "-0.02em", marginBottom: 10,
        }}>
          Откройте для себя
        </h3>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8,
        }}>
          {services.map((s, idx) => (
            <motion.div
              key={s.to}
              custom={idx}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              whileTap={{ scale: 0.92 }}
            >
              <Link
                to={s.to}
                onClick={() => track("service_click", { service: s.label, to: s.to })}
                style={{
                  textDecoration: "none", color: "inherit",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 6, padding: "14px 4px 10px",
                  background: "var(--color-card)",
                  borderRadius: 16,
                  border: "1px solid var(--color-border-light)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.025)",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: s.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon name={s.icon} color="#fff" size={18} />
                </div>
                <span style={{
                  fontSize: "10.5px", fontWeight: 600, color: "var(--color-text-secondary)",
                  textAlign: "center", lineHeight: 1.2,
                }}>
                  {s.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ===== QR BOTTOM SHEET ===== */}
      <QrBottomSheet open={qrOpen} onClose={() => setQrOpen(false)} />
    </div>
  );
}

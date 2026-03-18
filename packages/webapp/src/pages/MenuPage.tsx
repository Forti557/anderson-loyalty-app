import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BackButton } from "../components/BackButton.js";

/* ================================================================ */
/*  TYPES                                                            */
/* ================================================================ */

interface MenuItem {
  name: string;
  desc?: string;
  weight?: string;
  price: number;
  price2?: number; // second size price
  tag?: "hit" | "new" | "veg" | "spicy" | "gf";
}

interface MenuCategory {
  id: string;
  label: string;
  emoji: string;
  items: MenuItem[];
}

/* ================================================================ */
/*  MENU DATA (from Anderson PDF menu, December 2025)                */
/* ================================================================ */

const menu: MenuCategory[] = [
  {
    id: "breakfast",
    label: "Завтраки",
    emoji: "\u2600\uFE0F",
    items: [
      { name: "Большой Мамин Завтрак", desc: "Слабосолёный лосось, нежный скрэмбл, зелёный салат с авокадо и брокколи, цельнозерновой хлеб на гриле", weight: "", price: 950, tag: "hit" },
      { name: "Большой Папин Завтрак", desc: "Омлет, драники из картофеля и батата, жареный бекон, колбаса на гриле, томатная сальса, шампиньоны, черри", weight: "", price: 750, tag: "hit" },
      { name: "Оладьи из цукини и брокколи", desc: "С семенами чиа и копчёной сметаной", weight: "", price: 430 },
      { name: "Драники с лососем", desc: "Драники из картофеля и батата со слабосолёным лососем, сливочным сыром и огурцом", weight: "", price: 760 },
      { name: "Драники с ростбифом", desc: "С ростбифом и соусом из печёных овощей", weight: "", price: 690 },
      { name: "Омлет с авокадо и шпинатом", weight: "", price: 590 },
      { name: "Омлет с беконом и томатами", weight: "", price: 490 },
      { name: "Омлет с лососем и крем-чизом", desc: "Со слабосолёным лососем и крем-чизом", weight: "", price: 670 },
      { name: "Круассан Цезарь с индейкой", weight: "", price: 490 },
      { name: "Гречка-боул с лососем", desc: "С лососем, авокадо и перепелиным яйцом", weight: "", price: 770 },
      { name: "Каша овсяная классическая", desc: "На воде или молоке", weight: "", price: 280 },
      { name: "Каша с ягодами и печеньем", desc: "С ягодами, печеньем и сливочным маслом", weight: "", price: 590 },
      { name: "Блинчики со сметаной и малиной", desc: "Шесть блинчиков со сметаной, малиной, мёдом и Nutella", weight: "", price: 520 },
      { name: "Блинчики с бананом и Nutella", desc: "Фаршированные бананом и Nutella", weight: "", price: 490 },
      { name: "Мини-панкейки", desc: "С мёдом, клубникой и свежими ягодами", weight: "", price: 560 },
      { name: "Фирменные сырники", desc: "С протёртой малиной и сметаной", weight: "", price: 520, tag: "hit" },
    ],
  },
  {
    id: "sandwiches",
    label: "Сэндвичи",
    emoji: "\uD83E\uDD6A",
    items: [
      { name: "Мини-брускетты с сельдью", desc: "3 шт.", weight: "", price: 420 },
      { name: "Пита-гриль с индейкой", desc: "Две половинки питы, со свежей овощной начинкой и индейкой в соусе ранч", weight: "", price: 690 },
      { name: "Клаб-сэндвич", desc: "С картофелем фри, индейкой, беконом, томатами, перепелиным яйцом", weight: "", price: 790, tag: "hit" },
      { name: "Картофельная вафля", desc: "С тунцом и сливочным соусом", weight: "", price: 690 },
      { name: "Горячий сэндвич с индейкой", desc: "Подрумяненный домашний хлеб, индейка, тянущийся сыр моцарелла, вяленые томаты", weight: "", price: 720 },
      { name: "Брускетта с лососем и авокадо", desc: "Две половинки цельнозернового хлеба, подкопчённый лосось, крем-чиз и авокадо", weight: "", price: 850 },
    ],
  },
  {
    id: "soups",
    label: "Супы",
    emoji: "\uD83C\uDF5C",
    items: [
      { name: "Суп-лапша", desc: "С филе индейки и перепелиным яйцом", weight: "", price: 490 },
      { name: "Борщ с томлёной говядиной", desc: "Со сметаной", weight: "", price: 570 },
      { name: "Том Ям с креветками", desc: "С приятной остротой перца чили и лёгкими нотками кокосового молока", weight: "", price: 740, tag: "spicy" },
      { name: "Крем-суп с белыми грибами", desc: "С трюфельным маслом и бородинскими гренками", weight: "", price: 650, tag: "hit" },
      { name: "Тыквенный крем-суп с креветками", desc: "С тигровыми креветками и горгонзолой", weight: "", price: 720 },
      { name: "Тыквенный крем-суп", desc: "С тыквенными семечками", weight: "", price: 490, tag: "veg" },
    ],
  },
  {
    id: "salads",
    label: "Салаты",
    emoji: "\uD83E\uDD57",
    items: [
      { name: "Салат с хрустящими баклажанами", desc: "С томатами, кинзой, кешью и пикантным соусом на основе сладкого чили", weight: "", price: 630 },
      { name: "Деревенский салат", desc: "С перепелиным яйцом, фермерскими томатами, огурцами, редисом и зеленью, со сметаной", weight: "", price: 490, tag: "veg" },
      { name: "Бора-Бора", desc: "С креветками, авокадо и свежими огурцами", weight: "", price: 790 },
      { name: "Цезарь с индейкой", weight: "", price: 660, tag: "hit" },
      { name: "Цезарь с креветкой", weight: "", price: 690 },
      { name: "Салат с ростбифом", desc: "Пряные слайсы ростбифа и салатными листьями, томатами и горчичной заправкой", weight: "", price: 695 },
      { name: "Салат с халуми и овощами", desc: "С жареным сыром халуми и овощами", weight: "", price: 720 },
      { name: "Салат с лососем гриль", desc: "С авокадо, брокколи и листьями салата", weight: "", price: 750 },
      { name: "Большой зелёный салат", desc: "С авокадо, кинза, брокколи, огурцами, молодым горошком и шпинатом", weight: "", price: 820 },
      { name: "Большой Нисуаз", desc: "С тунцом, картофелем, перепелиным яйцом, томатами, листьями салата и красным луком", weight: "", price: 790 },
      { name: "Оливье с мортаделлой", weight: "", price: 540 },
      { name: "Селёдка под шубой", weight: "", price: 490 },
    ],
  },
  {
    id: "pasta",
    label: "Паста",
    emoji: "\uD83C\uDF5D",
    items: [
      { name: "Феттучини с лососем и креветками", desc: "В сливочном соусе", weight: "", price: 890, tag: "hit" },
      { name: "Лингвини Болоньезе", desc: "В сливочном соусе", weight: "", price: 630 },
      { name: "Феттучини с беконом", desc: "В сливочном соусе", weight: "", price: 660 },
      { name: "Ригатони с белыми грибами", desc: "В грибном соусе", weight: "", price: 780 },
      { name: "Алио Олио лингвини с креветками", desc: "С оливковым маслом", weight: "", price: 660 },
    ],
  },
  {
    id: "pizza",
    label: "Пицца",
    emoji: "\uD83C\uDF55",
    items: [
      { name: "Пицца Пепперони", weight: "", price: 870, tag: "hit" },
      { name: "Пицца 4 сыра", weight: "", price: 840 },
      { name: "Пицца Маргарита", weight: "", price: 750 },
      { name: "Пицца Ветчина и грибы", weight: "", price: 820 },
      { name: "Пицца Горгонзола", desc: "С карамелизированной грушей", weight: "", price: 790 },
      { name: "Горячая фокачча", desc: "С крупной солью, пармезаном и чесноком", weight: "", price: 390 },
    ],
  },
  {
    id: "hot",
    label: "Горячее",
    emoji: "\uD83C\uDF56",
    items: [
      { name: "Стейк лосося", desc: "С овощами в соусе терияки, на гриле или на пару", weight: "", price: 1800 },
      { name: "Фиш-н-чипс", desc: "С картофелем фри, коул слоу и соусом тар-тар", weight: "", price: 960 },
      { name: "Котлеты из индейки", desc: "С овощным соте или мятым картофелем, на гриле или пару", weight: "", price: 790 },
      { name: "Филе индейки в азиатском соусе", desc: "С овощами, на гриле или на пару", weight: "", price: 850, tag: "spicy" },
      { name: "Пельмени со сметаной", desc: "С индейкой или говядиной на выбор", weight: "", price: 540 },
      { name: "Вареники с картофелем", weight: "", price: 490 },
      { name: "Бефстроганов", desc: "С мятым картофелем и грибами", weight: "", price: 990 },
      { name: "Стейк из говяжьей вырезки", desc: "С жареной картошкой и перечным соусом, с маринованными огурчиками", weight: "", price: 2100 },
      { name: "Шницель куриный", desc: "С томатной сальсой", weight: "", price: 990 },
      { name: "Томлёные щёчки", desc: "С картофелем", weight: "", price: 1200, tag: "hit" },
      { name: "Мюнхенские колбаски", desc: "С печёным картофелем, обжаренным беконом и сладкой горчицей", weight: "", price: 790 },
      { name: "Индейка в сливках", desc: "С мятым картофелем и горошком", weight: "", price: 820 },
      { name: "Чизбургер", weight: "", price: 660 },
      { name: "Бургер «Папа сможет»", desc: "С двумя котлетами, беконом, маринованным огурцом и красным луком", weight: "", price: 890, tag: "hit" },
      { name: "Томлёная утиная ножка", desc: "В соусе из пряных трав с печёным картофелем", weight: "", price: 1200 },
    ],
  },
  {
    id: "sides",
    label: "Гарниры",
    emoji: "\uD83E\uDD54",
    items: [
      { name: "Картофель фри", weight: "", price: 360 },
      { name: "Картофельное пюре", weight: "", price: 320 },
      { name: "Брокколи бланшированная", desc: "С зелёным маслом и миндалём", weight: "", price: 370, tag: "veg" },
      { name: "Киноа с мятой", weight: "", price: 360, tag: "veg" },
      { name: "Соте из овощей", weight: "", price: 490, tag: "veg" },
    ],
  },
  {
    id: "desserts",
    label: "Десерты",
    emoji: "\uD83C\uDF70",
    items: [
      { name: "Фисташковый рулет со свежей малиной", weight: "", price: 690, tag: "hit" },
      { name: "Лимонная тарталетка с меренгой", weight: "", price: 350 },
      { name: "Мини-тарталетка с брусникой", weight: "", price: 470 },
      { name: "Шу с ванильным кремом", weight: "", price: 390 },
      { name: "Ягодная тарталетка", desc: "Ромашка, лесная ягода, с наполнителем", weight: "", price: 420 },
      { name: "Торт Манго-маракуйя", desc: "С меренгой и ягодами", weight: "", price: 590 },
      { name: "Муравейное счастье", weight: "", price: 490 },
      { name: "Классический медовый торт", weight: "", price: 490, tag: "hit" },
      { name: "Наполеон с карамелизированной грушей", weight: "", price: 490 },
      { name: "Сметанник со свежими ягодами", weight: "", price: 590 },
      { name: "Домашний эклер", weight: "", price: 290 },
      { name: "Эстерхази", weight: "", price: 580, tag: "gf" },
      { name: "Птичье молоко", weight: "", price: 560 },
      { name: "Прага", weight: "", price: 590 },
      { name: "Ягодный тарт", weight: "", price: 590 },
      { name: "Матча-манго", weight: "", price: 590, tag: "new" },
      { name: "Морковное пирожное", weight: "", price: 520 },
      { name: "Эклер ручной работы", desc: "Фисташка, карамель или ягодный", weight: "", price: 380 },
      { name: "Танцующий котик", weight: "", price: 390, tag: "gf" },
      { name: "Шарик мороженого", desc: "Ваниль, шоколад, клубника, ягодный сорбет", weight: "", price: 200 },
      { name: "Пирожное «Мишка»", desc: "Шоколадный мусс на хрустящей подушке из тёмного шоколада", weight: "", price: 560 },
      { name: "Зефирная Лапа", desc: "В тёмном шоколаде", weight: "", price: 330 },
      { name: "Пирожное «Картошка Овечка»", weight: "", price: 390 },
    ],
  },
  {
    id: "coffee",
    label: "Кофе",
    emoji: "\u2615",
    items: [
      { name: "Эспрессо / Двойной эспрессо", desc: "30/60 мл", weight: "", price: 200, price2: 280 },
      { name: "Большая чашка американо", desc: "250 мл", weight: "", price: 320 },
      { name: "Капучино / Мегакапучино", desc: "220/300 мл", weight: "", price: 340, price2: 430 },
      { name: "Латте / Мегалатте", desc: "300/450 мл", weight: "", price: 360, price2: 430, tag: "hit" },
      { name: "Флэт уайт", desc: "220 мл", weight: "", price: 390 },
      { name: "Воздушный раф", desc: "450 мл", weight: "", price: 450 },
      { name: "Матча латте", desc: "450 мл", weight: "", price: 460 },
      { name: "Какао / Мегакакао", desc: "220/450 мл", weight: "", price: 280, price2: 390 },
      { name: "Малиновый латте", desc: "450 мл", weight: "", price: 470, tag: "new" },
      { name: "Латте Грецкий орех", desc: "450 мл", weight: "", price: 470 },
      { name: "Айриш-кофе с бобами тонка", desc: "300 мл", weight: "", price: 460 },
      { name: "Арахисовый раф", desc: "300 мл", weight: "", price: 460 },
      { name: "Капучино Марципан", desc: "300 мл", weight: "", price: 470 },
    ],
  },
  {
    id: "tea",
    label: "Чай",
    emoji: "\uD83C\uDF75",
    items: [
      { name: "Ассам", desc: "Классический чай, 800 мл", weight: "", price: 495 },
      { name: "Молочный улун", desc: "800 мл", weight: "", price: 495 },
      { name: "Зелёная сенча", desc: "800 мл", weight: "", price: 495 },
      { name: "Ромашка", desc: "800 мл", weight: "", price: 495 },
      { name: "Мятный", desc: "Травяной чай, 800 мл", weight: "", price: 495 },
      { name: "Чай с ромашкой и тремя травами", desc: "800 мл", weight: "", price: 495 },
      { name: "Чёрный чай с молоком и специями", desc: "Фруктово-ягодный, 800 мл", weight: "", price: 630 },
      { name: "Чай с чёрной смородиной и розмарином", desc: "800 мл", weight: "", price: 630 },
      { name: "Имбирный чай с мёдом", desc: "800 мл", weight: "", price: 630 },
      { name: "Маракуйя-розовый перец", desc: "800 мл", weight: "", price: 630, tag: "new" },
      { name: "Облепиховый чай с малиной и мёдом", desc: "800 мл", weight: "", price: 630, tag: "hit" },
      { name: "Голубика-смородина", desc: "800 мл", weight: "", price: 630 },
    ],
  },
  {
    id: "drinks",
    label: "Напитки",
    emoji: "\uD83E\uDDCB",
    items: [
      { name: "Лимонад Апельсин-клубника", desc: "400 мл / 1 л", weight: "", price: 460, price2: 950 },
      { name: "Лимонад Классический с лимоном", desc: "400 мл / 1 л", weight: "", price: 420, price2: 950 },
      { name: "Лимонад Ежевика-миндаль и кардамон", desc: "300 мл / 1 л", weight: "", price: 480, price2: 950, tag: "new" },
      { name: "Лимонад Фейхоа-лайм", desc: "300 мл / 1 л", weight: "", price: 460, price2: 950 },
      { name: "Лимонад Персик-лемонграсс", desc: "300 мл / 1 л", weight: "", price: 460, price2: 950 },
      { name: "Мохиато безалкогольный", desc: "400 мл", weight: "", price: 495 },
      { name: "Домашний морс клюквенный", desc: "250/500 мл / 1 л", weight: "", price: 200, price2: 720 },
      { name: "Сок", desc: "Яблоко, апельсин, томат, вишня — 250 мл", weight: "", price: 270 },
      { name: "Детокс-смузи Бананово-овсяный", desc: "300 мл", weight: "", price: 460 },
      { name: "Детокс-смузи Клубника-банан", desc: "300 мл", weight: "", price: 460 },
      { name: "Молочный коктейль с пузырями", desc: "450 мл", weight: "", price: 400 },
      { name: "Большой коктейль со сливками", desc: "Со взбитыми сливками, клубникой и маршмеллоу, 450 мл", weight: "", price: 470, tag: "hit" },
      { name: "Свежевыжатый яблоко/сельдерей", desc: "200 мл", weight: "", price: 395 },
      { name: "Свежевыжатый апельсин", desc: "200 мл", weight: "", price: 450 },
    ],
  },
];

/* ================================================================ */
/*  TAG LABELS                                                       */
/* ================================================================ */

const tagConfig: Record<string, { label: string; bg: string; color: string }> = {
  hit: { label: "Хит", bg: "#fdf5e3", color: "#a67c10" },
  new: { label: "Новинка", bg: "#e6f2ec", color: "#2d6a4f" },
  veg: { label: "Вег", bg: "#e6f2ec", color: "#3d7a5f" },
  spicy: { label: "Остро", bg: "#fce8e6", color: "#c0392b" },
  gf: { label: "Без глютена", bg: "#eaf2fa", color: "#345482" },
};

/* ================================================================ */
/*  ANIMATION                                                        */
/* ================================================================ */

const ease = [0.22, 1, 0.36, 1] as const;

/* ================================================================ */
/*  COMPONENT                                                        */
/* ================================================================ */

export function MenuPage() {
  const [activeId, setActiveId] = useState(menu[0].id);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Scroll active tab into view
  useEffect(() => {
    const el = tabsRef.current?.querySelector(`[data-tab="${activeId}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [activeId]);

  const active = menu.find((c) => c.id === activeId)!;

  return (
    <div style={{ paddingBottom: "var(--space-3xl)" }}>
      {/* Header */}
      <div style={{ padding: "var(--space-lg) var(--space-lg) 0" }}>
        <BackButton />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <h2 style={{ marginBottom: 2 }}>Меню</h2>
          <p style={{ fontSize: "var(--text-sm)", marginBottom: "var(--space-md)", color: "var(--color-text-tertiary)" }}>
            Кафе для больших маленьких
          </p>
        </motion.div>
      </div>

      {/* Category tabs — sticky */}
      <div
        ref={tabsRef}
        style={{
          display: "flex", gap: 6,
          overflowX: "auto", scrollbarWidth: "none",
          padding: "0 var(--space-lg) var(--space-md)",
          position: "sticky", top: 0, zIndex: 10,
          background: "var(--color-bg)",
          paddingTop: "var(--space-sm)",
          paddingBottom: "var(--space-sm)",
        }}
      >
        {menu.map((cat) => {
          const isActive = cat.id === activeId;
          return (
            <button
              key={cat.id}
              data-tab={cat.id}
              onClick={() => setActiveId(cat.id)}
              style={{
                flexShrink: 0,
                padding: "7px 14px",
                borderRadius: "var(--radius-full)",
                border: isActive ? "none" : "1px solid var(--color-border-light)",
                background: isActive ? "#192d14" : "var(--color-card)",
                color: isActive ? "#ddc669" : "var(--color-text-secondary)",
                fontSize: "13px",
                fontWeight: 600,
                boxShadow: isActive ? "0 2px 8px rgba(25,45,20,0.2)" : "none",
                transition: "all 0.2s ease",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <span style={{ fontSize: "14px" }}>{cat.emoji}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Items count */}
      <div style={{
        padding: "0 var(--space-lg)",
        marginBottom: "var(--space-md)",
        fontSize: "var(--text-xs)",
        color: "var(--color-text-tertiary)",
        fontWeight: 500,
      }}>
        {active.items.length} {active.items.length > 4 ? "позиций" : "позиции"}
      </div>

      {/* Items */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease }}
          style={{
            display: "flex", flexDirection: "column", gap: 6,
            padding: "0 var(--space-lg)",
          }}
        >
          {active.items.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025, duration: 0.3, ease }}
              style={{
                background: "var(--color-card)",
                borderRadius: 14,
                padding: "14px 16px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.025)",
                border: "1px solid var(--color-border-light)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Name + tag */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: item.desc ? 4 : 0 }}>
                  <span style={{
                    fontWeight: 600, fontSize: "14px", color: "var(--color-text)",
                    lineHeight: 1.3,
                  }}>
                    {item.name}
                  </span>
                  {item.tag && tagConfig[item.tag] && (
                    <span style={{
                      fontSize: "10px",
                      background: tagConfig[item.tag].bg,
                      color: tagConfig[item.tag].color,
                      padding: "2px 7px",
                      borderRadius: "var(--radius-full)",
                      fontWeight: 600,
                      lineHeight: 1.4,
                      flexShrink: 0,
                    }}>
                      {tagConfig[item.tag].label}
                    </span>
                  )}
                </div>
                {/* Description */}
                {item.desc && (
                  <div style={{
                    fontSize: "12px", color: "var(--color-text-tertiary)",
                    lineHeight: 1.4,
                  }}>
                    {item.desc}
                  </div>
                )}
              </div>
              {/* Price */}
              <div style={{
                flexShrink: 0,
                textAlign: "right",
              }}>
                <div style={{
                  fontWeight: 700, fontSize: "15px",
                  color: "var(--color-text)",
                  lineHeight: 1,
                }}>
                  {item.price} <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-text-tertiary)" }}>{"\u20BD"}</span>
                </div>
                {item.price2 && (
                  <div style={{
                    fontSize: "11px", color: "var(--color-text-tertiary)",
                    fontWeight: 500, marginTop: 3,
                  }}>
                    / {item.price2} {"\u20BD"}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

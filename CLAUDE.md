yfqпосмотрел# Anderson Loyalty — Telegram Mini App

## Проект
MVP Telegram Mini App — программа лояльности сети семейных ресторанов «Андерсон».

## PRD
Полный PRD: [PRD.md](./PRD.md) — **обязательно прочитать перед началом работы.**

## Стек
- **Frontend:** React + TypeScript + Vite + Telegram Web App SDK (`@telegram-apps/sdk-react`)
- **Backend:** Node.js + Fastify + Prisma ORM
- **БД:** PostgreSQL
- **Бот:** grammY (Telegram Bot Framework)
- **Деплой:** Docker → VPS (или Vercel для фронта)

## Структура проекта
```
anderson-loyalty-app/
├── CLAUDE.md          # Этот файл
├── PRD.md             # Product Requirements Document
├── packages/
│   ├── webapp/        # Telegram Mini App (React)
│   ├── admin/         # Admin Panel (React, served at /admin/)
│   ├── bot/           # Telegram Bot (grammY)
│   ├── api/           # Backend API (Fastify)
│   └── shared/        # Общие типы, утилиты
├── prisma/
│   └── schema.prisma  # Схема БД
├── docker-compose.yml
└── package.json       # Monorepo (pnpm workspaces)
```

## Интеграции
- **Mindbox API** — CRM, бонусы, триггеры. Docs: https://docs.mindbox.ru/
- **iiko Transport API** — POS, чеки, идентификация гостя
- **Telegram Bot API** + **Mini App WebApp API**

## Ключевые экраны (MVP)
1. **Онбординг** — 3 слайда + регистрация (имя, телефон, ДР ребёнка)
2. **Главный экран** — QR-код, баланс, уровень, прогресс, штампы (мини)
3. **Штамп-карта** — сетка 2×5, прогресс до подарка
4. **История** — начисления/списания бонусов
5. **Мастер-классы** — афиша, фильтры, запись
6. **Профиль** — данные, дети, домашний ресторан

## Правила разработки
- Mobile-first (только мобильный Telegram)
- Тема: тёплые семейные цвета (Андерсон = оранжевый/жёлтый)
- Всё на русском языке
- API: REST, JSON, версионирование /api/v1/
- Авторизация: проверка Telegram initData (HMAC-SHA-256)
- QR-код обновляется каждые 60 сек

## Авторизация
- Telegram initData → POST /api/v1/auth/telegram → валидация HMAC → JWT
- Регистрация новых: POST /api/v1/auth/register (initData + форма) → создание User + 200 бонусов + JWT
- JWT хранится в localStorage, передаётся через Bearer header
- AuthContext/AuthProvider (packages/webapp/src/context/AuthContext.tsx) управляет состоянием
- Незарегистрированные → /onboarding, зарегистрированные → /
- Middleware authenticate (packages/api/src/lib/auth.ts) защищает /users/* роуты

## API endpoints (JWT-protected где указано)
- POST /api/v1/auth/telegram — initData → JWT или telegram data для регистрации
- GET /api/v1/auth/telegram/:telegramId — баланс пользователя по telegramId (для бота)
- POST /api/v1/auth/register — initData + форма → создание user + JWT
- GET /api/v1/users/profile [JWT] — профиль пользователя
- PUT /api/v1/users/profile [JWT] — обновление профиля
- POST /api/v1/users/children [JWT] — добавление ребёнка
- DELETE /api/v1/users/children/:id [JWT] — удаление ребёнка
- GET /api/v1/users/transactions [JWT] — история транзакций
- POST /api/v1/admin/login — вход в админку (ADMIN_PASSWORD)
- GET /api/v1/admin/dashboard [Admin JWT] — статистика
- GET /api/v1/admin/users [Admin JWT] — список пользователей
- GET /api/v1/admin/users/:id [Admin JWT] — детали пользователя
- GET/POST/PUT/DELETE /api/v1/admin/events [Admin JWT] — CRUD мероприятий
- GET /api/v1/admin/transactions [Admin JWT] — все транзакции
- GET /api/v1/admin/analytics [Admin JWT] — аналитика

## Текущий этап
Реализовано:
- ✅ Monorepo (pnpm workspaces)
- ✅ Prisma-схема (User, Child, StampCard, Stamp, Transaction, Event, etc.)
- ✅ Скелет Mini App, бота, API
- ✅ Авторизация через Telegram initData + JWT
- ✅ Регистрация с онбордингом (3 слайда → форма)
- ✅ Профиль с редактированием и управлением детьми
- ✅ AuthContext с роут-гардами
- ✅ Меню с 130+ позициями из реального меню Андерсон
- ✅ Сторис с фото с cafe-anderson.ru
- ✅ Баннеры с реальными изображениями
- ✅ Аналитика (Telegram Analytics SDK + custom events в БД)
- ✅ QR-код (генерация, авто-обновление каждые 60с, BottomSheet на главной, compact в Loyalty)
- ✅ Калькулятор праздника (выбор программы, гостей, допов, расчёт, WhatsApp/звонок)
- ✅ Заказ тортов (8 позиций, bottom sheet с надписью/датой, WhatsApp/звонок)
- ✅ Рабочие CTA кейтеринга (WhatsApp + звонок для каждого типа услуги)
- ✅ Запись на мероприятия (bottom sheet, выбор кол-ва детей, WhatsApp/звонок)
- ✅ Рестораны: кнопки «Маршрут» (Яндекс Карты) и «Позвонить»
- ✅ Динамические данные на HomePage, StampsPage, LoyaltyPage (из API профиля)
- ✅ API: stampsCollected из активной StampCard в /users/profile
- ✅ Бот: команды /start, /balance (с API), /qr + эндпоинт для бота
- ✅ Админ-панель (packages/admin): дашборд, пользователи, мероприятия CRUD, транзакции
- ✅ Metabase дашборд на VDS (порт 3001)
- ✅ Миграция в WebView (Capacitor): убран Telegram SDK, добавлена SMS OTP авторизация (AlfaSMS)
- ✅ Push-уведомления: Capacitor Push Notifications + FCM, ручные рассылки и авто-триггеры в админке

## Обязательные правила рабочего процесса

### Export (выгрузка изменений)

После завершения правок **все изменённые файлы копируются в папку `Export/`** в корне проекта с сохранением полной структуры вложенности (зеркало production-структуры).

- Пользователь берёт содержимое `Export/` и заливает на FTP — сервер предлагает заменить только изменённые файлы.
- **Claude сам очищает `Export/`** (`rm -rf Export/*`) перед каждой выгрузкой, затем копирует файлы текущей сессии.
- `Export/` всегда содержит **только файлы текущей (ещё не залитой) сессии** правок.

Пример: если изменён `some/path/file.css`, в Export создаётся `Export/some/path/file.css`.

### Backup (резервная копия)

Перед внесением изменений в существующие файлы создаётся резервная копия.

- Бекап хранится внутри папки `Backup/` в корне проекта — **не плодить папки бекапов прямо в корне**.
- Внутри `Backup/` создаётся подпапка `YYYY-MM-DD_task-name/` с зеркальной структурой путей.
- Содержит оригинальные версии только тех файлов, которые будут изменены в этой сессии.
- Позволяет откатить изменения одной операцией.

Пример структуры:
```
Backup/
  2026-03-18_task-name/
    some/path/file.css
    another/path/script.js
```

### WORKLOG.md (лог задач)

Файл `WORKLOG.md` в корне проекта содержит историю всех выполненных задач. При завершении каждой задачи Claude добавляет новый раздел:

```markdown
## YYYY-MM-DD — Краткое описание задачи

- Что сделано
- Изменённые файлы:
  - `path/to/file1`
  - `path/to/file2`
```

---

## Ralph Mode — автономная разработка

При старте сессии Claude Code автоматически работает в ralph-режиме:

### Алгоритм
1. **Прочитай PRD.md** — определи нереализованные фичи
2. **Сверься с текущим кодом** — проверь что уже сделано (см. «Текущий этап»)
3. **Выбери следующую задачу** — самую приоритетную нереализованную фичу из PRD
4. **Реализуй** — напиши код, проверь сборку (`pnpm build`)
5. **Закоммить и задеплой** — `git add`, `git commit`, `git push vds main`
6. **Обнови CLAUDE.md** — отметь выполненное в «Текущий этап»
7. **Повтори с шага 2** — бери следующую задачу

### Правила ralph-режима
- Одна фича за итерацию (не пытайся сделать всё сразу)
- Каждая итерация заканчивается рабочим деплоем
- Если сборка падает — сначала исправь, потом продолжай
- Если задача неясна — пропусти, возьми следующую
- Приоритет: то что ближе к рабочему MVP для пользователя
- НЕ ломай то что уже работает
- Коммит-сообщения на английском, осмысленные

### Code Review
После каждого коммита автоматически проводи быстрый self-review:
- Перечитай свой diff (`git diff HEAD~1`)
- Проверь: нет ли багов, забытых console.log, хардкода секретов, сломанных импортов
- Если нашёл проблему — исправь и сделай новый коммит перед деплоем
- Для полного ревью PR используй `/code-review`

### EXIT условие
Останови ralph-режим если:
- Все фичи из PRD реализованы
- Пользователь явно попросил остановиться
- Обнаружена критическая проблема, требующая решения пользователя

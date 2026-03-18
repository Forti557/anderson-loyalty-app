# WORKLOG — Anderson Loyalty App

## 2026-03-19 — Миграция из Telegram Mini App в WebView (Capacitor)

### Что сделано:
- Добавлен Capacitor (оболочка для App Store / Google Play): `@capacitor/core`, `@capacitor/android`, `@capacitor/ios`, `@capacitor/push-notifications`
- Создан `capacitor.config.ts` (appId: `ru.anderson.loyalty`, appName: `Андерсон`)
- Убраны все Telegram SDK зависимости (`@telegram-apps/sdk-react`, `@telegram-apps/analytics`)
- Реализована SMS OTP авторизация через AlfaSMS (sender: AnderSon):
  - Backend: `POST /api/v1/auth/send-otp`, `POST /api/v1/auth/verify-otp`, `POST /api/v1/auth/register`
  - Frontend: новый `LoginPage` с вводом телефона и 6-значного кода
- Добавлена система push-уведомлений:
  - Backend: роуты `/api/v1/push/*` (токены устройств, рассылки, триггеры)
  - Admin: новая страница «Рассылки» — ручная отправка + авто-триггеры
- Prisma схема обновлена: добавлены модели `OtpCode`, `PushToken`, `PushNotification`, `PushTrigger`; `telegramId` сделан опциональным; `phone` стал обязательным
- `AuthContext` полностью переписан под SMS OTP (убрана Telegram initData логика)
- Создан SQL файл для миграции БД: `prisma/migration_webview.sql`

### Изменённые файлы:
- `prisma/schema.prisma`
- `prisma/migration_webview.sql` (новый)
- `packages/api/src/lib/jwt.ts` — убран telegramId из JwtPayload
- `packages/api/src/lib/auth.ts` — убран telegramId из middleware
- `packages/api/src/lib/alfasms.ts` (новый) — интеграция с AlfaSMS
- `packages/api/src/lib/adminAuth.ts` — добавлен alias `verifyAdminToken`
- `packages/api/src/routes/auth.ts` — полностью переписан (SMS OTP)
- `packages/api/src/routes/push.ts` (новый) — push уведомления
- `packages/api/src/index.ts` — зарегистрированы push роуты
- `packages/api/tsconfig.json` — добавлен `noImplicitAny: false`
- `packages/webapp/package.json` — Telegram → Capacitor
- `packages/webapp/vite.config.ts` — base: "./" для Capacitor
- `packages/webapp/capacitor.config.ts` (новый)
- `packages/webapp/src/main.tsx` — убрана Telegram Analytics
- `packages/webapp/src/App.tsx` — добавлен LoginPage, PendingRegistration flow
- `packages/webapp/src/context/AuthContext.tsx` — SMS OTP auth
- `packages/webapp/src/pages/LoginPage.tsx` (новый)
- `packages/webapp/src/pages/OnboardingPage.tsx` — убран telegramData, phone теперь проп
- `packages/webapp/src/pages/HomePage.tsx` — убран telegramData
- `packages/admin/src/api.ts` — добавлен `apiFetch` для не-admin роутов
- `packages/admin/src/App.tsx` — добавлен PushPage
- `packages/admin/src/components/Layout.tsx` — добавлен пункт «Рассылки»
- `packages/admin/src/pages/PushPage.tsx` (новый)

### Что нужно сделать на сервере:
1. Применить SQL миграцию: `psql -d anderson_loyalty -f prisma/migration_webview.sql`
2. Добавить env vars: `ALFASMS_API_KEY`, `ALFASMS_SENDER=AnderSon`, `FCM_SERVER_KEY` (опционально)
3. Для Capacitor нативной сборки: `cd packages/webapp && cap add android && cap add ios && cap sync`

-- Migration: webview-migration
-- Run this on the VPS: psql -d anderson_loyalty -f migration_webview.sql

-- 1. Make telegramId optional (nullable)
ALTER TABLE users ALTER COLUMN "telegramId" DROP NOT NULL;

-- 2. Make phone required (NOT NULL) — first set default for existing nulls
UPDATE users SET phone = '+70000000000_' || id WHERE phone IS NULL;
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- 3. Add pushTokens relation (new table)
CREATE TABLE push_tokens (
  id TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  platform TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

-- 4. OTP codes table
CREATE TABLE otp_codes (
  id TEXT NOT NULL PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX otp_codes_phone_idx ON otp_codes(phone);

-- 5. Push notifications table
CREATE TABLE push_notifications (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  "sentAt" TIMESTAMP(3),
  "sentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Push triggers table
CREATE TABLE push_triggers (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  event TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

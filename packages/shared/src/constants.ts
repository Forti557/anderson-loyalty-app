export const LOYALTY_LEVELS = [
  { level: 1, name: "Pal", nameRu: "Приятель", threshold: 0, cashback: 5 },
  { level: 2, name: "Friend", nameRu: "Друг", threshold: 2, cashback: 7 },
  { level: 3, name: "BestFriend", nameRu: "Любимый друг", threshold: 30_000, cashback: 10 },
  { level: 4, name: "Family", nameRu: "Почти родственник", threshold: 100_000, cashback: 15 },
] as const;

export const STAMPS_PER_CARD = 10;
export const MIN_CHECK_FOR_STAMP = 500;
export const QR_TTL_SECONDS = 60;
export const MAX_BONUS_REDEMPTION_PERCENT = 20;
export const BONUS_LIFETIME_DAYS = 180;
export const BONUS_EXPIRY_WARNING_DAYS = 14;
export const WELCOME_BONUS_AMOUNT = 200;
export const BIRTHDAY_BONUS_CASHBACK = 20;
export const BIRTHDAY_BONUS_DURATION_DAYS = 14;
export const EVENT_CANCEL_HOURS_BEFORE = 24;

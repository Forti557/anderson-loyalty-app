const API_URL = import.meta.env.VITE_API_URL || "";
const IS_DEV = import.meta.env.DEV;

type EventName =
  | "app_open"
  | "page_view"
  | "banner_click"
  | "story_open"
  | "story_complete"
  | "service_click"
  | "qr_open"
  | "menu_category"
  | "menu_item_view"
  | "profile_open"
  | "registration_start"
  | "registration_complete"
  | "stamp_card_view"
  | "event_view"
  | "event_book"
  | "loyalty_view"
  | "cake_select"
  | "cake_order_telegram"
  | "cake_order_call"
  | "catering_telegram"
  | "catering_call"
  | "party_call"
  | "party_telegram"
  | "party_calculator_open"
  | "party_request_submit"
  | "chat_button_click"
  | "chat_quick_action"
  | "chat_open_telegram";

interface AnalyticsEvent {
  event: EventName;
  props?: Record<string, string | number | boolean>;
}

const queue: AnalyticsEvent[] = [];
let flushTimer: ReturnType<typeof setTimeout> | undefined;
let token: string | null = null;

function getToken(): string | null {
  if (!token) token = localStorage.getItem("anderson_token");
  return token;
}

function flush() {
  if (queue.length === 0) return;
  const events = [...queue];
  queue.length = 0;

  const authToken = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

  fetch(`${API_URL}/api/v1/analytics/events`, {
    method: "POST",
    headers,
    body: JSON.stringify({ events }),
  }).catch(() => {
    // silently fail — analytics should never break the app
  });
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = undefined;
    flush();
  }, 2000);
}

export function track(event: EventName, props?: Record<string, string | number | boolean>) {
  if (IS_DEV) {
    console.log(`[analytics] ${event}`, props || "");
  }
  queue.push({ event, props });
  scheduleFlush();
}

export function setAuthToken(t: string | null) {
  token = t;
}

// Flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

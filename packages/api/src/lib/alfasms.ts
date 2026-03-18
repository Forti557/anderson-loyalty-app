// AlfaSMS HTTP API integration
// Docs: lk.alfasms.info
// Required env vars:
//   ALFASMS_API_KEY  — API key from lk.alfasms.info
//   ALFASMS_SENDER   — Sender name (AnderSon)

const API_KEY = process.env.ALFASMS_API_KEY || "";
const SENDER = process.env.ALFASMS_SENDER || "AnderSon";
const API_URL = "https://alfa.sms.ru/sms/send";

export async function sendSms(phone: string, text: string): Promise<void> {
  if (!API_KEY) {
    // Dev mode: just log
    console.log(`[AlfaSMS DEV] → ${phone}: ${text}`);
    return;
  }

  const params = new URLSearchParams({
    api_id: API_KEY,
    to: phone,
    msg: text,
    from: SENDER,
    json: "1",
  });

  const res = await fetch(`${API_URL}?${params.toString()}`);
  const data = await res.json() as any;

  // AlfaSMS returns status_code 100 on success
  if (data.status_code !== 100 && data.status !== "OK") {
    throw new Error(`AlfaSMS error: ${data.status || data.status_code}`);
  }
}

export function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

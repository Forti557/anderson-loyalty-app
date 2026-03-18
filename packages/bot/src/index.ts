import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(import.meta.dirname, "../../../.env") });
import { Bot, InlineKeyboard } from "grammy";

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN is not set — bot will not start. Set it in .env");
  process.exit(0);
}

const webappUrl = process.env.TELEGRAM_WEBAPP_URL;
if (!webappUrl) {
  console.warn("TELEGRAM_WEBAPP_URL is not set — bot will not start. Set it in .env");
  process.exit(0);
}

const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3000";

const bot = new Bot(token);

// /start — open Mini App
bot.command("start", async (ctx) => {
  const name = ctx.from?.first_name || "друг";
  const keyboard = new InlineKeyboard().webApp("Открыть Андерсон", webappUrl);

  await ctx.reply(
    `Привет, ${name}! Рады видеть вас в Андерсоне — кафе для больших маленьких!\n\n` +
      "Здесь вы можете копить бонусы, собирать штампы, записываться на мастер-классы " +
      "и быть в курсе всех больших маленьких поводов.\n\n" +
      "Дарим вам 200 приветственных бонусов — приятного начала!",
    { reply_markup: keyboard },
  );
});

// /balance — quick balance check
bot.command("balance", async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) return;

  try {
    const res = await fetch(`${apiBaseUrl}/api/v1/auth/telegram/${telegramId}`);
    if (!res.ok) {
      await ctx.reply(
        "Кажется, мы ещё не знакомы! Нажмите /start — и мы подарим вам 200 приветственных бонусов.",
      );
      return;
    }
    const { data } = await res.json();
    await ctx.reply(
      `На вашем счёте ${data.bonusBalance} бонусов\n` +
        `Ваш уровень: ${data.levelName} (кешбэк ${data.cashbackPercent}%)\n\n` +
        "Откройте приложение, чтобы узнать подробности!",
    );
  } catch {
    await ctx.reply("Ой, что-то пошло не так. Попробуйте чуть позже — мы всё починим!");
  }
});

// /qr — send QR as image
bot.command("qr", async (ctx) => {
  const keyboard = new InlineKeyboard().webApp("Показать QR-код", webappUrl);

  await ctx.reply(
    "Покажите этот QR-код официанту — и бонусы начислятся автоматически!",
    { reply_markup: keyboard },
  );
});

bot.start();
console.log("Bot started");

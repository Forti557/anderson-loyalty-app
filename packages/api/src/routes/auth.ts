import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { signToken, verifyToken } from "../lib/jwt.js";
import { sendSms, generateOtp } from "../lib/alfasms.js";
import { WELCOME_BONUS_AMOUNT, BONUS_LIFETIME_DAYS, LOYALTY_LEVELS } from "@anderson/shared";

const OTP_TTL_MINUTES = 5;

export async function authRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/send-otp
  // Sends SMS OTP to phone number
  app.post("/send-otp", async (request, reply) => {
    const { phone } = request.body as { phone: string };

    if (!phone || !/^\+?[0-9]{10,15}$/.test(phone.replace(/[\s\-()]/g, ""))) {
      return reply.status(400).send({ success: false, error: "Неверный формат номера телефона" });
    }

    const normalizedPhone = normalizePhone(phone);

    // Invalidate old OTPs for this phone
    await prisma.otpCode.updateMany({
      where: { phone: normalizedPhone, used: false },
      data: { used: true },
    });

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    await prisma.otpCode.create({
      data: { phone: normalizedPhone, code, expiresAt },
    });

    await sendSms(normalizedPhone, `Код подтверждения Андерсон: ${code}. Действителен ${OTP_TTL_MINUTES} минут.`);

    return { success: true, data: { message: "Код отправлен" } };
  });

  // POST /api/v1/auth/verify-otp
  // Verifies OTP, returns JWT if user exists, or temp token for registration
  app.post("/verify-otp", async (request, reply) => {
    const { phone, code } = request.body as { phone: string; code: string };

    if (!phone || !code) {
      return reply.status(400).send({ success: false, error: "phone и code обязательны" });
    }

    const normalizedPhone = normalizePhone(phone);

    const otp = await prisma.otpCode.findFirst({
      where: {
        phone: normalizedPhone,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      return reply.status(401).send({ success: false, error: "Неверный или истёкший код" });
    }

    // Mark OTP as used
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } });

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });

    if (user) {
      const token = signToken({ userId: user.id });
      return {
        success: true,
        data: {
          registered: true,
          token,
          user: { id: user.id, firstName: user.firstName },
        },
      };
    }

    // New user — return temp token for registration
    const tempToken = signToken({ userId: `new:${normalizedPhone}` });
    return {
      success: true,
      data: {
        registered: false,
        tempToken,
        phone: normalizedPhone,
      },
    };
  });

  // POST /api/v1/auth/register
  // Creates new user after OTP verification (tempToken required)
  app.post("/register", async (request, reply) => {
    const { tempToken, ...formData } = request.body as {
      tempToken: string;
      firstName: string;
      lastName?: string;
      phone: string;
      email?: string;
      birthday?: string;
      children?: { name: string; birthDate: string }[];
      privacyAccepted: boolean;
    };

    if (!tempToken) {
      return reply.status(401).send({ success: false, error: "Требуется подтверждение по SMS" });
    }

    const payload = verifyToken(tempToken);
    if (!payload || !payload.userId.startsWith("new:")) {
      return reply.status(401).send({ success: false, error: "Недействительный токен регистрации" });
    }

    const phone = normalizePhone(formData.phone);

    if (!formData.privacyAccepted) {
      return reply.status(400).send({ success: false, error: "Необходимо принять политику конфиденциальности" });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return reply.status(409).send({ success: false, error: "Пользователь уже зарегистрирован" });
    }

    const user = await prisma.user.create({
      data: {
        phone,
        firstName: formData.firstName,
        lastName: formData.lastName || null,
        email: formData.email || null,
        birthday: formData.birthday ? new Date(formData.birthday) : null,
        bonusBalance: WELCOME_BONUS_AMOUNT,
        privacyAccepted: true,
        onboardingDone: true,
        children: formData.children?.length
          ? {
              createMany: {
                data: formData.children.map((c) => ({
                  name: c.name,
                  birthDate: new Date(c.birthDate),
                })),
              },
            }
          : undefined,
        stampCards: { create: {} },
        transactions: {
          create: {
            type: "WELCOME_BONUS",
            amount: 0,
            bonuses: WELCOME_BONUS_AMOUNT,
            description: "Добро пожаловать в семью Андерсон! 🎉",
            expiresAt: new Date(Date.now() + BONUS_LIFETIME_DAYS * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    const token = signToken({ userId: user.id });
    return {
      success: true,
      data: { token, user: { id: user.id, firstName: user.firstName } },
    };
  });

  // GET /api/v1/auth/balance/:phone — internal: get user balance by phone
  app.get("/balance/:phone", async (request, reply) => {
    const { phone } = request.params as { phone: string };
    const normalizedPhone = normalizePhone(decodeURIComponent(phone));

    const user = await prisma.user.findUnique({ where: { phone: normalizedPhone } });

    if (!user) {
      return reply.status(404).send({ success: false, error: "Пользователь не найден" });
    }

    const level = LOYALTY_LEVELS.find((l) => l.level === user.level) ?? LOYALTY_LEVELS[0];

    return {
      success: true,
      data: {
        bonusBalance: user.bonusBalance,
        levelName: level.nameRu,
        cashbackPercent: level.cashback,
        level: user.level,
      },
    };
  });
}

function normalizePhone(phone: string): string {
  let normalized = phone.replace(/[\s\-()]/g, "");
  if (normalized.startsWith("8") && normalized.length === 11) {
    normalized = "+7" + normalized.slice(1);
  }
  if (/^7\d{10}$/.test(normalized)) {
    normalized = "+" + normalized;
  }
  return normalized;
}

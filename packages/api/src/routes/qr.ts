import { randomBytes, createHmac } from "node:crypto";
import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import { QR_TTL_SECONDS } from "@anderson/shared";

const QR_SECRET = process.env.QR_SECRET || "anderson-qr-secret-change-me";

function signQrPayload(userId: string, token: string, expiresAt: number): string {
  const data = `${userId}:${token}:${expiresAt}`;
  return createHmac("sha256", QR_SECRET).update(data).digest("hex");
}

export async function qrRoutes(app: FastifyInstance) {
  // POST /api/v1/qr/generate — JWT protected
  app.post("/generate", { preHandler: authenticate }, async (request) => {
    const userId = (request as any).userId as string;

    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + QR_TTL_SECONDS * 1000);
    const signature = signQrPayload(userId, token, expiresAt.getTime());

    // Clean up old expired QR codes for this user
    await prisma.qrCode.deleteMany({
      where: { userId, expiresAt: { lt: new Date() } },
    });

    const qr = await prisma.qrCode.create({
      data: { userId, token, expiresAt },
    });

    return {
      success: true,
      data: {
        token: qr.token,
        signature,
        expiresAt: qr.expiresAt.toISOString(),
        ttl: QR_TTL_SECONDS,
      },
    };
  });

  // GET /api/v1/qr/validate/:token — for POS/staff to scan
  app.get("/validate/:token", async (request, reply) => {
    const { token } = request.params as { token: string };

    const qr = await prisma.qrCode.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!qr || qr.expiresAt < new Date()) {
      return reply.status(400).send({ success: false, error: "QR code expired or invalid" });
    }

    return {
      success: true,
      data: {
        userId: qr.userId,
        telegramId: Number(qr.user.telegramId),
        firstName: qr.user.firstName,
        level: qr.user.level,
        bonusBalance: qr.user.bonusBalance,
      },
    };
  });
}

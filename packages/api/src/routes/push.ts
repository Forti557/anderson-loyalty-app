import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import { verifyAdminToken } from "../lib/adminAuth.js";

export async function pushRoutes(app: FastifyInstance) {
  // POST /api/v1/push/register-token — save device push token (JWT protected)
  app.post("/register-token", { preHandler: authenticate }, async (request, reply) => {
    const userId = (request as any).userId as string;
    const { token, platform } = request.body as { token: string; platform: string };

    if (!token || !platform) {
      return reply.status(400).send({ success: false, error: "token и platform обязательны" });
    }

    await prisma.pushToken.upsert({
      where: { token },
      update: { userId, platform, updatedAt: new Date() },
      create: { userId, token, platform },
    });

    return { success: true };
  });

  // DELETE /api/v1/push/register-token — remove push token on logout (JWT protected)
  app.delete("/register-token", { preHandler: authenticate }, async (request, reply) => {
    const { token } = request.body as { token: string };
    if (token) {
      await prisma.pushToken.deleteMany({ where: { token } });
    }
    return { success: true };
  });

  // === Admin push endpoints ===

  // GET /api/v1/push/notifications — list all push notifications
  app.get("/notifications", { preHandler: verifyAdminToken }, async (request, reply) => {
    const notifications = await prisma.pushNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return { success: true, data: notifications };
  });

  // POST /api/v1/push/notifications — create and optionally send notification
  app.post("/notifications", { preHandler: verifyAdminToken }, async (request, reply) => {
    const { title, body, data, sendNow } = request.body as {
      title: string;
      body: string;
      data?: Record<string, any>;
      sendNow?: boolean;
    };

    const notification = await prisma.pushNotification.create({
      data: {
        title,
        body,
        data: data ? JSON.stringify(data) : null,
        status: "draft",
      },
    });

    if (sendNow) {
      await sendPushToAll(notification.id, title, body, data);
    }

    return { success: true, data: notification };
  });

  // POST /api/v1/push/notifications/:id/send — send existing draft notification
  app.post("/notifications/:id/send", { preHandler: verifyAdminToken }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const notification = await prisma.pushNotification.findUnique({ where: { id } });
    if (!notification) {
      return reply.status(404).send({ success: false, error: "Уведомление не найдено" });
    }

    await sendPushToAll(
      id,
      notification.title,
      notification.body,
      notification.data ? JSON.parse(notification.data) : undefined,
    );

    return { success: true };
  });

  // GET /api/v1/push/triggers — list auto-triggers
  app.get("/triggers", { preHandler: verifyAdminToken }, async () => {
    const triggers = await prisma.pushTrigger.findMany({ orderBy: { createdAt: "asc" } });
    return { success: true, data: triggers };
  });

  // POST /api/v1/push/triggers — create trigger
  app.post("/triggers", { preHandler: verifyAdminToken }, async (request, reply) => {
    const { name, event, title, body } = request.body as {
      name: string;
      event: string;
      title: string;
      body: string;
    };

    const trigger = await prisma.pushTrigger.create({
      data: { name, event, title, body, isActive: true },
    });
    return { success: true, data: trigger };
  });

  // PUT /api/v1/push/triggers/:id — update trigger
  app.put("/triggers/:id", { preHandler: verifyAdminToken }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const updates = request.body as Partial<{
      name: string;
      event: string;
      title: string;
      body: string;
      isActive: boolean;
    }>;

    const trigger = await prisma.pushTrigger.update({ where: { id }, data: updates });
    return { success: true, data: trigger };
  });

  // DELETE /api/v1/push/triggers/:id — delete trigger
  app.delete("/triggers/:id", { preHandler: verifyAdminToken }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.pushTrigger.delete({ where: { id } });
    return { success: true };
  });
}

// Send push notification to all registered tokens
async function sendPushToAll(
  notificationId: string,
  title: string,
  body: string,
  data?: Record<string, any>,
): Promise<void> {
  const tokens = await prisma.pushToken.findMany({ select: { token: true, platform: true } });

  const FCM_KEY = process.env.FCM_SERVER_KEY;

  if (!FCM_KEY) {
    console.log(`[Push DEV] Would send "${title}" to ${tokens.length} devices`);
    await prisma.pushNotification.update({
      where: { id: notificationId },
      data: { status: "sent", sentAt: new Date(), sentCount: tokens.length },
    });
    return;
  }

  // Send via FCM HTTP v1 API (legacy HTTP for simplicity)
  const fcmTokens = tokens.map((t) => t.token);
  let sentCount = 0;

  // Batch in groups of 500 (FCM limit)
  for (let i = 0; i < fcmTokens.length; i += 500) {
    const batch = fcmTokens.slice(i, i + 500);
    try {
      const res = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${FCM_KEY}`,
        },
        body: JSON.stringify({
          registration_ids: batch,
          notification: { title, body },
          data: data || {},
        }),
      });
      const json = await res.json() as any;
      sentCount += json.success || 0;
    } catch (err) {
      console.error("[Push] FCM batch error:", err);
    }
  }

  await prisma.pushNotification.update({
    where: { id: notificationId },
    data: { status: "sent", sentAt: new Date(), sentCount },
  });
}

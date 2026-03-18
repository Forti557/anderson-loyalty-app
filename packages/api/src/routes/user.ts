import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";
import { LOYALTY_LEVELS } from "@anderson/shared";

export async function userRoutes(app: FastifyInstance) {
  // All routes require authentication
  app.addHook("onRequest", authenticate);

  // GET /api/v1/users/profile
  app.get("/profile", async (request, reply) => {
    const userId = (request as any).userId;

    const [user, activeCard] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: { children: true },
      }),
      prisma.stampCard.findFirst({
        where: { userId, completed: false },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    if (!user) {
      return reply.status(404).send({ success: false, error: "User not found" });
    }

    const currentLevel = LOYALTY_LEVELS.find((l) => l.level === user.level) ?? LOYALTY_LEVELS[0];
    const nextLevel = LOYALTY_LEVELS.find((l) => l.level === user.level + 1);

    return {
      success: true,
      data: {
        id: user.id,
        telegramId: Number(user.telegramId),
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        birthday: user.birthday?.toISOString() ?? null,
        level: user.level,
        levelName: currentLevel.nameRu,
        cashbackPercent: currentLevel.cashback,
        bonusBalance: user.bonusBalance,
        totalSpent: user.totalSpent,
        nextLevelThreshold: nextLevel?.threshold ?? null,
        homeRestaurant: user.homeRestaurant,
        children: user.children.map((c) => ({
          id: c.id,
          name: c.name,
          birthDate: c.birthDate.toISOString(),
        })),
        stampsCollected: activeCard?.stampsCount ?? 0,
        onboardingDone: user.onboardingDone,
      },
    };
  });

  // PUT /api/v1/users/profile
  app.put("/profile", async (request, reply) => {
    const userId = (request as any).userId;
    const body = request.body as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      birthday?: string;
      homeRestaurant?: string;
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.phone !== undefined && { phone: body.phone }),
        ...(body.email !== undefined && { email: body.email || null }),
        ...(body.birthday !== undefined && { birthday: body.birthday ? new Date(body.birthday) : null }),
        ...(body.homeRestaurant !== undefined && { homeRestaurant: body.homeRestaurant }),
      },
      include: { children: true },
    });

    return { success: true, data: { id: user.id } };
  });

  // POST /api/v1/users/children
  app.post("/children", async (request, reply) => {
    const userId = (request as any).userId;
    const { name, birthDate } = request.body as { name: string; birthDate: string };

    const child = await prisma.child.create({
      data: { userId, name, birthDate: new Date(birthDate) },
    });

    return { success: true, data: { id: child.id, name: child.name, birthDate: child.birthDate.toISOString() } };
  });

  // DELETE /api/v1/users/children/:childId
  app.delete("/children/:childId", async (request, reply) => {
    const userId = (request as any).userId;
    const { childId } = request.params as { childId: string };

    // Verify child belongs to user
    const child = await prisma.child.findFirst({ where: { id: childId, userId } });
    if (!child) {
      return reply.status(404).send({ success: false, error: "Child not found" });
    }

    await prisma.child.delete({ where: { id: childId } });
    return { success: true };
  });

  // GET /api/v1/users/transactions — transaction history
  app.get("/transactions", async (request, reply) => {
    const userId = (request as any).userId;
    const query = request.query as { type?: string; limit?: string; offset?: string };

    const where: any = { userId };
    if (query.type === "accrual") {
      where.type = { in: ["ACCRUAL", "WELCOME_BONUS", "BIRTHDAY_BONUS"] };
    } else if (query.type === "redemption") {
      where.type = { in: ["REDEMPTION", "EXPIRED"] };
    }

    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      success: true,
      data: {
        transactions: transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          bonuses: t.bonuses,
          description: t.description,
          restaurant: t.restaurant,
          expiresAt: t.expiresAt?.toISOString() ?? null,
          createdAt: t.createdAt.toISOString(),
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  });
}

import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { adminAuthenticate } from "../lib/adminAuth.js";
import { LOYALTY_LEVELS } from "@anderson/shared";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "anderson-admin-2026";

export async function adminRoutes(app: FastifyInstance) {
  // ── Login ──
  app.post("/login", async (request, reply) => {
    const { password } = request.body as { password: string };

    if (password !== ADMIN_PASSWORD) {
      return reply.status(401).send({ success: false, error: "Invalid password" });
    }

    const token = signToken({
      userId: "admin",
      role: "admin",
    });

    return { success: true, data: { token } };
  });

  // All routes below require admin auth
  app.addHook("onRequest", async (request, reply) => {
    // Skip login route
    if (request.url.endsWith("/login") && request.method === "POST") return;
    return adminAuthenticate(request, reply);
  });

  // ── Dashboard ──
  app.get("/dashboard", async () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersToday,
      usersThisWeek,
      totalBonuses,
      totalEvents,
      recentSignups,
      levelDistribution,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.aggregate({ _sum: { bonusBalance: true } }),
      prisma.event.count(),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          phone: true,
          level: true,
          bonusBalance: true,
          createdAt: true,
        },
      }),
      prisma.user.groupBy({
        by: ["level"],
        _count: true,
      }),
    ]);

    // Signups per day for last 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const signupsRaw = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    });

    const signupsPerDay: Record<string, number> = {};
    for (let d = new Date(thirtyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      signupsPerDay[d.toISOString().slice(0, 10)] = 0;
    }
    for (const u of signupsRaw) {
      const key = u.createdAt.toISOString().slice(0, 10);
      if (signupsPerDay[key] !== undefined) signupsPerDay[key]++;
    }

    return {
      success: true,
      data: {
        totalUsers,
        usersToday,
        usersThisWeek,
        totalBonuses: totalBonuses._sum.bonusBalance ?? 0,
        totalEvents,
        recentSignups: recentSignups.map((u) => ({
          ...u,
          createdAt: u.createdAt.toISOString(),
        })),
        levelDistribution: levelDistribution.map((l) => ({
          level: l.level,
          name: LOYALTY_LEVELS.find((ll) => ll.level === l.level)?.nameRu ?? `Level ${l.level}`,
          count: l._count,
        })),
        signupsChart: Object.entries(signupsPerDay).map(([date, count]) => ({ date, count })),
      },
    };
  });

  // ── Users ──
  app.get("/users", async (request) => {
    const query = request.query as {
      search?: string;
      level?: string;
      sort?: string;
      order?: string;
      limit?: string;
      offset?: string;
    };

    const where: any = {};
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: "insensitive" } },
        { lastName: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search } },
      ];
    }
    if (query.level) where.level = Number(query.level);

    const orderBy: any = {};
    const sortField = query.sort || "createdAt";
    orderBy[sortField] = query.order === "asc" ? "asc" : "desc";

    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        select: {
          id: true,
          telegramId: true,
          firstName: true,
          lastName: true,
          phone: true,
          level: true,
          bonusBalance: true,
          totalSpent: true,
          createdAt: true,
          _count: { select: { children: true, transactions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users: users.map((u) => ({
          ...u,
          telegramId: Number(u.telegramId),
          createdAt: u.createdAt.toISOString(),
          childrenCount: u._count.children,
          transactionsCount: u._count.transactions,
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  });

  app.get("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        children: true,
        transactions: { orderBy: { createdAt: "desc" }, take: 20 },
        stampCards: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return reply.status(404).send({ success: false, error: "User not found" });
    }

    const level = LOYALTY_LEVELS.find((l) => l.level === user.level) ?? LOYALTY_LEVELS[0];

    return {
      success: true,
      data: {
        id: user.id,
        telegramId: Number(user.telegramId),
        telegramUsername: user.telegramUsername,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        email: user.email,
        birthday: user.birthday?.toISOString() ?? null,
        level: user.level,
        levelName: level.nameRu,
        cashbackPercent: level.cashback,
        bonusBalance: user.bonusBalance,
        totalSpent: user.totalSpent,
        homeRestaurant: user.homeRestaurant,
        createdAt: user.createdAt.toISOString(),
        children: user.children.map((c) => ({
          id: c.id,
          name: c.name,
          birthDate: c.birthDate.toISOString(),
        })),
        transactions: user.transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: t.amount,
          bonuses: t.bonuses,
          description: t.description,
          restaurant: t.restaurant,
          createdAt: t.createdAt.toISOString(),
        })),
        stampCards: user.stampCards.map((s) => ({
          id: s.id,
          stampsCount: s.stampsCount,
          completed: s.completed,
          createdAt: s.createdAt.toISOString(),
        })),
      },
    };
  });

  // ── Events CRUD ──
  app.get("/events", async (request) => {
    const query = request.query as { limit?: string; offset?: string };
    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.event.count(),
    ]);

    return {
      success: true,
      data: {
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          imageUrl: e.imageUrl,
          restaurant: e.restaurant,
          date: e.date.toISOString(),
          duration: e.duration,
          ageMin: e.ageMin,
          ageMax: e.ageMax,
          price: e.price,
          capacity: e.capacity,
          bookedCount: e.bookedCount,
          isActive: e.isActive,
          createdAt: e.createdAt.toISOString(),
        })),
        total,
      },
    };
  });

  app.post("/events", async (request) => {
    const body = request.body as {
      title: string;
      description?: string;
      date: string;
      restaurant: string;
      duration?: number;
      ageMin?: number;
      ageMax?: number;
      price: number;
      capacity: number;
      imageUrl?: string;
    };

    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description || "",
        date: new Date(body.date),
        restaurant: body.restaurant,
        duration: body.duration ?? 60,
        ageMin: body.ageMin ?? null,
        ageMax: body.ageMax ?? null,
        price: body.price,
        capacity: body.capacity,
        imageUrl: body.imageUrl || null,
        isActive: true,
      },
    });

    return {
      success: true,
      data: { id: event.id },
    };
  });

  app.put("/events/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as {
      title?: string;
      description?: string;
      type?: string;
      date?: string;
      restaurant?: string;
      duration?: number;
      ageMin?: number;
      ageMax?: number;
      price?: number;
      capacity?: number;
      imageUrl?: string;
      isActive?: boolean;
    };

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Event not found" });
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.restaurant !== undefined && { restaurant: body.restaurant }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.ageMin !== undefined && { ageMin: body.ageMin }),
        ...(body.ageMax !== undefined && { ageMax: body.ageMax }),
        ...(body.price !== undefined && { price: body.price }),
        ...(body.capacity !== undefined && { capacity: body.capacity }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return { success: true, data: { id: event.id } };
  });

  app.delete("/events/:id", async (request, reply) => {
    const { id } = request.params as { id: string };

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Event not found" });
    }

    await prisma.event.update({ where: { id }, data: { isActive: false } });
    return { success: true };
  });

  // ── Transactions ──
  app.get("/transactions", async (request) => {
    const query = request.query as {
      type?: string;
      userId?: string;
      limit?: string;
      offset?: string;
    };

    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.userId) where.userId = query.userId;

    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
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
          createdAt: t.createdAt.toISOString(),
          user: t.user,
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  });

  // ── Party Requests ──
  app.get("/party-requests", async (request) => {
    const query = request.query as {
      status?: string;
      limit?: string;
      offset?: string;
    };

    const where: any = {};
    if (query.status) where.status = query.status;

    const limit = Math.min(Number(query.limit) || 50, 100);
    const offset = Number(query.offset) || 0;

    const [requests, total] = await Promise.all([
      prisma.partyRequest.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          user: { select: { firstName: true, lastName: true, phone: true } },
        },
      }),
      prisma.partyRequest.count({ where }),
    ]);

    return {
      success: true,
      data: {
        requests: requests.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          childName: r.childName,
          childAge: r.childAge,
          date: r.date?.toISOString() ?? null,
          guestsCount: r.guestsCount,
          program: r.program,
          wishes: r.wishes,
          restaurant: r.restaurant,
          status: r.status,
          total: r.total,
          createdAt: r.createdAt.toISOString(),
          user: r.user,
        })),
        total,
        hasMore: offset + limit < total,
      },
    };
  });

  app.put("/party-requests/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { status?: string };

    const existing = await prisma.partyRequest.findUnique({ where: { id } });
    if (!existing) {
      return reply.status(404).send({ success: false, error: "Request not found" });
    }

    const updated = await prisma.partyRequest.update({
      where: { id },
      data: {
        ...(body.status !== undefined && { status: body.status as any }),
      },
    });

    return { success: true, data: { id: updated.id, status: updated.status } };
  });

  // ── Analytics ──
  app.get("/analytics", async () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalTransactions,
      totalBonusesAccrued,
      totalBonusesRedeemed,
      topEvents,
    ] = await Promise.all([
      prisma.transaction.count(),
      prisma.transaction.aggregate({
        where: { type: { in: ["ACCRUAL", "WELCOME_BONUS", "BIRTHDAY_BONUS"] } },
        _sum: { bonuses: true },
      }),
      prisma.transaction.aggregate({
        where: { type: "REDEMPTION" },
        _sum: { bonuses: true },
      }),
      prisma.event.findMany({
        where: { isActive: true },
        orderBy: { date: "desc" },
        take: 10,
        select: {
          id: true,
          title: true,
          restaurant: true,
          date: true,
          capacity: true,
          bookedCount: true,
        },
      }),
    ]);

    return {
      success: true,
      data: {
        totalTransactions,
        totalBonusesAccrued: totalBonusesAccrued._sum.bonuses ?? 0,
        totalBonusesRedeemed: Math.abs(totalBonusesRedeemed._sum.bonuses ?? 0),
        topEvents: topEvents.map((e) => ({
          ...e,
          date: e.date.toISOString(),
          booked: e.bookedCount,
        })),
      },
    };
  });
}

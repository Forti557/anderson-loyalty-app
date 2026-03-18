import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { verifyToken } from "../lib/jwt.js";

interface AnalyticsEvent {
  event: string;
  props?: Record<string, string | number | boolean>;
}

interface EventsBody {
  events: AnalyticsEvent[];
}

export async function analyticsRoutes(app: FastifyInstance) {
  // POST /events — batch insert analytics events
  app.post<{ Body: EventsBody }>("/events", async (request, reply) => {
    const { events } = request.body || {};
    if (!Array.isArray(events) || events.length === 0) {
      return reply.status(400).send({ success: false, error: "No events" });
    }

    // Cap batch size
    const batch = events.slice(0, 50);

    // Try to extract userId from token (optional — anonymous events are ok)
    let userId: string | null = null;
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const payload = verifyToken(authHeader.slice(7));
      if (payload) userId = payload.userId;
    }

    const sessionId = (request.headers["x-session-id"] as string) || null;
    const userAgent = request.headers["user-agent"] || null;
    const ip = request.ip;

    try {
      await prisma.analyticsEvent.createMany({
        data: batch.map((e) => ({
          userId,
          sessionId,
          event: e.event,
          props: e.props ? JSON.stringify(e.props) : null,
          userAgent,
          ip,
        })),
      });
    } catch (err) {
      app.log.error(err, "Failed to save analytics events");
    }

    return { success: true };
  });

  // GET /stats — basic stats for admin (protected by token)
  app.get("/stats", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return reply.status(401).send({ success: false, error: "Unauthorized" });
    }

    try {
      const [totalEvents, totalUsers, eventCounts, dailyActive] = await Promise.all([
        prisma.analyticsEvent.count(),
        prisma.analyticsEvent.groupBy({ by: ["userId"], where: { userId: { not: null } } }).then((r) => r.length),
        prisma.analyticsEvent.groupBy({ by: ["event"], _count: { event: true }, orderBy: { _count: { event: "desc" } }, take: 20 }),
        prisma.analyticsEvent.groupBy({
          by: ["userId"],
          where: {
            userId: { not: null },
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        }).then((r) => r.length),
      ]);

      return {
        success: true,
        data: {
          totalEvents,
          totalUsers,
          dailyActiveUsers: dailyActive,
          topEvents: eventCounts.map((e) => ({ event: e.event, count: e._count.event })),
        },
      };
    } catch (err) {
      app.log.error(err, "Failed to get analytics stats");
      return reply.status(500).send({ success: false, error: "Internal error" });
    }
  });
}

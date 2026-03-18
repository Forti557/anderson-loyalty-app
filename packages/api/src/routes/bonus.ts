import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function bonusRoutes(app: FastifyInstance) {
  // GET /api/v1/bonuses/:userId — transaction history
  app.get("/:userId", async (request, reply) => {
    const { userId } = request.params as { userId: string };
    const { type, limit = "50", offset = "0" } = request.query as {
      type?: string;
      limit?: string;
      offset?: string;
    };

    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: Number(limit),
      skip: Number(offset),
    });

    return {
      success: true,
      data: transactions.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        bonuses: t.bonuses,
        description: t.description,
        restaurant: t.restaurant,
        expiresAt: t.expiresAt?.toISOString(),
        createdAt: t.createdAt.toISOString(),
      })),
    };
  });
}

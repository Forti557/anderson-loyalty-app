import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function stampRoutes(app: FastifyInstance) {
  // GET /api/v1/stamps/:userId — current stamp card
  app.get("/:userId", async (request) => {
    const { userId } = request.params as { userId: string };

    let card = await prisma.stampCard.findFirst({
      where: { userId, completed: false },
      include: { stamps: { orderBy: { createdAt: "asc" } } },
    });

    if (!card) {
      card = await prisma.stampCard.create({
        data: { userId },
        include: { stamps: { orderBy: { createdAt: "asc" } } },
      });
    }

    return {
      success: true,
      data: {
        id: card.id,
        stampsCount: card.stampsCount,
        completed: card.completed,
        giftClaimed: card.giftClaimed,
        stamps: card.stamps.map((s) => ({
          id: s.id,
          restaurant: s.restaurant,
          amount: s.amount,
          createdAt: s.createdAt.toISOString(),
        })),
      },
    };
  });
}

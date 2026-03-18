import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../lib/auth.js";

export async function partyRoutes(app: FastifyInstance) {
  // Submit party request (authenticated user or guest)
  app.post("/", async (request, reply) => {
    const body = request.body as {
      name: string;
      phone: string;
      childName?: string;
      childAge?: number;
      date?: string;
      guestsCount?: number;
      program?: string;
      wishes?: string;
      restaurant?: string;
      total?: number;
    };

    if (!body.name || !body.phone) {
      return reply.status(400).send({ success: false, error: "Name and phone are required" });
    }

    // Try to get userId from JWT if present
    let userId: string | null = null;
    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const { verifyToken } = await import("../lib/jwt.js");
        const payload = verifyToken(authHeader.slice(7));
        if (payload?.userId) userId = payload.userId;
      } catch {
        // No auth — that's fine, guest submission
      }
    }

    const partyRequest = await prisma.partyRequest.create({
      data: {
        userId,
        name: body.name,
        phone: body.phone,
        childName: body.childName || null,
        childAge: body.childAge ?? null,
        date: body.date ? new Date(body.date) : null,
        guestsCount: body.guestsCount ?? null,
        program: body.program || null,
        wishes: body.wishes || null,
        restaurant: body.restaurant || null,
        total: body.total ?? null,
      },
    });

    return { success: true, data: { id: partyRequest.id } };
  });
}

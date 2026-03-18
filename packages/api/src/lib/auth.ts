import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "./jwt.js";

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ success: false, error: "No token provided" });
  }

  const payload = verifyToken(authHeader.slice(7));
  if (!payload) {
    return reply.status(401).send({ success: false, error: "Invalid token" });
  }

  (request as any).userId = payload.userId;
}

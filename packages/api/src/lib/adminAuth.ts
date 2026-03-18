import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "./jwt.js";

export async function adminAuthenticate(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ success: false, error: "Missing authorization" });
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload || payload.role !== "admin") {
    return reply.status(403).send({ success: false, error: "Admin access required" });
  }

  (request as any).adminRole = true;
}

export const verifyAdminToken = adminAuthenticate;

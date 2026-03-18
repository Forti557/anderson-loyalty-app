import { config } from "dotenv";
import { resolve } from "node:path";
config({ path: resolve(import.meta.dirname, "../../../.env") });
import { existsSync } from "node:fs";
import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyStatic from "@fastify/static";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";
import { bonusRoutes } from "./routes/bonus.js";
import { stampRoutes } from "./routes/stamp.js";
import { eventRoutes } from "./routes/event.js";
import { qrRoutes } from "./routes/qr.js";
import { webhookRoutes } from "./routes/webhook.js";
import { analyticsRoutes } from "./routes/analytics.js";
import { adminRoutes } from "./routes/admin.js";
import { partyRoutes } from "./routes/party.js";
import { pushRoutes } from "./routes/push.js";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true,
});

// API v1 routes
app.register(authRoutes, { prefix: "/api/v1/auth" });
app.register(userRoutes, { prefix: "/api/v1/users" });
app.register(bonusRoutes, { prefix: "/api/v1/bonuses" });
app.register(stampRoutes, { prefix: "/api/v1/stamps" });
app.register(eventRoutes, { prefix: "/api/v1/events" });
app.register(qrRoutes, { prefix: "/api/v1/qr" });
app.register(webhookRoutes, { prefix: "/api/v1/webhooks" });
app.register(analyticsRoutes, { prefix: "/api/v1/analytics" });
app.register(adminRoutes, { prefix: "/api/v1/admin" });
app.register(partyRoutes, { prefix: "/api/v1/party-requests" });
app.register(pushRoutes, { prefix: "/api/v1/push" });

// Serve admin panel static files
const adminDistPath = resolve(import.meta.dirname, "../../admin/dist");
if (existsSync(adminDistPath)) {
  app.register(fastifyStatic, {
    root: adminDistPath,
    prefix: "/admin/",
    decorateReply: false,
  });
  // SPA fallback for admin routes
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith("/admin")) {
      return reply.sendFile("index.html", adminDistPath);
    }
    reply.status(404).send({ success: false, error: "Not found" });
  });
}

// Health check
app.get("/health", async () => ({ status: "ok" }));

const port = Number(process.env.API_PORT) || 3000;
const host = process.env.API_HOST || "0.0.0.0";

try {
  await app.listen({ port, host });
  app.log.info(`Server running at http://${host}:${port}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

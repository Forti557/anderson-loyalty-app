import { FastifyInstance } from "fastify";

export async function webhookRoutes(app: FastifyInstance) {
  // POST /api/v1/webhooks/iiko — receive order updates from iiko
  app.post("/iiko", async (request) => {
    // TODO: implement iiko webhook handler
    // - validate signature
    // - process order close event
    // - accrue bonuses via Mindbox
    // - create stamp if check >= 500
    return { success: true };
  });

  // POST /api/v1/webhooks/mindbox — receive balance updates from Mindbox
  app.post("/mindbox", async (request) => {
    // TODO: implement Mindbox webhook handler
    // - validate signature
    // - update local bonus balance
    // - send notification via bot
    return { success: true };
  });
}

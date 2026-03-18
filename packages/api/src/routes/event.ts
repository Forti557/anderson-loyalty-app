import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { EVENT_CANCEL_HOURS_BEFORE } from "@anderson/shared";

const FEED_URL = "https://cafe-anderson.ru/events-calendar/events-feed.php";
const FEED_CACHE_TTL = 5 * 60 * 1000; // 5 min
let feedCache: { data: FeedEvent[]; at: number } | null = null;

const CAFE_NAMES: Record<number, { name: string; lat: number; lng: number }> = {
  371:    { name: "Сокол",              lat: 55.8054, lng: 37.5149 },
  372:    { name: "Маршала Бирюзова",   lat: 55.7933, lng: 37.4988 },
  379:    { name: "Воронцовский парк",  lat: 55.6812, lng: 37.5709 },
  381:    { name: "Обручева",           lat: 55.6594, lng: 37.5447 },
  386:    { name: "Шуваловский",        lat: 55.7016, lng: 37.5064 },
  388:    { name: "Гиляровского",       lat: 55.7813, lng: 37.6336 },
  402:    { name: "Медведково",         lat: 55.8872, lng: 37.6594 },
  411:    { name: "Кропоткинская",      lat: 55.7449, lng: 37.6033 },
  120806: { name: "Бутово",            lat: 55.5434, lng: 37.5341 },
  131807: { name: "Льва Толстого",     lat: 55.7351, lng: 37.5878 },
  134309: { name: "Фили",              lat: 55.7473, lng: 37.4871 },
};

interface FeedEvent {
  id: string;
  name: string;
  dateFrom: string;
  dateTo: string;
  image: string;
  age: string;
  holidayType: string;
  denyPayment: boolean;
  description: string;
  price: number;
  cafeId: number;
  cafeName: string;
  tickets: number;
  lat: number;
  lng: number;
}

function parseDate(str: string): string {
  // "13.03.2026 11:00:00" → ISO
  const [datePart, timePart] = str.split(" ");
  if (!datePart) return str;
  const [d, m, y] = datePart.split(".");
  return `${y}-${m}-${d}${timePart ? "T" + timePart : ""}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTag(xml: string, tag: string): string {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(xml);
  return m ? m[1].trim() : "";
}

async function fetchFeed(): Promise<FeedEvent[]> {
  if (feedCache && Date.now() - feedCache.at < FEED_CACHE_TTL) {
    return feedCache.data;
  }

  const res = await fetch(FEED_URL);
  const xml = await res.text();

  const results: FeedEvent[] = [];
  const eventRegex = /<event>([\s\S]*?)<\/event>/g;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = eventRegex.exec(xml)) !== null) {
    const ev = match[1];

    // Collect all cafes for this event
    const cafes: Array<{ id: number; tickets: number }> = [];
    const cafeRegex = /<cafe>([\s\S]*?)<\/cafe>/g;
    let cm: RegExpExecArray | null;
    while ((cm = cafeRegex.exec(ev)) !== null) {
      cafes.push({
        id: parseInt(getTag(cm[1], "id")) || 0,
        tickets: parseInt(getTag(cm[1], "tickets")) || 0,
      });
    }

    const name = getTag(ev, "name");
    const dateFrom = parseDate(getTag(ev, "date_from"));
    const dateTo = parseDate(getTag(ev, "date_to"));
    const image = getTag(ev, "image");
    const age = getTag(ev, "age");
    const holidayType = getTag(ev, "holiday_type");
    const denyPayment = getTag(ev, "deny_payment") === "Y";
    const description = stripHtml(getTag(ev, "detail_text"));
    const price = parseFloat(getTag(ev, "price")) || 0;

    for (const cafe of cafes) {
      const cafeInfo = CAFE_NAMES[cafe.id] ?? { name: "Андерсон", lat: 55.751, lng: 37.618 };
      results.push({
        id: `feed-${idx++}`,
        name,
        dateFrom,
        dateTo,
        image,
        age,
        holidayType,
        denyPayment,
        description,
        price,
        cafeId: cafe.id,
        cafeName: `Андерсон ${cafeInfo.name}`,
        tickets: cafe.tickets,
        lat: cafeInfo.lat,
        lng: cafeInfo.lng,
      });
    }
  }

  // Sort by date, keep only future events
  const now = new Date();
  const future = results.filter((e) => new Date(e.dateFrom) >= now);
  future.sort((a, b) => new Date(a.dateFrom).getTime() - new Date(b.dateFrom).getTime());

  feedCache = { data: future, at: Date.now() };
  return future;
}

export async function eventRoutes(app: FastifyInstance) {
  // GET /api/v1/events/feed — proxy from cafe-anderson.ru
  app.get("/feed", async (_request, reply) => {
    try {
      const events = await fetchFeed();
      return { success: true, data: events };
    } catch (err) {
      app.log.error(err);
      return reply.status(502).send({ success: false, error: "Feed unavailable" });
    }
  });

  // GET /api/v1/events — list upcoming events
  app.get("/", async (request) => {
    const { restaurant, from, to } = request.query as {
      restaurant?: string;
      from?: string;
      to?: string;
    };

    const where: Record<string, unknown> = {
      isActive: true,
      date: { gte: new Date() },
    };
    if (restaurant) where.restaurant = restaurant;
    if (from || to) {
      where.date = {
        ...(from ? { gte: new Date(from) } : { gte: new Date() }),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
    });

    return {
      success: true,
      data: events.map((e) => ({
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
        availableSpots: e.capacity - e.bookedCount,
      })),
    };
  });

  // POST /api/v1/events/:eventId/book
  app.post("/:eventId/book", async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const { userId, childrenCount = 1 } = request.body as {
      userId: string;
      childrenCount?: number;
    };

    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || !event.isActive) {
      return reply.status(404).send({ success: false, error: "Event not found" });
    }
    if (event.bookedCount + childrenCount > event.capacity) {
      return reply.status(400).send({ success: false, error: "No available spots" });
    }

    const booking = await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: { bookedCount: { increment: childrenCount } },
      });

      return tx.eventBooking.create({
        data: { userId, eventId, childrenCount },
      });
    });

    return { success: true, data: { id: booking.id, status: booking.status } };
  });

  // DELETE /api/v1/events/:eventId/book/:bookingId
  app.delete("/:eventId/book/:bookingId", async (request, reply) => {
    const { bookingId } = request.params as { eventId: string; bookingId: string };

    const booking = await prisma.eventBooking.findUnique({
      where: { id: bookingId },
      include: { event: true },
    });

    if (!booking || booking.status === "CANCELLED") {
      return reply.status(404).send({ success: false, error: "Booking not found" });
    }

    const hoursUntilEvent =
      (booking.event.date.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilEvent < EVENT_CANCEL_HOURS_BEFORE) {
      return reply
        .status(400)
        .send({ success: false, error: "Too late to cancel (< 24h before event)" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.eventBooking.update({
        where: { id: bookingId },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      await tx.event.update({
        where: { id: booking.eventId },
        data: { bookedCount: { decrement: booking.childrenCount } },
      });
    });

    return { success: true, data: { status: "CANCELLED" } };
  });
}

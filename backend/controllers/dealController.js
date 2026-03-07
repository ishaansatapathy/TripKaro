import Deal from "../models/dealModel.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const FALLBACK_DEALS = [
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3299, provider: "IndiGo", airline: "IndiGo", redirectUrl: "https://www.goindigo.in/", departureTime: "07:30", arrivalTime: "09:00" },
  { routeFrom: "Bangalore", routeTo: "Goa", price: 3399, provider: "MakeMyTrip", airline: "Air India Express", redirectUrl: "https://www.makemytrip.com/flights/", departureTime: "12:20", arrivalTime: "13:50" },
  { routeFrom: "Delhi", routeTo: "Goa", price: 4499, provider: "Cleartrip", airline: "Air India", redirectUrl: "https://www.cleartrip.com/flights", departureTime: "07:10", arrivalTime: "09:45" },
  { routeFrom: "Mumbai", routeTo: "Goa", price: 2899, provider: "Goibibo", airline: "IndiGo", redirectUrl: "https://www.goibibo.com/flights/", departureTime: "10:40", arrivalTime: "11:55" },
  { routeFrom: "Bangalore", routeTo: "Delhi", price: 5299, provider: "ixigo", airline: "Air India", redirectUrl: "https://www.ixigo.com/flights", departureTime: "06:15", arrivalTime: "09:05" },
];

let hasAttemptedFallbackSeed = false;

async function ensureDealsSeeded() {
  if (hasAttemptedFallbackSeed) return;
  hasAttemptedFallbackSeed = true;

  const existingCount = await Deal.estimatedDocumentCount();
  if (existingCount > 0) return;

  await Deal.insertMany(FALLBACK_DEALS.map((deal) => ({ ...deal, createdAt: new Date() })));
  console.log(`Fallback-seeded ${FALLBACK_DEALS.length} deal records`);
}

export async function getDeals(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required query params" });
    }

    const normalizedFrom = String(from).trim();
    const normalizedTo = String(to).trim();
    await ensureDealsSeeded();

    const deals = await Deal.find({
      routeFrom: { $regex: `^${escapeRegex(normalizedFrom)}$`, $options: "i" },
      routeTo: { $regex: `^${escapeRegex(normalizedTo)}$`, $options: "i" },
    })
      .sort({ price: 1 })
      .select("routeFrom routeTo price provider airline redirectUrl departureTime arrivalTime createdAt");

    return res.json(deals);
  } catch (error) {
    console.error("Get deals error:", error);
    return res.status(500).json({ error: "Failed to fetch deals" });
  }
}

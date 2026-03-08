import Deal from "../models/dealModel.js";
import { generateDeals, resolvePlaceInput } from "../data/dealCatalog.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let hasAttemptedFallbackSeed = false;

async function ensureDealsSeeded() {
  if (hasAttemptedFallbackSeed) return;
  hasAttemptedFallbackSeed = true;

  const existingCount = await Deal.estimatedDocumentCount();
  if (existingCount > 0) return;

  const generatedDeals = generateDeals();
  await Deal.insertMany(generatedDeals);
  console.log(`Fallback-seeded ${generatedDeals.length} deal records`);
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

    const fromCandidates = resolvePlaceInput(normalizedFrom);
    const toCandidates = resolvePlaceInput(normalizedTo);
    if (fromCandidates.length === 0 || toCandidates.length === 0) {
      return res.json([]);
    }

    const deals = await Deal.find({
      routeFrom: {
        $in: fromCandidates.map((city) => new RegExp(`^${escapeRegex(city)}$`, "i")),
      },
      routeTo: {
        $in: toCandidates.map((city) => new RegExp(`^${escapeRegex(city)}$`, "i")),
      },
    })
      .sort({ price: 1 })
      .select("routeFrom routeTo price provider airline redirectUrl departureTime arrivalTime createdAt");

    return res.json(deals);
  } catch (error) {
    console.error("Get deals error:", error);
    return res.status(500).json({ error: "Failed to fetch deals" });
  }
}

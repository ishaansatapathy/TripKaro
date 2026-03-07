import Deal from "../models/dealModel.js";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function getDeals(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required query params" });
    }

    const normalizedFrom = String(from).trim();
    const normalizedTo = String(to).trim();

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

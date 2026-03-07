import Deal from "../models/dealModel.js";

export async function getDeals(req, res) {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({ error: "from and to are required query params" });
    }

    const deals = await Deal.find({
      routeFrom: from,
      routeTo: to,
    })
      .sort({ price: 1 })
      .select("routeFrom routeTo price provider airline redirectUrl departureTime arrivalTime createdAt");

    return res.json(deals);
  } catch (error) {
    console.error("Get deals error:", error);
    return res.status(500).json({ error: "Failed to fetch deals" });
  }
}

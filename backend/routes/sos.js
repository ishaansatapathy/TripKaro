import { Router } from "express";

const router = Router();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

function buildSOSQuery(lat, lng, radius) {
  return `[out:json][timeout:10];(
    node["amenity"="police"](around:${radius},${lat},${lng});
    way["amenity"="police"](around:${radius},${lat},${lng});
    node["amenity"="hospital"](around:${radius},${lat},${lng});
    way["amenity"="hospital"](around:${radius},${lat},${lng});
  );out center 20;`;
}

function categorize(tags) {
  if (tags.amenity === "police") return "police";
  if (tags.amenity === "hospital") return "hospital";
  return null;
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// POST /api/sos
router.post("/", async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
      return res.status(400).json({ error: "latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "latitude and longitude must be valid numbers" });
    }

    const radius = 10000; // 10 km for emergencies
    const query = buildSOSQuery(lat, lng, radius);

    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`);
    }

    const data = await response.json();

    const police = [];
    const hospitals = [];

    for (const el of data.elements || []) {
      const tags = el.tags || {};
      const name = tags.name;
      if (!name) continue;

      const category = categorize(tags);
      if (!category) continue;

      const placeLat = el.lat ?? el.center?.lat;
      const placeLng = el.lon ?? el.center?.lon;
      if (!placeLat || !placeLng) continue;

      const dist = getDistance(lat, lng, placeLat, placeLng);

      const place = {
        id: el.id,
        name,
        address:
          [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
            .filter(Boolean)
            .join(", ") || "",
        lat: placeLat,
        lng: placeLng,
        phone: tags.phone || tags["contact:phone"] || null,
        distance: `${dist.toFixed(1)} km`,
        distanceKm: dist,
      };

      if (category === "police") police.push(place);
      else hospitals.push(place);
    }

    // Sort by distance
    police.sort((a, b) => a.distanceKm - b.distanceKm);
    hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({
      police: police.slice(0, 10),
      hospitals: hospitals.slice(0, 10),
      total: police.length + hospitals.length,
    });
  } catch (err) {
    console.error("SOS error:", err);
    res.status(500).json({ error: "Failed to fetch emergency locations" });
  }
});

export default router;

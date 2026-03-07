import { Router } from "express";

const router = Router();

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// OSM tag queries for each category
const CATEGORY_QUERIES = {
  attractions: '["tourism"~"attraction|museum|artwork|viewpoint|zoo|theme_park"]',
  restaurants: '["amenity"~"restaurant|cafe|fast_food"]',
  hospitals: '["amenity"="hospital"]',
  police: '["amenity"="police"]',
};

function buildOverpassQuery(lat, lng, radius) {
  const parts = Object.entries(CATEGORY_QUERIES)
    .map(
      ([, tags]) =>
        `node${tags}(around:${radius},${lat},${lng});way${tags}(around:${radius},${lat},${lng});`
    )
    .join("");
  return `[out:json][timeout:15];(${parts});out center 80;`;
}

function categorize(tags) {
  if (tags.tourism) return "attractions";
  if (
    tags.amenity === "restaurant" ||
    tags.amenity === "cafe" ||
    tags.amenity === "fast_food"
  )
    return "restaurants";
  if (tags.amenity === "hospital") return "hospitals";
  if (tags.amenity === "police") return "police";
  return null;
}

// GET /api/explorer?lat=...&lng=...
router.get("/", async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ error: "lat and lng query params are required" });
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);
    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return res.status(400).json({ error: "lat and lng must be valid numbers" });
    }

    const radius = 5000; // 5 km
    const query = buildOverpassQuery(parsedLat, parsedLng, radius);

    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`Overpass API returned ${response.status}`);
    }

    const data = await response.json();

    const results = {
      attractions: [],
      restaurants: [],
      hospitals: [],
      police: [],
    };

    for (const el of data.elements || []) {
      const tags = el.tags || {};
      const name = tags.name;
      if (!name) continue;

      const category = categorize(tags);
      if (!category) continue;

      const placeLat = el.lat ?? el.center?.lat;
      const placeLng = el.lon ?? el.center?.lon;
      if (!placeLat || !placeLng) continue;

      results[category].push({
        id: el.id,
        name,
        address:
          [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]]
            .filter(Boolean)
            .join(", ") || "",
        lat: placeLat,
        lng: placeLng,
        cuisine: tags.cuisine || null,
        phone: tags.phone || null,
        website: tags.website || null,
        openingHours: tags.opening_hours || null,
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Explorer error:", err);
    res.status(500).json({ error: "Failed to fetch nearby places" });
  }
});

export default router;

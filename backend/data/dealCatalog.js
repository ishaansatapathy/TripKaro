const STATE_TO_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada"],
  "Arunachal Pradesh": ["Itanagar"],
  Assam: ["Guwahati", "Dibrugarh"],
  Bihar: ["Patna", "Gaya"],
  Chhattisgarh: ["Raipur"],
  Goa: ["Goa"],
  Gujarat: ["Ahmedabad", "Surat"],
  Haryana: ["Chandigarh"],
  "Himachal Pradesh": ["Shimla"],
  Jharkhand: ["Ranchi"],
  Karnataka: ["Bangalore", "Mysore"],
  Kerala: ["Kochi", "Trivandrum"],
  "Madhya Pradesh": ["Bhopal", "Indore"],
  Maharashtra: ["Mumbai", "Pune", "Nagpur"],
  Manipur: ["Imphal"],
  Meghalaya: ["Shillong"],
  Mizoram: ["Aizawl"],
  Nagaland: ["Dimapur"],
  Odisha: ["Bhubaneswar"],
  Punjab: ["Amritsar"],
  Rajasthan: ["Jaipur", "Udaipur"],
  Sikkim: ["Gangtok"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai"],
  Telangana: ["Hyderabad"],
  Tripura: ["Agartala"],
  "Uttar Pradesh": ["Lucknow", "Varanasi"],
  Uttarakhand: ["Dehradun"],
  "West Bengal": ["Kolkata", "Bagdogra"],
  Delhi: ["Delhi"],
  "Jammu and Kashmir": ["Srinagar", "Jammu"],
  Ladakh: ["Leh"],
  "Andaman and Nicobar Islands": ["Port Blair"],
  Chandigarh: ["Chandigarh"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Daman"],
  Lakshadweep: ["Agatti"],
  Puducherry: ["Puducherry"],
};

const CITY_ALIASES = {
  bengaluru: "Bangalore",
  trivandrum: "Trivandrum",
  thiruvananthapuram: "Trivandrum",
  bombay: "Mumbai",
  calcutta: "Kolkata",
  vizag: "Visakhapatnam",
  bangalore: "Bangalore",
  goa: "Goa",
  delhi: "Delhi",
  kolkata: "Kolkata",
  mumbai: "Mumbai",
  chennai: "Chennai",
};

const PROVIDERS = [
  "IndiGo",
  "MakeMyTrip",
  "Goibibo",
  "Cleartrip",
  "ixigo",
  "Yatra",
  "EaseMyTrip",
  "Paytm Travel",
];

const AIRLINES = ["IndiGo", "Air India", "Akasa Air", "SpiceJet", "Air India Express"];

const POPULAR_CITIES = Array.from(new Set(Object.values(STATE_TO_CITIES).flat()));

function normalizeToken(value) {
  return String(value).trim().toLowerCase().replace(/[\s-]+/g, " ");
}

function toMinutes(hour, minute) {
  return hour * 60 + minute;
}

function toClock(totalMinutes) {
  const wrapped = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const hh = String(Math.floor(wrapped / 60)).padStart(2, "0");
  const mm = String(wrapped % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function canonicalCity(input) {
  const normalized = normalizeToken(input);
  if (CITY_ALIASES[normalized]) return CITY_ALIASES[normalized];
  const direct = POPULAR_CITIES.find((city) => normalizeToken(city) === normalized);
  return direct || null;
}

function resolvePlaceInput(input) {
  const normalized = normalizeToken(input);
  const stateMatch = Object.keys(STATE_TO_CITIES).find((state) => normalizeToken(state) === normalized);
  if (stateMatch) return STATE_TO_CITIES[stateMatch];

  const city = canonicalCity(input);
  if (city) return [city];
  return [];
}

function generateDeals() {
  const deals = [];
  const now = new Date();

  for (let i = 0; i < POPULAR_CITIES.length; i += 1) {
    for (let j = 0; j < POPULAR_CITIES.length; j += 1) {
      if (i === j) continue;

      const routeFrom = POPULAR_CITIES[i];
      const routeTo = POPULAR_CITIES[j];
      const distanceFactor = Math.abs(i - j);
      const baseFare = 2200 + distanceFactor * 130;

      for (let variant = 0; variant < 3; variant += 1) {
        const depHour = (6 + ((i * 3 + j + variant * 4) % 15)) % 24;
        const depMinute = ((i + j + variant) % 4) * 15;
        const flightDurationMins = 75 + ((distanceFactor + variant) % 8) * 20;
        const departure = toMinutes(depHour, depMinute);
        const arrival = departure + flightDurationMins;
        const priceJitter = ((i * 37 + j * 19 + variant * 11) % 600) - 250;

        deals.push({
          routeFrom,
          routeTo,
          price: Math.max(1800, baseFare + variant * 180 + priceJitter),
          provider: PROVIDERS[(i + j + variant) % PROVIDERS.length],
          airline: AIRLINES[(i * 2 + j + variant) % AIRLINES.length],
          redirectUrl: "https://www.makemytrip.com/flights/",
          departureTime: toClock(departure),
          arrivalTime: toClock(arrival),
          createdAt: now,
        });
      }
    }
  }

  return deals;
}

export { POPULAR_CITIES, generateDeals, resolvePlaceInput };

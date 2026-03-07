import React, { useState, useEffect, useCallback, useMemo } from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ─── OSRM free routing ─── */
const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

/* ─── Overpass API (direct from frontend) ─── */
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

const CATEGORY_QUERIES: Record<string, string> = {
    attractions: '["tourism"~"attraction|museum|artwork|viewpoint|zoo|theme_park"]',
    restaurants: '["amenity"~"restaurant|cafe|fast_food"]',
    hospitals: '["amenity"="hospital"]',
    police: '["amenity"="police"]',
};

function buildOverpassQuery(lat: number, lng: number, radius: number): string {
    const parts = Object.values(CATEGORY_QUERIES)
        .map((tags) => `node${tags}(around:${radius},${lat},${lng});way${tags}(around:${radius},${lat},${lng});`)
        .join("");
    return `[out:json][timeout:15];(${parts});out center 80;`;
}

function categorize(tags: Record<string, string>): string | null {
    if (tags.tourism) return "attractions";
    if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") return "restaurants";
    if (tags.amenity === "hospital") return "hospitals";
    if (tags.amenity === "police") return "police";
    return null;
}

/* ─── types ─── */
type Category = "all" | "attractions" | "restaurants" | "hospitals" | "police";

interface Place {
    id: number;
    name: string;
    address: string;
    category: Category;
    lat: number;
    lng: number;
    cuisine: string | null;
    phone: string | null;
    website: string | null;
    openingHours: string | null;
    dist: string;
}

const CATEGORIES: { key: Category; label: string; icon: string; emoji: string }[] = [
    { key: "all", label: "All Places", emoji: "", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
    { key: "attractions", label: "Attractions", emoji: "", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
    { key: "restaurants", label: "Restaurants", emoji: "", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1" },
    { key: "hospitals", label: "Hospitals", emoji: "", icon: "M19 14l-7 7m0 0l-7-7m7 7V3" },
    { key: "police", label: "Police", emoji: "", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
];

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ─── custom marker icons ─── */
function createEmojiIcon(emoji: string) {
    return L.divIcon({
        html: `<div style="font-size:20px;line-height:1;text-align:center">${emoji}</div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });
}

const MARKER_ICONS: Record<string, L.DivIcon> = {
    attractions: createEmojiIcon(""),
    restaurants: createEmojiIcon(""),
    hospitals: createEmojiIcon(""),
    police: createEmojiIcon(""),
    user: L.divIcon({
        html: `<div style="width:16px;height:16px;background:#000;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(0,0,0,0.3)"></div>`,
        className: "",
        iconSize: [16, 16],
        iconAnchor: [8, 8],
    }),
};

/* ─── recenter map when location changes ─── */
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView([lat, lng], 14);
    }, [map, lat, lng]);
    return null;
}

/* ─── fit map to show route ─── */
function FitRoute({ route }: { route: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (route.length > 1) {
            const bounds = L.latLngBounds(route.map(([lat, lng]) => [lat, lng]));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, route]);
    return null;
}

export default function ExplorerPage() {
    const { isSignedIn } = useAuth();
    const [activeCategory, setActiveCategory] = useState<Category>("all");
    const [selectedPlace, setSelectedPlace] = useState<number | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);
    const [routeLoading, setRouteLoading] = useState(false);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [radius, setRadius] = useState(5000);

    const RADIUS_OPTIONS = [
        { label: "2 km", value: 2000 },
        { label: "5 km", value: 5000 },
        { label: "10 km", value: 10000 },
        { label: "15 km", value: 15000 },
        { label: "25 km", value: 25000 },
    ];

    const fetchPlaces = useCallback(async (lat: number, lng: number, rad: number) => {
        setLoading(true);
        setError(null);
        try {
            const query = buildOverpassQuery(lat, lng, rad);
            const res = await fetch(OVERPASS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `data=${encodeURIComponent(query)}`,
            });
            if (!res.ok) throw new Error("Overpass API error");
            const data = await res.json();

            const results: Record<string, any[]> = {
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
                    address: [tags["addr:street"], tags["addr:housenumber"], tags["addr:city"]].filter(Boolean).join(", ") || "",
                    lat: placeLat,
                    lng: placeLng,
                    cuisine: tags.cuisine || null,
                    phone: tags.phone || null,
                    website: tags.website || null,
                    openingHours: tags.opening_hours || null,
                });
            }

            const allPlaces: Place[] = [];
            for (const [category, items] of Object.entries(results)) {
                for (const item of items) {
                    const dist = getDistance(lat, lng, item.lat, item.lng);
                    allPlaces.push({
                        ...item,
                        category: category as Category,
                        dist: dist < 1 ? `${Math.round(dist * 1000)} m` : `${dist.toFixed(1)} km`,
                    });
                }
            }
            allPlaces.sort((a, b) => parseFloat(a.dist) - parseFloat(b.dist));
            setPlaces(allPlaces);
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
                fetchPlaces(loc.lat, loc.lng, radius);
            },
            () => setError("Location access denied. Please enable location permissions."),
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Re-fetch when radius changes
    useEffect(() => {
        if (userLocation) {
            fetchPlaces(userLocation.lat, userLocation.lng, radius);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [radius]);

    const filtered = useMemo(
        () => activeCategory === "all" ? places : places.filter((p) => p.category === activeCategory),
        [activeCategory, places],
    );
    const categoryEmoji = (cat: string) => CATEGORIES.find((c) => c.key === cat)?.emoji || "";

    const fetchRoute = useCallback(async (place: Place) => {
        if (!userLocation) return;
        setRouteLoading(true);
        try {
            const res = await fetch(
                `${OSRM_URL}/${userLocation.lng},${userLocation.lat};${place.lng},${place.lat}?overview=full&geometries=geojson`
            );
            if (!res.ok) throw new Error("Route fetch failed");
            const data = await res.json();
            if (data.routes && data.routes.length > 0) {
                const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
                    ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
                );
                setRoute(coords);
                const dist = data.routes[0].distance;
                const dur = data.routes[0].duration;
                setRouteInfo({
                    distance: dist < 1000 ? `${Math.round(dist)} m` : `${(dist / 1000).toFixed(1)} km`,
                    duration: dur < 60 ? `${Math.round(dur)} sec` : `${Math.round(dur / 60)} min`,
                });
            }
        } catch {
            setRoute([]);
            setRouteInfo(null);
        } finally {
            setRouteLoading(false);
        }
    }, [userLocation]);

    const handleSelectPlace = useCallback((place: Place) => {
        setSelectedPlace(place.id);
        fetchRoute(place);
    }, [fetchRoute]);

    const clearRoute = useCallback(() => {
        setSelectedPlace(null);
        setRoute([]);
        setRouteInfo(null);
    }, []);

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.4} ease="power2.out">
                        <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-current rounded-full opacity-60 mb-6">
                            Smart Local Explorer
                        </span>
                    </AnimatedContent>

                    <SplitText
                        text="Explore destinations intelligently with location-based recommendations."
                        className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] max-w-4xl"
                        delay={25}
                        duration={0.8}
                        ease="power3.out"
                        splitType="words"
                        from={{ opacity: 0, y: 40 }}
                        to={{ opacity: 1, y: 0 }}
                        threshold={0.1}
                        rootMargin="-50px"
                        tag="h1"
                        textAlign="left"
                    />

                    <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.3} ease="power2.out">
                        <p className="mt-5 text-base text-black/45 leading-relaxed max-w-xl">
                            Discover nearby tourist attractions, restaurants, hidden gems, and emergency services — all surfaced automatically based on your current location.
                        </p>
                    </AnimatedContent>
                </div>
            </section>

            {/* ═══════════ MAP + SIDEBAR ═══════════ */}
            <section className="py-8 lg:py-12">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={30} direction="vertical" duration={0.6} ease="power2.out">
                        <div className="bg-white border border-black/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-black/5 bg-black/2">
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="ml-3 text-[10px] font-medium text-black/30">tripkaro.app/explorer · {userLocation ? `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}` : "Detecting..."}</span>
                                {/* Location indicator */}
                                <div className="ml-auto flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                                    <span className="text-[10px] font-medium text-black/40">Live Location</span>
                                </div>
                            </div>

                            {/* Category tabs + Radius selector */}
                            <div className="flex items-center justify-between px-5 py-3 border-b border-black/5 overflow-x-auto gap-3">
                                <div className="flex items-center gap-1.5">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.key}
                                            onClick={() => setActiveCategory(cat.key)}
                                            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-[11px] font-semibold rounded-full transition-all whitespace-nowrap ${activeCategory === cat.key
                                                    ? "bg-black text-white"
                                                    : "text-black/40 border border-black/10 hover:border-black/25 hover:text-black/60"
                                                }`}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={cat.icon} /></svg>
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>

                                {/* Radius selector */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <svg className="w-3.5 h-3.5 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm0-6a3 3 0 100-6 3 3 0 000 6z" /></svg>
                                    {RADIUS_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setRadius(opt.value)}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded-full transition-all whitespace-nowrap ${
                                                radius === opt.value
                                                    ? "bg-black text-white"
                                                    : "text-black/30 border border-black/8 hover:border-black/20 hover:text-black/50"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid lg:grid-cols-[1fr_340px]">

                                {/* ── LEFT: Leaflet Map ── */}
                                <div className="relative h-105 lg:h-130">
                                    {/* Loading / Error overlay */}
                                    {loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-1000">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <p className="text-[12px] font-medium text-black/50">Scanning nearby places...</p>
                                            </div>
                                        </div>
                                    )}
                                    {error && !loading && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-1000">
                                            <div className="text-center px-6">
                                                <p className="text-[13px] font-bold text-black/60 mb-2">{error}</p>
                                                <button onClick={() => {
                                                    if (userLocation) fetchPlaces(userLocation.lat, userLocation.lng, radius);
                                                    else window.location.reload();
                                                }} className="px-4 py-2 text-[11px] font-bold bg-black text-white rounded-full hover:bg-black/80 transition-colors">
                                                    Retry
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {userLocation ? (
                                        <MapContainer
                                            center={[userLocation.lat, userLocation.lng]}
                                            zoom={14}
                                            className="h-full w-full z-0"
                                            scrollWheelZoom={true}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <RecenterMap lat={userLocation.lat} lng={userLocation.lng} />
                                            {route.length > 1 && <FitRoute route={route} />}

                                            {/* Route polyline */}
                                            {route.length > 1 && (
                                                <Polyline
                                                    positions={route}
                                                    pathOptions={{ color: "#000", weight: 4, opacity: 0.7, dashArray: "8 6" }}
                                                />
                                            )}

                                            {/* User location marker */}
                                            <Marker position={[userLocation.lat, userLocation.lng]} icon={MARKER_ICONS.user}>
                                                <Popup><strong>You are here</strong></Popup>
                                            </Marker>

                                            {/* Place markers */}
                                            {filtered.map((place) => (
                                                <Marker
                                                    key={place.id}
                                                    position={[place.lat, place.lng]}
                                                    icon={MARKER_ICONS[place.category] || MARKER_ICONS.attractions}
                                                    eventHandlers={{
                                                        click: () => handleSelectPlace(place),
                                                    }}
                                                >
                                                    <Popup>
                                                        <div className="min-w-45">
                                                            <p className="font-bold text-[13px] mb-1">{place.name}</p>
                                                            {place.address && <p className="text-[11px] text-gray-500 mb-1">{place.address}</p>}
                                                            <p className="text-[10px] text-gray-400">{categoryEmoji(place.category)} {place.category} · {place.dist}</p>
                                                            {place.phone && <p className="text-[10px] mt-1"> {place.phone}</p>}
                                                            {place.openingHours && <p className="text-[10px] mt-0.5"> {place.openingHours}</p>}
                                                        </div>
                                                    </Popup>
                                                </Marker>
                                            ))}
                                        </MapContainer>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-black/2.5">
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="w-8 h-8 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                                <p className="text-[12px] font-medium text-black/50">Getting your location...</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Route info overlay */}
                                    {routeInfo && selectedPlace && (
                                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur border border-black/10 rounded-xl px-4 py-3 z-500 shadow-lg">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="text-[11px] font-bold text-black/70">{routeInfo.distance}</p>
                                                    <p className="text-[9px] text-black/40">distance</p>
                                                </div>
                                                <div className="w-px h-6 bg-black/10" />
                                                <div>
                                                    <p className="text-[11px] font-bold text-black/70">{routeInfo.duration}</p>
                                                    <p className="text-[9px] text-black/40">drive time</p>
                                                </div>
                                                <button
                                                    onClick={clearRoute}
                                                    className="ml-2 w-5 h-5 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                                                >
                                                    <svg className="w-3 h-3 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>
                                            {routeLoading && <p className="text-[9px] text-black/30 mt-1">Calculating...</p>}
                                        </div>
                                    )}

                                    {/* Legend overlay */}
                                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur border border-black/10 rounded-lg px-3 py-2 flex items-center gap-3 z-500">
                                        {[
                                            { emoji: "", label: "Attraction" },
                                            { emoji: "", label: "Restaurant" },
                                            { emoji: "", label: "Hospital" },
                                            { emoji: "", label: "Police" },
                                        ].map((l, i) => (
                                            <div key={i} className="flex items-center gap-1">
                                                <span className="text-[10px]">{l.emoji}</span>
                                                <span className="text-[9px] font-medium text-black/40">{l.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── RIGHT: Places List ── */}
                                <div className="border-l border-black/5 flex flex-col">
                                    <div className="px-5 py-3 border-b border-black/5">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/3 border border-black/5">
                                            <svg className="w-3.5 h-3.5 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <span className="text-[12px] text-black/25">Search places...</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 overflow-y-auto max-h-115">
                                        {filtered.length === 0 && !loading && (
                                            <div className="px-5 py-12 text-center">
                                                <p className="text-[13px] text-black/30 font-medium">{error ? "Unable to load places" : "No places found nearby"}</p>
                                            </div>
                                        )}
                                        {filtered.map((place) => (
                                            <div
                                                key={place.id}
                                                className={`px-5 py-4 border-b border-black/5 cursor-pointer transition-colors ${selectedPlace === place.id ? "bg-black/4" : "hover:bg-black/2"
                                                    }`}
                                                onClick={() => handleSelectPlace(place)}
                                            >
                                                <div className="flex items-start justify-between mb-1.5">
                                                    <div>
                                                        <p className="text-[13px] font-bold">{place.name}</p>
                                                        <p className="text-[10px] text-black/30 uppercase tracking-wider font-medium">{place.category}</p>
                                                    </div>
                                                    <div className="text-right shrink-0 ml-3">
                                                        <p className="text-[10px] text-black/25 mt-0.5">{place.dist}</p>
                                                    </div>
                                                </div>
                                                {place.address && <p className="text-[11px] text-black/35 leading-relaxed line-clamp-2">{place.address}</p>}
                                                <div className="flex flex-wrap gap-2 mt-1.5">
                                                    {place.cuisine && (
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/4 text-black/40">{place.cuisine}</span>
                                                    )}
                                                    {place.openingHours && (
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-green-50 text-green-600"> {place.openingHours}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="py-20 lg:py-28 border-t border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-12">
                            What the explorer finds for you
                        </h2>
                    </AnimatedContent>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: "Tourist Attractions", desc: "Temples, museums, monuments, and natural wonders — ranked by rating and proximity.", icon: "", count: "200+" },
                            { title: "Local Restaurants", desc: "From street food to fine dining, curated by local ratings and traveler reviews.", icon: "", count: "500+" },
                            { title: "Hidden Gems", desc: "Secret spots, local markets, and experiences only insiders know about.", icon: "", count: "80+" },
                            { title: "Emergency Services", desc: "Nearest hospitals, police stations, and embassies — always one tap away.", icon: "", count: "24/7" },
                        ].map((f, i) => (
                            <AnimatedContent key={i} distance={25} direction="vertical" duration={0.5} delay={i * 0.06} ease="power2.out">
                                <div className="group p-7 rounded-2xl border border-black/5 hover:border-black/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl">{f.icon}</span>
                                        <span className="text-[10px] font-bold text-black/25 bg-black/3 px-2 py-0.5 rounded-full">{f.count}</span>
                                    </div>
                                    <h3 className="text-base font-bold mb-1.5">{f.title}</h3>
                                    <p className="text-[12px] text-black/35 leading-relaxed">{f.desc}</p>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-5xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-14">
                            How Smart Explorer works
                        </h2>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: "01", title: "Share Your Location", desc: "Allow location access and we'll detect where you are. Works in any city worldwide." },
                            { step: "02", title: "We Scan Nearby", desc: "Our engine scans for attractions, restaurants, hidden gems, and services within your radius." },
                            { step: "03", title: "Explore & Navigate", desc: "Browse results on the map, read details, and get directions — all without leaving the app." },
                        ].map((s, i) => (
                            <AnimatedContent key={i} distance={25} direction="vertical" duration={0.5} delay={i * 0.08} ease="power2.out">
                                <div className="text-center">
                                    <div className="w-14 h-14 rounded-full bg-black text-white flex items-center justify-center text-sm font-black mx-auto mb-5">{s.step}</div>
                                    <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                                    <p className="text-sm text-black/40 leading-relaxed">{s.desc}</p>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="bg-black text-white py-24 lg:py-32 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <AnimatedContent distance={25} direction="vertical" duration={0.6} ease="power2.out">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Explore like a local</h2>
                        <p className="mt-4 text-white/35 text-base">Smart, location-aware discovery — everywhere you travel.</p>
                        <div className="mt-8">
                            {!isSignedIn ? (
                                <SignInButton mode="modal">
                                    <button className="px-8 py-3.5 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all">
                                        Get started free →
                                    </button>
                                </SignInButton>
                            ) : (
                                <Link href="/dashboard" className="px-8 py-3.5 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all inline-block">
                                    Open Dashboard →
                                </Link>
                            )}
                        </div>
                    </AnimatedContent>
                </div>
            </section>

            <Footer />
        </div>
    );
}

import { FormEvent, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_URL } from "@/lib/api";

type Deal = {
  _id: string;
  routeFrom: string;
  routeTo: string;
  price: number;
  provider: string;
  airline: string;
  redirectUrl: string;
  departureTime: string;
  arrivalTime: string;
  createdAt: string;
};

export default function DealsPage() {
  const [fromCity, setFromCity] = useState("Bangalore");
  const [toCity, setToCity] = useState("Goa");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);

  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [airlineFilter, setAirlineFilter] = useState("all");
  const [providerFilter, setProviderFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc">("price-asc");

  const uniqueAirlines = useMemo(() => {
    return Array.from(new Set(deals.map((deal) => deal.airline))).sort();
  }, [deals]);

  const uniqueProviders = useMemo(() => {
    return Array.from(new Set(deals.map((deal) => deal.provider))).sort();
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const byFilters = deals.filter((deal) => {
      const passPrice = maxPrice === "" || deal.price <= maxPrice;
      const passAirline = airlineFilter === "all" || deal.airline === airlineFilter;
      const passProvider = providerFilter === "all" || deal.provider === providerFilter;
      return passPrice && passAirline && passProvider;
    });

    return byFilters.sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      return b.price - a.price;
    });
  }, [airlineFilter, deals, maxPrice, providerFilter, sortBy]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        from: fromCity.trim(),
        to: toCity.trim(),
      });

      const response = await fetch(`${API_URL}/api/deals?${params.toString()}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${response.status})`);
      }

      const data = (await response.json()) as Deal[];
      setDeals(data);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch deals";
      setError(message);
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <Navbar />

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-28 lg:pt-32">
        <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm lg:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-black/45">Flight Aggregator</p>
          <h1 className="text-3xl font-black tracking-tight lg:text-4xl">Find the best flight deal</h1>
          <p className="mt-3 max-w-2xl text-sm text-black/55">
            Search stored offers from providers like IndiGo, MakeMyTrip, and Cleartrip. Enter city or state names and click View Deal to open the original booking website.
          </p>

          <form className="mt-6 grid gap-3 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleSearch}>
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/50">From (City/State)</span>
              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none transition focus:border-black"
                value={fromCity}
                onChange={(event) => setFromCity(event.target.value)}
                placeholder="Bangalore or Karnataka"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/50">To (City/State)</span>
              <input
                className="w-full rounded-xl border border-black/15 px-4 py-3 text-sm outline-none transition focus:border-black"
                value={toCity}
                onChange={(event) => setToCity(event.target.value)}
                placeholder="Goa or Maharashtra"
                required
              />
            </label>

            <button
              type="submit"
              className="h-[50px] self-end rounded-xl bg-black px-6 text-sm font-bold text-white transition hover:bg-black/85"
              disabled={loading}
            >
              {loading ? "Searching..." : "Search Deals"}
            </button>
          </form>

          <div className="mt-6 grid gap-3 border-t border-black/10 pt-5 md:grid-cols-4">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/50">Max Price</span>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none transition focus:border-black"
                placeholder="Any"
                value={maxPrice}
                onChange={(event) => {
                  const value = event.target.value;
                  setMaxPrice(value === "" ? "" : Number(value));
                }}
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/50">Airline</span>
              <select
                className="w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none transition focus:border-black"
                value={airlineFilter}
                onChange={(event) => setAirlineFilter(event.target.value)}
              >
                <option value="all">All</option>
                {uniqueAirlines.map((airline) => (
                  <option key={airline} value={airline}>
                    {airline}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/50">Provider</span>
              <select
                className="w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none transition focus:border-black"
                value={providerFilter}
                onChange={(event) => setProviderFilter(event.target.value)}
              >
                <option value="all">All</option>
                {uniqueProviders.map((provider) => (
                  <option key={provider} value={provider}>
                    {provider}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-black/50">Sort</span>
              <select
                className="w-full rounded-xl border border-black/15 px-4 py-2.5 text-sm outline-none transition focus:border-black"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "price-asc" | "price-desc")}
              >
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-8">
          {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

          {!error && deals.length === 0 && !loading && (
            <p className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-6 text-sm text-black/60">
              Search a route to see available deals.
            </p>
          )}

          {!error && deals.length > 0 && filteredDeals.length === 0 && (
            <p className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-6 text-sm text-black/60">
              No deals match the selected filters.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDeals.map((deal) => (
              <article key={deal._id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">{deal.airline}</p>
                <h2 className="mt-2 text-lg font-black tracking-tight">
                  {deal.routeFrom} to {deal.routeTo}
                </h2>
                <p className="mt-1 text-sm text-black/55">
                  {deal.departureTime} to {deal.arrivalTime}
                </p>

                <p className="mt-4 text-3xl font-black">Rs. {deal.price}</p>
                <p className="mt-1 text-sm text-black/55">Provider: {deal.provider}</p>

                <button
                  type="button"
                  className="mt-5 w-full rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white transition hover:bg-black/85"
                  onClick={() => window.open(deal.redirectUrl, "_blank", "noopener,noreferrer")}
                >
                  View Deal
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

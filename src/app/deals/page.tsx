import React, { useState } from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";

/* ─── deal types ─── */
type DealCategory = "all" | "flights" | "hotels" | "hostels" | "trains";

interface Deal {
    category: DealCategory;
    title: string;
    route: string;
    source: string;
    price: string;
    originalPrice: string;
    discount: string;
    date: string;
    details: string[];
    tag?: string;
}

const DEALS: Deal[] = [
    {
        category: "flights",
        title: "Delhi → Goa",
        route: "DEL → GOI",
        source: "IndiGo via Skyscanner",
        price: "₹2,499",
        originalPrice: "₹5,200",
        discount: "52% off",
        date: "Mar 18 – Mar 24",
        details: ["Non-stop · 2h 35m", "6:00 AM departure", "15 kg cabin bag"],
        tag: "Lowest Price",
    },
    {
        category: "flights",
        title: "Mumbai → Shillong",
        route: "BOM → SHL",
        source: "Air India via MakeMyTrip",
        price: "₹4,850",
        originalPrice: "₹8,900",
        discount: "45% off",
        date: "Apr 2 – Apr 10",
        details: ["1 stop (Kolkata) · 5h 10m", "10:30 AM departure", "25 kg checked bag"],
    },
    {
        category: "hotels",
        title: "Hotel Shillong View",
        route: "Shillong, Meghalaya",
        source: "Booking.com",
        price: "₹1,200",
        originalPrice: "₹2,800",
        discount: "57% off",
        date: "Per night · Mar 15–26",
        details: ["Mountain view room", "Free breakfast", "Free cancellation"],
        tag: "Best Value",
    },
    {
        category: "hotels",
        title: "Taj Fort Aguada",
        route: "Sinquerim, Goa",
        source: "Goibibo",
        price: "₹6,500",
        originalPrice: "₹12,000",
        discount: "46% off",
        date: "Per night · Dec 28 – Jan 3",
        details: ["Sea-facing suite", "Pool + spa access", "Breakfast included"],
    },
    {
        category: "hostels",
        title: "Zostel Shillong",
        route: "Police Bazaar, Shillong",
        source: "Hostelworld",
        price: "₹450",
        originalPrice: "₹900",
        discount: "50% off",
        date: "Per bed · Mar 15–26",
        details: ["8-bed mixed dorm", "Common kitchen", "Walking tours included"],
        tag: "Backpacker Pick",
    },
    {
        category: "hostels",
        title: "Madpackers Goa",
        route: "Arambol Beach, Goa",
        source: "Zostel.com",
        price: "₹600",
        originalPrice: "₹1,100",
        discount: "45% off",
        date: "Per bed · Dec 28 – Jan 3",
        details: ["6-bed dorm · AC", "Beach 2 min walk", "Free WiFi + locker"],
    },
    {
        category: "trains",
        title: "Rajdhani Express",
        route: "New Delhi → Guwahati",
        source: "IRCTC",
        price: "₹1,850",
        originalPrice: "₹2,400",
        discount: "23% off",
        date: "Mar 14 · Departs 4:05 PM",
        details: ["3AC · 26h journey", "Meals included", "Tatkal available"],
        tag: "Fastest Route",
    },
    {
        category: "trains",
        title: "Goa Express",
        route: "Delhi → Margao (Goa)",
        source: "IRCTC",
        price: "₹980",
        originalPrice: "₹1,350",
        discount: "27% off",
        date: "Dec 26 · Departs 3:00 PM",
        details: ["Sleeper · 36h journey", "No meals", "General quota"],
    },
    {
        category: "flights",
        title: "Bengaluru → Srinagar",
        route: "BLR → SXR",
        source: "SpiceJet via Cleartrip",
        price: "₹3,750",
        originalPrice: "₹7,100",
        discount: "47% off",
        date: "May 5 – May 12",
        details: ["1 stop (Delhi) · 4h 40m", "8:15 AM departure", "15 kg bag"],
    },
];

const CATEGORIES: { key: DealCategory; label: string; emoji: string }[] = [
    { key: "all", label: "All Deals", emoji: "🔥" },
    { key: "flights", label: "Flights", emoji: "✈️" },
    { key: "hotels", label: "Hotels", emoji: "🏨" },
    { key: "hostels", label: "Hostels", emoji: "🛏️" },
    { key: "trains", label: "Trains", emoji: "🚆" },
];

export default function DealsPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const [active, setActive] = useState<DealCategory>("all");

    const filtered = active === "all" ? DEALS : DEALS.filter((d) => d.category === active);

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-end">
                        <div>
                            <AnimatedContent distance={20} direction="vertical" duration={0.4} ease="power2.out">
                                <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-current rounded-full opacity-60 mb-6">
                                    Travel Deals
                                </span>
                            </AnimatedContent>

                            <SplitText
                                text="Discover the best travel deals across multiple platforms."
                                className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1]"
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
                                <p className="mt-5 text-base text-black/45 leading-relaxed max-w-lg">
                                    We aggregate deals from Skyscanner, MakeMyTrip, Booking.com, IRCTC, and more — so you always get the cheapest price without searching everywhere.
                                </p>
                            </AnimatedContent>
                        </div>

                        {/* Quick search mockup */}
                        <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.4} ease="power2.out">
                            <div className="bg-white border border-black/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-5">
                                <div className="grid grid-cols-3 gap-3 mb-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">From</p>
                                        <p className="text-sm font-semibold">Delhi (DEL)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">To</p>
                                        <p className="text-sm font-semibold">Goa (GOI)</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-black/30 uppercase tracking-wider">Dates</p>
                                        <p className="text-sm font-semibold">Mar 18 – 24</p>
                                    </div>
                                </div>
                                <button className="w-full py-2.5 bg-black text-white text-[12px] font-bold rounded-full hover:bg-black/80 transition-all">
                                    Search deals →
                                </button>
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </section>

            {/* ═══════════ CATEGORY FILTERS ═══════════ */}
            <section className="py-5 border-b border-black/5 sticky top-0 bg-white/95 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center gap-2 overflow-x-auto">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setActive(cat.key)}
                            className={`flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-full transition-all whitespace-nowrap ${active === cat.key
                                    ? "bg-black text-white"
                                    : "text-black/40 border border-black/10 hover:border-black/25 hover:text-black/60"
                                }`}
                        >
                            <span>{cat.emoji}</span>
                            {cat.label}
                        </button>
                    ))}

                    <div className="ml-auto shrink-0 text-[11px] text-black/25 font-medium">
                        {filtered.length} deal{filtered.length !== 1 && "s"} found
                    </div>
                </div>
            </section>

            {/* ═══════════ DEAL CARDS ═══════════ */}
            <section className="py-10 lg:py-16">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((deal, i) => (
                            <AnimatedContent key={`${deal.title}-${active}`} distance={25} direction="vertical" duration={0.4} delay={i * 0.05} ease="power2.out">
                                <div className="group border border-black/8 rounded-2xl overflow-hidden hover:border-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                    {/* Category + tag header */}
                                    <div className="bg-black text-white px-5 py-4">
                                        <div className="flex items-center justify-between mb-2.5">
                                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                                                {deal.category === "flights" && "✈️ Flight"}
                                                {deal.category === "hotels" && "🏨 Hotel"}
                                                {deal.category === "hostels" && "🛏️ Hostel"}
                                                {deal.category === "trains" && "🚆 Train"}
                                            </span>
                                            {deal.tag && (
                                                <span className="px-2 py-0.5 text-[9px] font-bold bg-white text-black rounded-full">
                                                    {deal.tag}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-lg font-black tracking-tight">{deal.title}</h3>
                                        <p className="text-[12px] text-white/40 mt-0.5 flex items-center gap-1.5">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                                            {deal.route}
                                        </p>
                                    </div>

                                    {/* Body */}
                                    <div className="px-5 py-5 flex-1 flex flex-col">
                                        {/* Price row */}
                                        <div className="flex items-baseline gap-2.5 mb-4">
                                            <span className="text-2xl font-black tracking-tight">{deal.price}</span>
                                            <span className="text-sm text-black/25 line-through">{deal.originalPrice}</span>
                                            <span className="px-2 py-0.5 text-[10px] font-bold bg-black/5 text-black/60 rounded-full">{deal.discount}</span>
                                        </div>

                                        {/* Date */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <svg className="w-3.5 h-3.5 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-[12px] text-black/45 font-medium">{deal.date}</span>
                                        </div>

                                        {/* Details */}
                                        <div className="space-y-2 flex-1">
                                            {deal.details.map((d, j) => (
                                                <div key={j} className="flex items-center gap-2">
                                                    <svg className="w-3 h-3 text-black/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                                    <span className="text-[11px] text-black/40">{d}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Source + CTA */}
                                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/5">
                                            <span className="text-[10px] text-black/25 font-medium">{deal.source}</span>
                                            <button className="px-4 py-1.5 text-[11px] font-bold bg-black text-white rounded-full hover:bg-black/80 transition-all group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                                                View Deal →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ AGGREGATION SOURCES ═══════════ */}
            <section className="py-16 lg:py-24 border-t border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-4">
                            We scan everything so you don&apos;t have to
                        </h2>
                        <p className="text-center text-sm text-black/35 mb-12 max-w-lg mx-auto">
                            Deals aggregated from 15+ platforms, updated every 30 minutes. You always see the cheapest option first.
                        </p>
                    </AnimatedContent>

                    <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.1} ease="power2.out">
                        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
                            {["Skyscanner", "MakeMyTrip", "Booking.com", "Goibibo", "IRCTC", "Cleartrip", "Hostelworld", "Zostel", "Yatra", "EaseMyTrip", "Agoda", "Trivago"].map((name, i) => (
                                <span key={i} className="text-sm font-bold text-black/15 hover:text-black/40 transition-colors cursor-default tracking-wide">
                                    {name}
                                </span>
                            ))}
                        </div>
                    </AnimatedContent>
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-12">
                            How deals work for you
                        </h2>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-3 gap-5">
                        {[
                            {
                                title: "Price Alerts",
                                desc: "Set an alert for a route and we'll notify you when prices drop below your target.",
                                icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                            },
                            {
                                title: "Trip-Matched Deals",
                                desc: "Deals automatically matched to your trip dates and destinations. No manual search needed.",
                                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                            },
                            {
                                title: "Split With Crew",
                                desc: "Found a group deal? Share it with your trip members and split the cost directly in-app.",
                                icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                            },
                        ].map((f, i) => (
                            <AnimatedContent key={i} distance={25} direction="vertical" duration={0.5} delay={i * 0.08} ease="power2.out">
                                <div className="p-8 rounded-2xl border border-black/5 hover:border-black/15 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={f.icon} /></svg>
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                                    <p className="text-sm text-black/40 leading-relaxed">{f.desc}</p>
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
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Stop overpaying for travel</h2>
                        <p className="mt-4 text-white/35 text-base">Get personalized deals matched to your trips. Save 40% on average.</p>
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

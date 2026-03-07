import React from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";

/* ─── public trips data ─── */
const PUBLIC_TRIPS = [
    {
        title: "Northeast Backpacking",
        destination: "Meghalaya · Assam · Nagaland",
        dates: "Mar 15 – Mar 26",
        duration: "12 days",
        travelers: 14,
        spots: 6,
        difficulty: "Moderate",
        desc: "Explore living root bridges, Kaziranga, and the Hornbill Festival trail across Northeast India.",
    },
    {
        title: "Goa New Year Trip",
        destination: "North & South Goa",
        dates: "Dec 28 – Jan 3",
        duration: "7 days",
        travelers: 28,
        spots: 2,
        difficulty: "Easy",
        desc: "Beach parties, heritage walks, water sports, and the ultimate New Year countdown by the sea.",
    },
    {
        title: "Kedarnath Trek Group",
        destination: "Uttarakhand",
        dates: "May 10 – May 16",
        duration: "7 days",
        travelers: 18,
        spots: 7,
        difficulty: "Hard",
        desc: "Trek to one of India's holiest shrines at 3,583m. Includes Gaurikund to Kedarnath temple trail.",
    },
    {
        title: "Rajasthan Royal Circuit",
        destination: "Jaipur · Udaipur · Jodhpur",
        dates: "Nov 5 – Nov 14",
        duration: "10 days",
        travelers: 12,
        spots: 8,
        difficulty: "Easy",
        desc: "Forts, palaces, desert safaris, and Rajasthani cuisine — the complete heritage experience.",
    },
    {
        title: "Spiti Valley Expedition",
        destination: "Himachal Pradesh",
        dates: "Jun 1 – Jun 12",
        duration: "12 days",
        travelers: 10,
        spots: 5,
        difficulty: "Hard",
        desc: "High-altitude passes, ancient monasteries, and the raw beauty of the Trans-Himalayan desert.",
    },
    {
        title: "Kerala Backwaters Cruise",
        destination: "Alleppey · Munnar · Kochi",
        dates: "Aug 20 – Aug 26",
        duration: "7 days",
        travelers: 16,
        spots: 4,
        difficulty: "Easy",
        desc: "Houseboat stays, tea plantations, spice markets, and Kathakali performances in God's Own Country.",
    },
];

const STATS = [
    { value: "120+", label: "Active Trips" },
    { value: "3,400+", label: "Travelers" },
    { value: "42", label: "Destinations" },
];

export default function CommunityPage() {
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-black text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-end">
                        <div>
                            <AnimatedContent distance={20} direction="vertical" duration={0.4} ease="power2.out">
                                <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-white/30 rounded-full text-white/60 mb-6">
                                    Community Trips
                                </span>
                            </AnimatedContent>

                            <SplitText
                                text="Join community travel groups and explore destinations together."
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
                                <p className="mt-6 text-base text-white/35 leading-relaxed max-w-lg">
                                    Solo traveler? Find your crew. Browse public trips organized by real travelers, pick one that matches your vibe, and join with a single click.
                                </p>
                            </AnimatedContent>

                            <AnimatedContent distance={15} direction="vertical" duration={0.4} delay={0.5} ease="power2.out">
                                <div className="mt-8 flex items-center gap-3">
                                    {!isSignedIn ? (
                                        <SignInButton mode="modal">
                                            <button className="px-7 py-3 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all flex items-center gap-2">
                                                Create a trip
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                            </button>
                                        </SignInButton>
                                    ) : (
                                        <Link href="/dashboard" className="px-7 py-3 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all flex items-center gap-2">
                                            Create a trip
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        </Link>
                                    )}
                                </div>
                            </AnimatedContent>
                        </div>

                        {/* Stats */}
                        <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.4} ease="power2.out">
                            <div className="grid grid-cols-3 gap-3">
                                {STATS.map((s, i) => (
                                    <div key={i} className="text-center p-4 rounded-xl border border-white/10">
                                        <p className="text-2xl font-black tracking-tight">{s.value}</p>
                                        <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </section>

            {/* ═══════════ FILTERS ═══════════ */}
            <section className="py-6 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-wrap items-center gap-2">
                    {["All Trips", "Easy", "Moderate", "Hard", "This Month", "Spots Available"].map((f, i) => (
                        <button
                            key={f}
                            className={`px-4 py-1.5 text-[12px] font-semibold rounded-full transition-all ${i === 0
                                    ? "bg-black text-white"
                                    : "text-black/40 border border-black/10 hover:border-black/25 hover:text-black/60"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </section>

            {/* ═══════════ TRIP CARDS ═══════════ */}
            <section className="py-16 lg:py-24">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {PUBLIC_TRIPS.map((trip, i) => (
                            <AnimatedContent key={i} distance={30} direction="vertical" duration={0.5} delay={i * 0.06} ease="power2.out">
                                <div className="group border border-black/8 rounded-2xl overflow-hidden hover:border-black/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1">

                                    {/* Card header — black bar */}
                                    <div className="bg-black text-white px-6 py-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${trip.difficulty === "Easy"
                                                    ? "bg-white/15 text-white/70"
                                                    : trip.difficulty === "Moderate"
                                                        ? "bg-white/20 text-white/80"
                                                        : "bg-white text-black"
                                                }`}>
                                                {trip.difficulty}
                                            </span>
                                            <span className="text-[11px] text-white/30 font-medium">{trip.duration}</span>
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight">{trip.title}</h3>
                                        <p className="text-[12px] text-white/40 mt-1 flex items-center gap-1.5">
                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            {trip.destination}
                                        </p>
                                    </div>

                                    {/* Card body */}
                                    <div className="px-6 py-5">
                                        <p className="text-sm text-black/45 leading-relaxed mb-5">{trip.desc}</p>

                                        {/* Date row */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <svg className="w-4 h-4 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            <span className="text-[13px] font-medium text-black/50">{trip.dates}</span>
                                        </div>

                                        {/* Travelers + join */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2.5">
                                                {/* Avatar stack */}
                                                <div className="flex -space-x-1.5">
                                                    {Array.from({ length: Math.min(trip.travelers, 4) }).map((_, j) => (
                                                        <div
                                                            key={j}
                                                            className="w-7 h-7 rounded-full bg-black/8 border-2 border-white flex items-center justify-center text-[9px] font-bold text-black/35"
                                                        >
                                                            {String.fromCharCode(65 + j)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="text-[11px] text-black/35 leading-tight">
                                                    <span className="font-semibold text-black/60">{trip.travelers}</span> joined
                                                    <br />
                                                    <span className="font-semibold text-black/60">{trip.spots}</span> spots left
                                                </div>
                                            </div>

                                            {/* Join button */}
                                            {trip.spots > 0 ? (
                                                !isSignedIn ? (
                                                    <SignInButton mode="modal">
                                                        <button className="px-5 py-2 text-[12px] font-bold bg-black text-white rounded-full hover:bg-black/80 transition-all group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                                                            Join Trip →
                                                        </button>
                                                    </SignInButton>
                                                ) : (
                                                    <button className="px-5 py-2 text-[12px] font-bold bg-black text-white rounded-full hover:bg-black/80 transition-all group-hover:shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
                                                        Join Trip →
                                                    </button>
                                                )
                                            ) : (
                                                <span className="px-5 py-2 text-[12px] font-bold bg-black/5 text-black/25 rounded-full">
                                                    Full
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-20 lg:py-28 border-t border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-12">
                            How community trips work
                        </h2>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            {
                                step: "01",
                                title: "Browse Trips",
                                desc: "Filter by destination, difficulty, dates, or available spots. Find something that matches your travel style.",
                                icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                            },
                            {
                                step: "02",
                                title: "Join & Connect",
                                desc: "Click \"Join Trip\" to reserve your spot. Get access to the group chat and shared itinerary instantly.",
                                icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
                            },
                            {
                                step: "03",
                                title: "Travel Together",
                                desc: "Coordinate plans, share costs, and explore together. The trip organizer manages the itinerary for everyone.",
                                icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064",
                            },
                        ].map((s, i) => (
                            <AnimatedContent key={i} distance={25} direction="vertical" duration={0.5} delay={i * 0.08} ease="power2.out">
                                <div className="relative p-8 rounded-2xl border border-black/5 hover:border-black/15 transition-all">
                                    <span className="text-[64px] font-black text-black/[0.04] leading-none absolute top-4 right-6">{s.step}</span>
                                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={s.icon} /></svg>
                                    </div>
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
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
                            Don&apos;t travel alone. Find your crew.
                        </h2>
                        <p className="mt-4 text-white/35 text-base">Join an existing trip or create one for others to discover.</p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                            {!isSignedIn ? (
                                <>
                                    <SignInButton mode="modal">
                                        <button className="px-8 py-3.5 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all">
                                            Browse all trips →
                                        </button>
                                    </SignInButton>
                                    <SignInButton mode="modal">
                                        <button className="px-8 py-3.5 text-sm font-bold border border-white/15 text-white rounded-full hover:border-white/30 transition-all">
                                            Create a trip
                                        </button>
                                    </SignInButton>
                                </>
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

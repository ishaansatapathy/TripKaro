import { useState } from "react";
import Link from "@/lib/link";
import { SignInButton, UserButton, useAuth } from "@clerk/react";
import Logo from "@/components/Logo";

const DEMO_TRIP = {
    title: "Goa & Bali Escapade 2026",
    description: "The ultimate tropical crossover. Starting with the vibrant beaches and nightlife of Goa, India, and flying out to the serene, spiritual, and lush landscapes of Bali, Indonesia.",
    startDate: "2026-12-10",
    endDate: "2026-12-18",
    members: [
        { id: "1", name: "You (Guest)", role: "viewer" as const },
        { id: "2", name: "Rishabh K.", role: "owner" as const },
        { id: "3", name: "Ananya M.", role: "editor" as const },
    ],
};

const DEMO_DAYS = [
    {
        id: "day-1", date: "2026-12-10", order: 1,
        activities: [
            { id: "act-1", title: "Check-in at Taj Exotica, Goa", description: "Settle into the resort in Benaulim, South Goa", startTime: "14:00", endTime: "15:30", estimatedCost: "0 (Prepaid)", order: 1, tags: ["Hotel", "Relax"] },
            { id: "act-2", title: "Sunset at Palolem Beach", description: "Drinks and seafood by the beach shacks", startTime: "17:00", endTime: "21:00", estimatedCost: "₹3,500", order: 2, tags: ["Beach", "Food"] },
        ],
    },
    {
        id: "day-2", date: "2026-12-11", order: 2,
        activities: [
            { id: "act-4", title: "Fontainhas Heritage Walk", description: "Explore the colorful Latin Quarter in Panjim", startTime: "10:00", endTime: "13:00", estimatedCost: "₹1,200", order: 1, tags: ["Culture", "Walking"] },
            { id: "act-5", title: "Authentic Goan Thali Lunch", description: "Vinayak Family Restaurant, Assagao", startTime: "13:30", endTime: "15:00", estimatedCost: "₹1,800", order: 2, tags: ["Food", "Local"] },
        ],
    },
    {
        id: "day-3", date: "2026-12-14", order: 5,
        activities: [
            { id: "act-6", title: "Flight to Bali (DPS)", description: "GOI -> BOM -> DPS on Vistara/Singapore Airlines", startTime: "07:00", endTime: "18:30", estimatedCost: "₹22,500", order: 1, tags: ["Transit", "Flight"] },
            { id: "act-7", title: "Dinner at Jimbaran Bay", description: "Seafood dinner on the beach directly after landing", startTime: "20:00", endTime: "22:00", estimatedCost: "Rp 400k", order: 2, tags: ["Food", "Bali"] },
        ],
    },
];

function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDayDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

export default function DemoPage() {
    const [activeTab, setActiveTab] = useState("Itinerary");
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-3">
                        <Logo className="h-12 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        {!isLoaded ? (
                            <div className="w-20 h-8" />
                        ) : isSignedIn ? (
                            <>
                                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Logged In
                                </span>
                                <UserButton />
                            </>
                        ) : (
                            <>
                                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full border border-slate-200">
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    Guest Mode
                                </span>
                                <Link href="/sign-in" className="text-sm font-semibold text-slate-600 hover:text-black px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                    Log In
                                </Link>
                                <Link href="/sign-up" className="text-sm font-semibold text-white bg-black hover:bg-slate-800 px-4 py-2 rounded-lg shadow-xs transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Pill Navigation (Like MastryHub Inner Pages) */}
            <div className="max-w-3xl mx-auto px-6 py-8">
                <div className="bg-slate-100/80 p-1.5 rounded-xl flex items-center justify-between gap-1 overflow-x-auto shadow-xs border border-slate-200/60 font-medium text-sm">
                    {["Overview", "Itinerary", "Budget", "Members", "Settings"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 min-w-[100px] py-2 px-4 rounded-lg transition-all duration-200 ${activeTab === tab
                                ? "bg-white text-black shadow-sm"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pb-24">
                {/* Intro Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs mb-8">
                    <h1 className="text-3xl font-bold text-slate-900 mb-4">{DEMO_TRIP.title}</h1>
                    <p className="text-slate-500 leading-relaxed mb-6 max-w-4xl">
                        {DEMO_TRIP.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(DEMO_TRIP.startDate)} — {formatDate(DEMO_TRIP.endDate)}
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-4 py-2 rounded-lg">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {DEMO_TRIP.members.length} Members
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-black bg-slate-100 border border-slate-200 px-4 py-2 rounded-lg ml-auto">
                            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Draft
                        </div>
                    </div>
                </div>

                {/* Feature Highlights (Why Participate style) */}
                {activeTab === "Overview" && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs">
                        <h2 className="text-2xl font-bold text-slate-900 mb-8">Trip Highlights</h2>
                        <div className="grid md:grid-cols-3 gap-8 text-center divide-x divide-slate-100">
                            <div className="px-4">
                                <div className="w-14 h-14 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">Iconic Landmarks</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">Visit the most famous landmarks and temples around the city.</p>
                            </div>
                            <div className="px-4">
                                <div className="w-14 h-14 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">Street Food & Dining</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">Experience a culinary journey through authentic local markets.</p>
                            </div>
                            <div className="px-4">
                                <div className="w-14 h-14 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-2">Nature & Views</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">Day trips to scenic mountains and immersive art installations.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Itinerary Tab */}
                {activeTab === "Itinerary" && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-900">Detailed Schedule</h2>
                                <button disabled={!isSignedIn} className={`bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold ${!isSignedIn ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-800 transition-colors'}`}>
                                    + Add Day
                                </button>
                            </div>

                            {DEMO_DAYS.map((day) => (
                                <div key={day.id} className="relative pl-8 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-slate-200">
                                    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center shadow-sm">
                                        <div className="w-2 h-2 rounded-full bg-black"></div>
                                    </div>

                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                            {formatDayDate(day.date)}
                                            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded border border-slate-200">Day {day.order}</span>
                                        </h3>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        {day.activities.map((act) => (
                                            <div key={act.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-start gap-4">
                                                <div className="text-slate-500 font-semibold text-sm w-32 shrink-0 pt-0.5 whitespace-nowrap">
                                                    {act.startTime} — {act.endTime}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-start justify-between gap-4">
                                                        <h4 className="font-bold text-slate-900 text-base mb-1">{act.title}</h4>
                                                        {act.estimatedCost !== "0" && act.estimatedCost !== "0 (Prepaid)" ? (
                                                            <div className="shrink-0 text-sm font-bold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                                                                {act.estimatedCost}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                    <p className="text-sm text-slate-500 leading-relaxed max-w-xl mb-3">{act.description}</p>
                                                    <div className="flex items-center gap-2">
                                                        {act.tags?.map(tag => (
                                                            <span key={tag} className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button disabled={!isSignedIn} className={`w-full py-4 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-400 transition-colors flex items-center justify-center gap-2 ${!isSignedIn ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-50 hover:text-slate-600 hover:border-slate-300 cursor-pointer'}`}>
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add Activity
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs sticky top-24">
                                {!isSignedIn ? (
                                    <>
                                        <h3 className="font-bold text-slate-900 text-lg mb-4">Action Required</h3>
                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                                            <p className="text-sm text-blue-800 font-medium mb-3">
                                                You are currently viewing a read-only demo.
                                            </p>
                                            <SignInButton mode="modal">
                                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm shadow-sm transition-colors">
                                                    Create Account to Edit
                                                </button>
                                            </SignInButton>
                                        </div>
                                    </>
                                ) : (
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-emerald-800 font-medium">
                                            You're signed in! This is a demo trip preview.
                                        </p>
                                    </div>
                                )}

                                <h3 className="font-bold text-slate-900 text-lg mb-4 pt-4 border-t border-slate-100">Team Roles</h3>
                                <ul className="space-y-3">
                                    {DEMO_TRIP.members.map((member) => (
                                        <li key={member.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold">
                                                    {member.name.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">{member.name}</span>
                                            </div>
                                            <span className="text-xs font-bold text-slate-400 capitalize bg-slate-50 px-2 py-1 rounded border border-slate-100">
                                                {member.role}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {["Budget", "Members", "Settings"].includes(activeTab) && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-xs">
                        <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        {isSignedIn ? (
                            <>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">{activeTab} — Demo Preview</h2>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                    This is a demo trip. Create your own trip to manage {activeTab.toLowerCase()} and collaborate with friends.
                                </p>
                                <Link href="/trip-planning" className="bg-black hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-sm transition-colors inline-block">
                                    Create Your Trip
                                </Link>
                            </>
                        ) : (
                            <>
                                <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to unlock {activeTab}</h2>
                                <p className="text-slate-500 mb-6 max-w-sm mx-auto">
                                    Create an account to manage budgets, invite members, and configure trip settings.
                                </p>
                                <SignInButton mode="modal">
                                    <button className="bg-black hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-sm transition-colors">
                                        Create Free Account
                                    </button>
                                </SignInButton>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

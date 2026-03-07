import { useState, useEffect, useCallback } from "react";
import { useAuth, UserButton } from "@clerk/react";
import { useNavigate } from "react-router-dom";
import Link from "@/lib/link";
import Logo from "@/components/Logo";

interface Trip {
    _id: string;
    title: string;
    startDate: string;
    endDate: string;
    ownerId: string;
    createdAt: string;
    role?: string;
}

const TRIPS_STORAGE_KEY = "tripkaro_trips";

function loadTrips(): Trip[] {
    try {
        const raw = localStorage.getItem(TRIPS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveTrips(trips: Trip[]) {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TripCard({ trip, isOwned }: { trip: Trip; isOwned: boolean }) {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-black transition-colors">{trip.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">
                        {formatDate(trip.startDate)} — {formatDate(trip.endDate)}
                    </p>
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isOwned
                    ? "bg-black text-white border-black"
                    : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                    {isOwned ? "Owner" : trip.role || "Member"}
                </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {days} day{days !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {new Date(trip.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { isSignedIn, isLoaded, userId } = useAuth();
    const navigate = useNavigate();

    const [myTrips, setMyTrips] = useState<Trip[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Create trip modal state
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newStart, setNewStart] = useState("");
    const [newEnd, setNewEnd] = useState("");
    const [creating, setCreating] = useState(false);

    const refreshTrips = useCallback(() => {
        const all = loadTrips();
        const mine = userId ? all.filter((t) => t.ownerId === userId) : all;
        setMyTrips(mine);
        setLoading(false);
    }, [userId]);

    useEffect(() => {
        refreshTrips();
    }, [refreshTrips]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newStart || !newEnd) return;
        try {
            setCreating(true);
            setError("");
            const trip: Trip = {
                _id: crypto.randomUUID(),
                title: newTitle.trim(),
                startDate: newStart,
                endDate: newEnd,
                ownerId: userId ?? "local",
                createdAt: new Date().toISOString(),
            };
            const all = loadTrips();
            all.push(trip);
            saveTrips(all);
            setNewTitle("");
            setNewStart("");
            setNewEnd("");
            setShowCreate(false);
            refreshTrips();
            navigate(`/trip/${trip._id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create trip. Please try again.");
        } finally {
            setCreating(false);
        }
    };

    const joinedTrips: Trip[] = [];

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <Logo className="h-12 w-auto" />
                    </Link>
                    <div className="flex items-center gap-4">
                        {isSignedIn ? (
                            <>
                                <Link href="/demo" className="text-sm font-semibold text-slate-600 hover:text-black px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                                    Demo Trip
                                </Link>
                                <UserButton />
                            </>
                        ) : (
                            <>
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

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                        <p className="text-slate-500 mt-1">Manage your trips and collaborations</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-black hover:bg-slate-800 text-white font-semibold py-2.5 px-6 rounded-lg text-sm shadow-sm transition-colors flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        Create New Trip
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span className="text-slate-500 text-sm">Loading your trips...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* My Trips */}
                        <section className="mb-12">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center text-xs font-bold">{myTrips.length}</span>
                                My Trips
                            </h2>
                            {myTrips.length === 0 ? (
                                <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500 mb-4">You haven't created any trips yet</p>
                                    <button
                                        onClick={() => setShowCreate(true)}
                                        className="bg-black hover:bg-slate-800 text-white font-semibold py-2 px-5 rounded-lg text-sm transition-colors"
                                    >
                                        Create Your First Trip
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {myTrips.map((trip) => (
                                        <TripCard key={trip._id} trip={trip} isOwned />
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* Joined Trips */}
                        <section>
                            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center text-xs font-bold">{joinedTrips.length}</span>
                                Trips I Joined
                            </h2>
                            {joinedTrips.length === 0 ? (
                                <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center">
                                    <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-slate-500">You haven't joined any trips yet. Ask friends to invite you!</p>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {joinedTrips.map((trip) => (
                                        <TripCard key={trip._id} trip={trip} isOwned={false} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>

            {/* Create Trip Modal */}
            {showCreate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowCreate(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        {/* Modal header */}
                        <div className="px-8 pt-8 pb-0">
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">Create New Trip</h2>
                                    <p className="text-xs text-slate-400">Plan your next adventure</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleCreate} className="px-8 pb-8 pt-6 space-y-5">
                            {/* Trip Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Trip Name</label>
                                <input
                                    type="text"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="e.g. Goa Beach Vacation"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black focus:bg-white transition-all"
                                    required
                                />
                            </div>

                            {/* Date Section */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">When</label>
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-1">
                                    <div className="grid grid-cols-2 gap-1">
                                        {/* Start Date */}
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                value={newStart}
                                                onChange={(e) => setNewStart(e.target.value)}
                                                min={new Date().toISOString().split("T")[0]}
                                                className="w-full pl-9 pr-3 py-3 bg-white border border-transparent rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer [color-scheme:light]"
                                                required
                                            />
                                        </div>

                                        {/* End Date */}
                                        <div className="relative">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                                </svg>
                                            </div>
                                            <input
                                                type="date"
                                                value={newEnd}
                                                onChange={(e) => setNewEnd(e.target.value)}
                                                min={newStart || new Date().toISOString().split("T")[0]}
                                                className="w-full pl-9 pr-3 py-3 bg-white border border-transparent rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all cursor-pointer [color-scheme:light]"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Duration preview */}
                                    {newStart && newEnd && new Date(newEnd) >= new Date(newStart) && (
                                        <div className="mt-1 px-3 py-2 flex items-center justify-center gap-2">
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {Math.ceil((new Date(newEnd).getTime() - new Date(newStart).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                            </span>
                                            <span className="text-slate-300">·</span>
                                            <span className="text-[11px] text-slate-400">
                                                {new Date(newStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} → {new Date(newEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 py-3 px-4 bg-black hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Create Trip
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

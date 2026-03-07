import React from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";

/* ─── example data ─── */
const DAYS = [
    {
        day: 1,
        title: "Shillong",
        activities: [
            { time: "09:00", name: "Arrive at Shillong Airport", cost: "—", icon: "M5 13l4 4L19 7" },
            { time: "11:00", name: "Ward's Lake & Botanical Garden", cost: "₹50", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
            { time: "14:00", name: "Lunch at Café Shillong", cost: "₹600", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" },
            { time: "16:00", name: "Don Bosco Museum", cost: "₹100", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        ],
    },
    {
        day: 2,
        title: "Cherrapunji",
        activities: [
            { time: "07:00", name: "Drive to Cherrapunji", cost: "₹1,200", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
            { time: "10:00", name: "Living Root Bridges Trek", cost: "₹200", icon: "M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" },
            { time: "14:00", name: "Nohkalikai Falls Viewpoint", cost: "Free", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { time: "17:00", name: "Seven Sisters Falls", cost: "Free", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" },
        ],
    },
    {
        day: 3,
        title: "Dawki",
        activities: [
            { time: "08:00", name: "Drive to Dawki", cost: "₹800", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3" },
            { time: "11:00", name: "Umngot River Boating", cost: "₹500", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21" },
            { time: "14:00", name: "India-Bangladesh Border Visit", cost: "Free", icon: "M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" },
            { time: "16:00", name: "Return to Shillong & Departure", cost: "₹1,200", icon: "M5 13l4 4L19 7" },
        ],
    },
];

const COLLABORATORS = [
    { name: "Isha", role: "Owner", initials: "IA" },
    { name: "Arjun", role: "Editor", initials: "AK" },
    { name: "Priya", role: "Editor", initials: "PS" },
    { name: "Rahul", role: "Viewer", initials: "RG" },
];

export default function TripPlanningPage() {
    const { isSignedIn, isLoaded } = useAuth();

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-end">
                        <div>
                            <AnimatedContent distance={20} direction="vertical" duration={0.4} ease="power2.out">
                                <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-current rounded-full opacity-60 mb-6">
                                    Trip Planning
                                </span>
                            </AnimatedContent>

                            <SplitText
                                text="Plan trips together with friends using a structured itinerary builder."
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
                                <p className="mt-6 text-base text-black/45 leading-relaxed max-w-lg">
                                    Create trips, add day-by-day itineraries, schedule activities with costs, and invite friends to collaborate — all in real-time.
                                </p>
                            </AnimatedContent>
                        </div>

                        {/* Quick stats */}
                        <AnimatedContent distance={20} direction="vertical" duration={0.5} delay={0.4} ease="power2.out">
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: "3 Days", label: "Duration" },
                                    { value: "₹4,650", label: "Est. Budget" },
                                    { value: "4 People", label: "Collaborators" },
                                ].map((s, i) => (
                                    <div key={i} className="text-center p-4 rounded-xl border border-black/5">
                                        <p className="text-xl font-black tracking-tight">{s.value}</p>
                                        <p className="text-[10px] font-medium text-black/35 uppercase tracking-wider mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </section>

            {/* ═══════════ TRIP DASHBOARD MOCKUP ═══════════ */}
            <section className="py-16 lg:py-24 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">

                    {/* Trip header card */}
                    <AnimatedContent distance={30} direction="vertical" duration={0.6} ease="power2.out">
                        <div className="bg-white border border-black/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden mb-6">
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-black/5 bg-black/[0.02]">
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="ml-3 text-[10px] font-medium text-black/30">tripkaro.app/trip/meghalaya-adventure</span>
                            </div>
                            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight"> Meghalaya Adventure</h2>
                                    <p className="text-sm text-black/40 mt-1">3 days · 12 activities · ₹4,650 estimated</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Collaborator avatars */}
                                    <div className="flex items-center -space-x-2">
                                        {COLLABORATORS.map((c, i) => (
                                            <div
                                                key={i}
                                                className="w-8 h-8 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center border-2 border-white"
                                                title={`${c.name} (${c.role})`}
                                            >
                                                {c.initials}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="px-3 py-1.5 text-[11px] font-semibold border border-black/10 rounded-full hover:border-black/25 transition-all flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                        Invite
                                    </button>
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>

                    {/* Day columns */}
                    <div className="grid lg:grid-cols-3 gap-4">
                        {DAYS.map((day, di) => (
                            <AnimatedContent key={di} distance={30} direction="vertical" duration={0.5} delay={di * 0.1} ease="power2.out">
                                <div className="rounded-2xl border border-black/8 overflow-hidden hover:border-black/15 transition-all">
                                    {/* Day header */}
                                    <div className="bg-black text-white px-5 py-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Day {day.day}</p>
                                            <h3 className="text-lg font-black tracking-tight mt-0.5">{day.title}</h3>
                                        </div>
                                        <span className="text-[11px] font-medium text-white/30 bg-white/10 px-2 py-0.5 rounded-full">
                                            {day.activities.length} activities
                                        </span>
                                    </div>

                                    {/* Activities */}
                                    <div className="divide-y divide-black/5">
                                        {day.activities.map((act, ai) => (
                                            <div key={ai} className="flex items-start gap-3.5 px-5 py-3.5 hover:bg-black/[0.015] transition-colors group">
                                                {/* Time */}
                                                <span className="text-[11px] font-mono font-semibold text-black/25 mt-0.5 shrink-0 w-10">
                                                    {act.time}
                                                </span>
                                                {/* Icon */}
                                                <div className="w-7 h-7 rounded-lg bg-black/5 flex items-center justify-center shrink-0 group-hover:bg-black/10 transition-colors">
                                                    <svg className="w-3.5 h-3.5 text-black/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d={act.icon} />
                                                    </svg>
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">{act.name}</p>
                                                    <p className="text-[11px] text-black/30 mt-0.5">{act.cost}</p>
                                                </div>
                                                {/* Drag handle */}
                                                <svg className="w-4 h-4 text-black/10 mt-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                                                </svg>
                                            </div>
                                        ))}

                                        {/* Add activity button */}
                                        <div className="px-5 py-3 flex items-center gap-2 text-black/20 hover:text-black/40 transition-colors cursor-pointer">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                                            <span className="text-[12px] font-medium">Add activity</span>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ COLLABORATION FEATURES ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-12">
                            Collaboration, built in
                        </h2>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                title: "Create Trips",
                                desc: "Set up a trip in seconds — add a name, dates, and cover photo.",
                                icon: "M12 4v16m8-8H4",
                            },
                            {
                                title: "Invite Friends",
                                desc: "Share a link or add collaborators by email with Owner, Editor, or Viewer roles.",
                                icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z",
                            },
                            {
                                title: "Track Budget",
                                desc: "See per-day and total costs at a glance. Split expenses across members.",
                                icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z",
                            },
                            {
                                title: "Real-time Sync",
                                desc: "Changes sync instantly. Everyone sees updates as they happen.",
                                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                            },
                        ].map((f, i) => (
                            <AnimatedContent key={i} distance={25} direction="vertical" duration={0.5} delay={i * 0.06} ease="power2.out">
                                <div className="text-center p-7 rounded-2xl border border-black/5 hover:border-black/15 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                                        </svg>
                                    </div>
                                    <h3 className="text-sm font-bold mb-1">{f.title}</h3>
                                    <p className="text-[12px] text-black/35 leading-relaxed">{f.desc}</p>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ TEAM ROLES ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-4xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-4">Who's on this trip?</h2>
                        <p className="text-center text-sm text-black/35 mb-10">Every member has a role. Control who can edit and who can view.</p>
                    </AnimatedContent>

                    <AnimatedContent distance={30} direction="vertical" duration={0.6} delay={0.1} ease="power2.out">
                        <div className="bg-white border border-black/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden">
                            <div className="grid grid-cols-[1fr_auto_auto] items-center px-6 py-3 border-b border-black/5 text-[10px] font-bold text-black/30 uppercase tracking-wider">
                                <span>Member</span>
                                <span className="w-20 text-center">Role</span>
                                <span className="w-20 text-center">Status</span>
                            </div>
                            {COLLABORATORS.map((c, i) => (
                                <div key={i} className="grid grid-cols-[1fr_auto_auto] items-center px-6 py-4 border-b border-black/5 last:border-b-0 hover:bg-black/[0.01] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-black text-white text-[11px] font-bold flex items-center justify-center">
                                            {c.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{c.name}</p>
                                            <p className="text-[11px] text-black/30">{c.name.toLowerCase()}@email.com</p>
                                        </div>
                                    </div>
                                    <span className={`w-20 text-center text-[11px] font-bold py-1 rounded-full ${c.role === "Owner"
                                            ? "bg-black text-white"
                                            : c.role === "Editor"
                                                ? "bg-black/5 text-black/60"
                                                : "bg-black/[0.02] text-black/30"
                                        }`}>
                                        {c.role}
                                    </span>
                                    <span className="w-20 text-center">
                                        <span className="inline-block w-2 h-2 rounded-full bg-black/20" title="Online" />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </AnimatedContent>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="bg-black text-white py-24 lg:py-32 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <AnimatedContent distance={25} direction="vertical" duration={0.6} ease="power2.out">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Start planning your trip</h2>
                        <p className="mt-4 text-white/35 text-base">Create your first itinerary in under a minute. Invite your crew.</p>
                        <div className="mt-8">
                            {!isLoaded ? (
                                <span className="px-8 py-3.5 text-sm font-bold bg-white/40 text-black rounded-full inline-block cursor-wait">
                                    Loading…
                                </span>
                            ) : !isSignedIn ? (
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

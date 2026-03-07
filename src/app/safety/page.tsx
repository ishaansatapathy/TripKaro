import React, { useState } from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";

export default function SafetyPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const [sosActive, setSosActive] = useState(false);

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="bg-black text-white">
                <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-20 lg:pt-36 lg:pb-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left: Text */}
                        <div>
                            <AnimatedContent distance={20} direction="vertical" duration={0.4} ease="power2.out">
                                <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-white/25 rounded-full text-white/50 mb-6">
                                    Travel Safety SOS
                                </span>
                            </AnimatedContent>

                            <SplitText
                                text="One tap when you need help. Everywhere you travel."
                                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.08]"
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
                                    If you ever feel unsafe, press the SOS button. Your live location is instantly shared with emergency contacts, and nearby hospitals and police stations are shown on-screen.
                                </p>
                            </AnimatedContent>

                            <AnimatedContent distance={15} direction="vertical" duration={0.4} delay={0.5} ease="power2.out">
                                <div className="mt-8 flex items-center gap-5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/30" />
                                        <span className="text-[12px] text-white/40 font-medium">Works offline</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/30" />
                                        <span className="text-[12px] text-white/40 font-medium">24/7 active</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-white/30" />
                                        <span className="text-[12px] text-white/40 font-medium">No data required</span>
                                    </div>
                                </div>
                            </AnimatedContent>
                        </div>

                        {/* Right: SOS Button Illustration */}
                        <AnimatedContent distance={40} direction="vertical" duration={0.8} delay={0.2} ease="power2.out">
                            <div className="flex items-center justify-center">
                                <div className="relative">
                                    {/* Outer pulse rings */}
                                    {sosActive && (
                                        <>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-72 h-72 rounded-full border border-white/5 animate-ping" style={{ animationDuration: "2s" }} />
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-56 h-56 rounded-full border border-white/10 animate-ping" style={{ animationDuration: "1.5s" }} />
                                            </div>
                                        </>
                                    )}

                                    {/* Static rings */}
                                    <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border border-white/[0.04] flex items-center justify-center">
                                        <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-full border border-white/[0.06] flex items-center justify-center">
                                            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-white/[0.1] flex items-center justify-center">
                                                {/* SOS Button */}
                                                <button
                                                    onClick={() => setSosActive(!sosActive)}
                                                    className={`w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer select-none ${sosActive
                                                            ? "bg-white text-black shadow-[0_0_60px_rgba(255,255,255,0.25)] scale-110"
                                                            : "bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:scale-105"
                                                        }`}
                                                >
                                                    <span className="text-2xl sm:text-3xl font-black tracking-wider">SOS</span>
                                                    <span className="text-[9px] font-medium opacity-50 mt-0.5">
                                                        {sosActive ? "ACTIVE" : "TAP TO TEST"}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status label */}
                                    {sosActive && (
                                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            <span className="text-[11px] font-bold text-white/60 tracking-wider uppercase">Sharing location...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </section>

            {/* ═══════════ WHAT HAPPENS WHEN YOU TAP ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-4">
                            What happens when you tap SOS
                        </h2>
                        <p className="text-center text-sm text-black/35 mb-14 max-w-lg mx-auto">
                            In under 3 seconds, the system activates a full safety response — no typing, no searching, no delays.
                        </p>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                step: "1",
                                title: "Live Location Shared",
                                desc: "Your GPS coordinates are instantly sent to your pre-set emergency contacts via SMS and in-app notification.",
                                icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
                                detail: "GPS accuracy: ±3m",
                            },
                            {
                                step: "2",
                                title: "Contacts Notified",
                                desc: "Your emergency contacts receive a real-time alert with your name, location, and a live tracking link.",
                                icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
                                detail: "SMS + Push + Email",
                            },
                            {
                                step: "3",
                                title: "Nearest Hospitals",
                                desc: "The closest hospitals and medical facilities appear on your map with distance, phone number, and directions.",
                                icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                                detail: "Auto-sorted by distance",
                            },
                            {
                                step: "4",
                                title: "Police Stations",
                                desc: "Nearby police stations are displayed with contact numbers and the option to directly call them.",
                                icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                                detail: "One-tap call",
                            },
                        ].map((item, i) => (
                            <AnimatedContent key={i} distance={30} direction="vertical" duration={0.5} delay={i * 0.08} ease="power2.out">
                                <div className="p-6 rounded-2xl border border-black/8 hover:border-black/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all duration-300 h-full flex flex-col">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d={item.icon} /></svg>
                                        </div>
                                        <span className="text-[40px] font-black text-black/[0.05] leading-none">{item.step}</span>
                                    </div>
                                    <h3 className="text-base font-bold mb-2">{item.title}</h3>
                                    <p className="text-[12px] text-black/35 leading-relaxed flex-1">{item.desc}</p>
                                    <div className="mt-4 pt-3 border-t border-black/5">
                                        <span className="text-[10px] font-semibold text-black/25 uppercase tracking-wider">{item.detail}</span>
                                    </div>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SOS DASHBOARD MOCKUP ═══════════ */}
            <section className="py-16 lg:py-24 border-b border-black/5">
                <div className="max-w-5xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={30} direction="vertical" duration={0.6} ease="power2.out">
                        <div className="bg-black text-white rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
                            {/* Header */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 bg-white/[0.02]">
                                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                                <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
                                <span className="ml-3 text-[10px] font-medium text-white/25">tripkaro.app/safety — SOS Active</span>
                                <div className="ml-auto flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-[10px] font-medium text-white/40">LIVE</span>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-[1fr_260px] min-h-[350px]">
                                {/* Map area */}
                                <div className="relative p-6">
                                    {/* Grid */}
                                    <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                                    {/* User location */}
                                    <div className="absolute" style={{ left: "40%", top: "45%" }}>
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-white/5 animate-ping" style={{ animationDuration: "2s" }} />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Nearby services markers */}
                                    {[
                                        { label: "🏥 GMC Hospital", x: 55, y: 30, dist: "1.2 km" },
                                        { label: "🏥 Manipal Hospital", x: 70, y: 55, dist: "3.5 km" },
                                        { label: "👮 Panaji Police", x: 30, y: 65, dist: "0.8 km" },
                                        { label: "👮 Traffic Police", x: 65, y: 75, dist: "2.1 km" },
                                    ].map((m, i) => (
                                        <div key={i} className="absolute" style={{ left: `${m.x}%`, top: `${m.y}%` }}>
                                            <div className="bg-white/10 backdrop-blur border border-white/10 rounded-lg px-2.5 py-1.5 whitespace-nowrap">
                                                <p className="text-[10px] font-bold">{m.label}</p>
                                                <p className="text-[8px] text-white/30">{m.dist}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* SOS status */}
                                    <div className="absolute top-6 left-6 bg-white/10 backdrop-blur border border-white/10 rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                            <span className="text-[11px] font-black tracking-wider">SOS ACTIVE</span>
                                        </div>
                                        <p className="text-[9px] text-white/35">Sharing location · 3 contacts notified</p>
                                    </div>
                                </div>

                                {/* Right panel */}
                                <div className="border-l border-white/5 p-5 space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Emergency Contacts</p>
                                        {[
                                            { name: "Mom", status: "Notified ✓" },
                                            { name: "Arjun (Friend)", status: "Notified ✓" },
                                            { name: "Hotel Reception", status: "Notified ✓" },
                                        ].map((c, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                <span className="text-[12px] font-medium">{c.name}</span>
                                                <span className="text-[10px] text-white/30">{c.status}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-2">Nearest Help</p>
                                        {[
                                            { name: "Panaji Police", dist: "0.8 km", action: "Call" },
                                            { name: "GMC Hospital", dist: "1.2 km", action: "Navigate" },
                                        ].map((h, i) => (
                                            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                <div>
                                                    <p className="text-[12px] font-medium">{h.name}</p>
                                                    <p className="text-[9px] text-white/25">{h.dist}</p>
                                                </div>
                                                <button className="px-3 py-1 text-[10px] font-bold bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                                    {h.action}
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-2.5 bg-white text-black text-[12px] font-bold rounded-full hover:bg-white/90 transition-all mt-2">
                                        Cancel SOS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>
            </section>

            {/* ═══════════ WHO NEEDS THIS ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-4">
                            Built for travelers who go further
                        </h2>
                        <p className="text-center text-sm text-black/35 mb-14 max-w-lg mx-auto">
                            Whether you're solo trekking or in an unfamiliar city, SOS keeps you connected to help.
                        </p>
                    </AnimatedContent>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                title: "Solo Travelers",
                                desc: "Traveling alone shouldn't feel unsafe. SOS gives you a safety net wherever you go.",
                                emoji: "🧑‍🎒",
                            },
                            {
                                title: "Remote Areas",
                                desc: "In areas with limited connectivity, SOS works with GPS and SMS — no internet needed.",
                                emoji: "🏔️",
                            },
                            {
                                title: "Trekking Groups",
                                desc: "Mountain trails, forests, and valleys — alert your group leader and nearest rescue team.",
                                emoji: "🥾",
                            },
                            {
                                title: "International Travel",
                                desc: "Unfamiliar emergency numbers? We auto-detect your country and show local resources.",
                                emoji: "✈️",
                            },
                        ].map((u, i) => (
                            <AnimatedContent key={i} distance={25} direction="vertical" duration={0.5} delay={i * 0.06} ease="power2.out">
                                <div className="p-7 rounded-2xl border border-black/5 hover:border-black/15 hover:shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 text-center">
                                    <span className="text-3xl block mb-4">{u.emoji}</span>
                                    <h3 className="text-base font-bold mb-1.5">{u.title}</h3>
                                    <p className="text-[12px] text-black/35 leading-relaxed">{u.desc}</p>
                                </div>
                            </AnimatedContent>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ SETUP STEPS ═══════════ */}
            <section className="py-20 lg:py-28 border-b border-black/5">
                <div className="max-w-4xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-14">
                            Set up in 30 seconds
                        </h2>
                    </AnimatedContent>

                    <div className="space-y-4">
                        {[
                            { step: "01", title: "Add emergency contacts", desc: "Family, friends, or your hotel — add anyone you trust to be notified in an emergency." },
                            { step: "02", title: "Allow location access", desc: "We only use your location when SOS is activated. Your privacy is fully protected." },
                            { step: "03", title: "You're protected", desc: "The SOS button is always accessible from your dashboard and trip pages. One tap is all it takes." },
                        ].map((s, i) => (
                            <AnimatedContent key={i} distance={20} direction="vertical" duration={0.4} delay={i * 0.08} ease="power2.out">
                                <div className="flex items-start gap-5 p-6 rounded-2xl border border-black/5 hover:border-black/15 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center text-sm font-black shrink-0">{s.step}</div>
                                    <div>
                                        <h3 className="text-base font-bold mb-1">{s.title}</h3>
                                        <p className="text-sm text-black/40 leading-relaxed">{s.desc}</p>
                                    </div>
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
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Travel with confidence</h2>
                        <p className="mt-4 text-white/35 text-base">Set up your emergency contacts and travel safer everywhere.</p>
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

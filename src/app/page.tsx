import { useAuth } from "@clerk/react";
import Link from "@/lib/link";
import React from "react";
import AnimatedContent from "@/components/AnimatedContent";
import BlurText from "@/components/BlurText";
import RotatingText from "@/components/RotatingText";
import ClickSpark from "@/components/ClickSpark";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroPlaneScene from "@/components/HeroPlaneScene";
import MagicBento from "@/components/MagicBento";

type FeatureCard = {
  color: string;
  label: string;
  title: string;
  description: string;
  icon: string;
  href: string;
};

/* ─── feature cards data ─── */
const FEATURES = [
  {
    title: "Trip Planning",
    desc: "Build day-by-day itineraries with drag-and-drop, cost tracking, and role-based access.",
    href: "/trip-planning",
    icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  },
  {
    title: "Community Trips",
    desc: "Discover open trips, join groups, and travel with like-minded adventurers.",
    href: "/community",
    icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
  },
  {
    title: "Traveler Chat",
    desc: "Real-time group messaging with location sharing, polls, and file attachments.",
    href: "/chat",
    icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
  },
  {
    title: "Smart Explorer",
    desc: "Interactive maps with curated local spots, hidden gems, and offline access.",
    href: "/explorer",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    title: "Travel Safety",
    desc: "One-tap SOS, silent trigger, safe-walk tracking, and local emergency info.",
    href: "/safety",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    title: "Travel Deals",
    desc: "Personalized flights, stays, and experience deals matched to your trips.",
    href: "/deals",
    icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z",
  },
];

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <ClickSpark sparkColor="#000" sparkSize={10} sparkRadius={20} sparkCount={12}>
      <div className="min-h-screen bg-white text-black antialiased">
        <Navbar />

        {/* ═══════════ HERO ═══════════ */}
        <section className="relative min-h-[calc(100vh-64px)] flex items-center border-b border-black/5">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 w-full">
            <div className="grid grid-cols-[minmax(0,1fr)_120px] sm:grid-cols-[minmax(0,1fr)_180px] lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">
              {/* LEFT: Text */}
              <div className="py-20 lg:py-0 flex flex-col gap-6">
                <AnimatedContent distance={20} direction="vertical" duration={0.4} delay={0} ease="power2.out">
                  <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-current rounded-full opacity-60">
                    Built for modern travelers
                  </span>
                </AnimatedContent>

                {/* Headline */}
                <div>
                  <BlurText
                    text="Your friends cancelled."
                    className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight"
                    delay={80}
                    animateBy="words"
                    direction="bottom"
                    animationFrom={{ filter: "blur(6px)", opacity: 0, y: 12 }}
                    animationTo={[{ filter: "blur(0px)", opacity: 1, y: 0 }]}
                    stepDuration={0.5}
                  />
                  <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight text-black/30">
                      We found
                    </span>
                    <RotatingText
                      texts={[
                        "better buddies.",
                        "real travelers.",
                        "your squad.",
                        "new friends.",
                        "the vibe.",
                      ]}
                      mainClassName="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-tight overflow-hidden pb-1"
                      staggerFrom="first"
                      staggerDuration={0.025}
                      splitBy="characters"
                      rotationInterval={2500}
                      transition={{ type: "spring", damping: 30, stiffness: 200 }}
                    />
                  </div>
                </div>

                {/* Subtext */}
                <p className="text-base sm:text-lg text-black/45 leading-relaxed max-w-md">
                  Plan trips, find travel partners, and explore together — with people who won't ghost the group chat.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3.5">
                    {!isLoaded ? (
                      <span className="px-8 py-3.5 text-sm font-bold text-white bg-black/40 rounded-full cursor-wait">
                        Loading…
                      </span>
                    ) : !isSignedIn ? (
                      <Link href="/sign-in" className="px-8 py-3.5 text-sm font-bold text-white bg-black rounded-full hover:bg-black/80 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2">
                        Start Planning
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="px-8 py-3.5 text-sm font-bold text-white bg-black rounded-full hover:bg-black/80 shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all flex items-center gap-2">
                        Go to Dashboard
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    )}
                    <Link href="/community" className="px-8 py-3.5 text-sm font-bold border border-black/15 rounded-full hover:border-black/40 transition-all">
                      Explore Community
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-8 pt-2">
                    {[
                      { value: "12K+", label: "Travelers" },
                      { value: "3,200", label: "Trips" },
                      { value: "98%", label: "Satisfaction" },
                    ].map((s, i) => (
                      <div key={i} className="text-left">
                        <p className="text-lg font-black tracking-tight">{s.value}</p>
                        <p className="text-[10px] font-medium text-black/35 uppercase tracking-wider">{s.label}</p>
                      </div>
                    ))}
                </div>
              </div>

              {/* RIGHT: 3D Plane */}
              <AnimatedContent distance={60} direction="horizontal" duration={0.9} delay={0.3} ease="power2.out" reverse>
                <div className="relative h-[220px] sm:h-[320px] lg:h-[550px]">
                  <HeroPlaneScene />
                </div>
              </AnimatedContent>
            </div>
          </div>
        </section>

        {/* ═══════════ FEATURES — BENTO GRID ═══════════ */}
        <section className="py-24 lg:py-32 bg-black">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
              <div className="text-center mb-14">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">Everything you need to travel smarter</h2>
                <p className="mt-4 text-base text-white/40 max-w-xl mx-auto">Six powerful tools designed to make group travel effortless.</p>
              </div>
            </AnimatedContent>

            <div className="flex justify-center">
              <MagicBento
                cards={FEATURES.map((f, i) => ({
                  color: '#0a0a0a',
                  label: `0${i + 1}`,
                  title: f.title,
                  description: f.desc,
                  icon: f.icon,
                  href: f.href,
                }))}
                renderCard={(card: FeatureCard, index: number) => (
                  <a href={card.href} className="flex flex-col justify-between h-full w-full group no-underline">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={card.icon} />
                        </svg>
                      </div>
                      <span className="text-xs font-mono text-white/30 tracking-widest uppercase">{card.label}</span>
                    </div>
                    <div className="mt-auto">
                      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-1 group-hover:translate-x-0.5 transition-transform">{card.title}</h3>
                      <p className="text-xs sm:text-sm text-white/50 leading-relaxed">{card.description}</p>
                      <div className="mt-3 flex items-center gap-1.5 text-white/30 group-hover:text-white/60 transition-colors">
                        <span className="text-[10px] font-semibold uppercase tracking-wider">Explore</span>
                        <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </a>
                )}
              />
            </div>
          </div>
        </section>

        {/* ═══════════ FINAL CTA ═══════════ */}
        <section className="relative bg-black text-white overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <span
              className="text-[8rem] sm:text-[12rem] lg:text-[18rem] font-black tracking-tighter whitespace-nowrap leading-none"
              style={{
                background: "linear-gradient(135deg, rgba(180,160,200,0.12) 0%, rgba(160,190,210,0.10) 50%, rgba(200,180,190,0.12) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              TRIPKARO
            </span>
          </div>
          <div className="relative max-w-4xl mx-auto px-6 lg:px-10 py-28 lg:py-40 text-center">
            <AnimatedContent distance={30} direction="vertical" duration={0.6} ease="power2.out">
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.08]">
                Start Planning Your Next Adventure
              </h2>
              <p className="mt-6 text-base sm:text-lg text-white/35 max-w-xl mx-auto leading-relaxed">
                Plan trips, explore destinations, travel safely, and connect with fellow travelers.
              </p>
              <div className="mt-10">
                {!isSignedIn ? (
                  <Link href="/sign-in" className="px-10 py-4 text-base font-bold bg-white text-black rounded-full hover:bg-white/90 shadow-[0_4px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)] transition-all inline-flex items-center gap-2.5 mx-auto hover:scale-105">
                    Start Your Journey
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                ) : (
                  <Link href="/dashboard" className="px-10 py-4 text-base font-bold bg-white text-black rounded-full hover:bg-white/90 shadow-[0_4px_30px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_40px_rgba(255,255,255,0.2)] transition-all inline-flex items-center gap-2.5 mx-auto hover:scale-105">
                    Start Your Journey
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                )}
              </div>
            </AnimatedContent>
          </div>
        </section>

        <Footer />
      </div>
    </ClickSpark>
  );
}

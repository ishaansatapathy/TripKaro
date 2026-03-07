import React, { useState } from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";

/* ─── chat data ─── */
interface Chat {
    id: string;
    name: string;
    type: "group" | "dm";
    avatar: string;
    lastMsg: string;
    time: string;
    unread: number;
    online?: boolean;
    members?: number;
}

const CHATS: Chat[] = [
    { id: "1", name: "Meghalaya Adventure", type: "group", avatar: "", lastMsg: "Arjun: I booked the cab for Dawki!", time: "2m", unread: 3, members: 4 },
    { id: "2", name: "Goa New Year Crew", type: "group", avatar: "", lastMsg: "Priya shared a location", time: "18m", unread: 0, members: 28 },
    { id: "3", name: "Priya Sharma", type: "dm", avatar: "PS", lastMsg: "See you at the airport tomorrow!", time: "1h", unread: 1, online: true },
    { id: "4", name: "Arjun Kapoor", type: "dm", avatar: "AK", lastMsg: "Sent the hotel confirmation", time: "3h", unread: 0, online: true },
    { id: "5", name: "Kedarnath Trek Group", type: "group", avatar: "", lastMsg: "Rahul: Weather update — clear skies!", time: "5h", unread: 0, members: 18 },
    { id: "6", name: "Rahul Gupta", type: "dm", avatar: "RG", lastMsg: "Thanks for the itinerary link", time: "1d", unread: 0, online: false },
    { id: "7", name: "Spiti Valley Crew", type: "group", avatar: "", lastMsg: "New poll: Kaza or Tabo first?", time: "2d", unread: 5, members: 10 },
];

const MESSAGES = [
    { from: "Arjun", initials: "AK", msg: "Hey everyone! I've booked a cab from Shillong to Dawki for Day 3. Fits all 4 of us.", time: "10:12 AM", self: false },
    { from: "Priya", initials: "PS", msg: "Perfect!  What time does it pick us up?", time: "10:14 AM", self: false },
    { from: "Arjun", initials: "AK", msg: "8 AM sharp from the hotel lobby", time: "10:14 AM", self: false },
    { from: "You", initials: "IA", msg: "Great, I'll update the itinerary with the cab details now", time: "10:15 AM", self: true },
    { from: "Priya", initials: "PS", msg: "Also, should we do the Umngot River boating first or the border visit?", time: "10:17 AM", self: false },
    { from: "You", initials: "IA", msg: "Boating first — the light is best in the morning for photos ", time: "10:18 AM", self: true },
    { from: "Rahul", initials: "RG", msg: "Agreed! I've heard the water is crystal clear before noon", time: "10:20 AM", self: false },
    { from: "Arjun", initials: "AK", msg: "I booked the cab for Dawki!  Leaving at 8 AM", time: "10:22 AM", self: false },
];

export default function ChatPage() {
    const { isSignedIn, isLoaded } = useAuth();
    const [activeChat, setActiveChat] = useState("1");
    const active = CHATS.find((c) => c.id === activeChat)!;

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

            {/* ═══════════ HERO ═══════════ */}
            <section className="pt-24 pb-12 lg:pt-32 lg:pb-16 border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.4} ease="power2.out">
                        <span className="inline-block px-3 py-1 text-[11px] font-semibold tracking-widest uppercase border border-current rounded-full opacity-60 mb-6">
                            Traveler Chat
                        </span>
                    </AnimatedContent>

                    <SplitText
                        text="Connect with fellow travelers, share experiences, and coordinate trips together."
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
                            Trip group chats keep everyone on the same page. Direct messages let you connect one-on-one with fellow travelers.
                        </p>
                    </AnimatedContent>
                </div>
            </section>

            {/* ═══════════ CHAT UI MOCKUP ═══════════ */}
            <section className="py-12 lg:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={40} direction="vertical" duration={0.7} ease="power2.out">
                        <div className="bg-white border border-black/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-black/5 bg-black/[0.02]">
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="ml-3 text-[10px] font-medium text-black/30">tripkaro.app/chat</span>
                            </div>

                            <div className="grid lg:grid-cols-[320px_1fr] min-h-[520px]">

                                {/* ── LEFT PANEL: Chat List ── */}
                                <div className="border-r border-black/5 flex flex-col">
                                    {/* Search */}
                                    <div className="px-4 py-3 border-b border-black/5">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/[0.03] border border-black/5">
                                            <svg className="w-3.5 h-3.5 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <span className="text-[12px] text-black/25">Search conversations...</span>
                                        </div>
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex border-b border-black/5">
                                        <button className="flex-1 py-2.5 text-[11px] font-bold text-center border-b-2 border-black">All Chats</button>
                                        <button className="flex-1 py-2.5 text-[11px] font-bold text-center text-black/30 hover:text-black/50 transition-colors">Groups</button>
                                        <button className="flex-1 py-2.5 text-[11px] font-bold text-center text-black/30 hover:text-black/50 transition-colors">Direct</button>
                                    </div>

                                    {/* Chat list */}
                                    <div className="flex-1 overflow-y-auto">
                                        {CHATS.map((chat) => (
                                            <button
                                                key={chat.id}
                                                onClick={() => setActiveChat(chat.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${activeChat === chat.id ? "bg-black/[0.04]" : "hover:bg-black/[0.02]"
                                                    }`}
                                            >
                                                {/* Avatar */}
                                                <div className="relative shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${chat.type === "group" ? "bg-black/5 text-lg" : "bg-black text-white text-[11px]"
                                                        }`}>
                                                        {chat.avatar}
                                                    </div>
                                                    {chat.online && (
                                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-black border-2 border-white" />
                                                    )}
                                                </div>
                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[13px] font-semibold truncate">{chat.name}</p>
                                                        <span className="text-[10px] text-black/25 shrink-0 ml-2">{chat.time}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-0.5">
                                                        <p className="text-[11px] text-black/35 truncate">{chat.lastMsg}</p>
                                                        {chat.unread > 0 && (
                                                            <span className="ml-2 shrink-0 w-4.5 h-4.5 min-w-[18px] rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center px-1">
                                                                {chat.unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ── RIGHT PANEL: Conversation ── */}
                                <div className="flex flex-col">
                                    {/* Chat header */}
                                    <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${active.type === "group" ? "bg-black/5 text-base" : "bg-black text-white text-[10px]"
                                                }`}>
                                                {active.avatar}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">{active.name}</p>
                                                <p className="text-[10px] text-black/30">
                                                    {active.type === "group" ? `${active.members} members` : active.online ? "Online" : "Last seen 1h ago"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors">
                                                <svg className="w-4 h-4 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            </button>
                                            <button className="w-8 h-8 rounded-lg hover:bg-black/5 flex items-center justify-center transition-colors">
                                                <svg className="w-4 h-4 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                                        {/* Date divider */}
                                        <div className="flex items-center gap-3 my-2">
                                            <div className="flex-1 h-px bg-black/5" />
                                            <span className="text-[10px] font-medium text-black/25 uppercase tracking-wider">Today</span>
                                            <div className="flex-1 h-px bg-black/5" />
                                        </div>

                                        {MESSAGES.map((m, i) => (
                                            <div key={i} className={`flex gap-2.5 ${m.self ? "justify-end" : "justify-start"}`}>
                                                {!m.self && (
                                                    <div className="w-7 h-7 rounded-full bg-black/8 flex items-center justify-center text-[9px] font-bold text-black/40 shrink-0 mt-0.5">
                                                        {m.initials}
                                                    </div>
                                                )}
                                                <div className={`max-w-[70%] ${m.self ? "order-first" : ""}`}>
                                                    {!m.self && <p className="text-[10px] font-semibold text-black/40 mb-0.5 ml-1">{m.from}</p>}
                                                    <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${m.self
                                                            ? "bg-black text-white rounded-br-md"
                                                            : "bg-black/[0.04] text-black/75 rounded-bl-md"
                                                        }`}>
                                                        {m.msg}
                                                    </div>
                                                    <p className={`text-[9px] mt-1 ${m.self ? "text-right" : "ml-1"} text-black/20`}>{m.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="px-5 py-4 border-t border-black/5 flex items-center gap-3">
                                        <button className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0">
                                            <svg className="w-4.5 h-4.5 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        </button>
                                        <div className="flex-1 h-10 rounded-full bg-black/[0.03] border border-black/5 px-4 flex items-center text-[13px] text-black/25">
                                            Type a message...
                                        </div>
                                        <button className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0">
                                            <svg className="w-4.5 h-4.5 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        </button>
                                        <button className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 hover:bg-black/80 transition-colors">
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                        </button>
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
                            Two ways to connect
                        </h2>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-2 gap-5">
                        {/* Group Chat */}
                        <AnimatedContent distance={30} direction="vertical" duration={0.5} ease="power2.out">
                            <div className="p-8 rounded-2xl bg-black text-white">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-black mb-2">Trip Group Chat</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6">Every trip gets its own group chat. Coordinate plans, share locations, vote on activities, and keep everyone in sync.</p>
                                <div className="space-y-2.5">
                                    {["Auto-created for every trip", "Share locations & files", "Activity polls & voting", "Pinned messages for key info"].map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <svg className="w-3.5 h-3.5 text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            <span className="text-[12px] text-white/50">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedContent>

                        {/* Direct Messages */}
                        <AnimatedContent distance={30} direction="vertical" duration={0.5} delay={0.08} ease="power2.out">
                            <div className="p-8 rounded-2xl border border-black/8 hover:border-black/15 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </div>
                                <h3 className="text-xl font-black mb-2">Direct Messages</h3>
                                <p className="text-sm text-black/40 leading-relaxed mb-6">Message any traveler one-on-one. Coordinate meetups, share recommendations, or just say hello.</p>
                                <div className="space-y-2.5">
                                    {["End-to-end encrypted", "Read receipts & typing indicators", "Share booking confirmations", "Quick profile previews"].map((f, i) => (
                                        <div key={i} className="flex items-center gap-2.5">
                                            <svg className="w-3.5 h-3.5 text-black/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                            <span className="text-[12px] text-black/40">{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </section>

            {/* ═══════════ CTA ═══════════ */}
            <section className="bg-black text-white py-24 lg:py-32 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <AnimatedContent distance={25} direction="vertical" duration={0.6} ease="power2.out">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Start chatting with your crew</h2>
                        <p className="mt-4 text-white/35 text-base">Every trip deserves its own conversation.</p>
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

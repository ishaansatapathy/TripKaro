import React, { useEffect, useMemo, useState } from "react";
import { SignInButton, useAuth } from "@clerk/react";
import Link from "@/lib/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedContent from "@/components/AnimatedContent";
import SplitText from "@/components/SplitText";

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

interface Message {
    from: string;
    initials: string;
    msg: string;
    time: string;
    self: boolean;
}

const INITIAL_CHATS: Chat[] = [
    { id: "1", name: "Meghalaya Adventure", type: "group", avatar: "", lastMsg: "Arjun: I booked the cab for Dawki!", time: "2m", unread: 3, members: 4 },
    { id: "2", name: "Goa New Year Crew", type: "group", avatar: "", lastMsg: "Priya shared a location", time: "18m", unread: 0, members: 28 },
    { id: "3", name: "Priya Sharma", type: "dm", avatar: "PS", lastMsg: "See you at the airport tomorrow!", time: "1h", unread: 1, online: true },
    { id: "4", name: "Arjun Kapoor", type: "dm", avatar: "AK", lastMsg: "Sent the hotel confirmation", time: "3h", unread: 0, online: true },
    { id: "5", name: "Kedarnath Trek Group", type: "group", avatar: "", lastMsg: "Rahul: Weather update - clear skies!", time: "5h", unread: 0, members: 18 },
    { id: "6", name: "Rahul Gupta", type: "dm", avatar: "RG", lastMsg: "Thanks for the itinerary link", time: "1d", unread: 0, online: false },
    { id: "7", name: "Spiti Valley Crew", type: "group", avatar: "", lastMsg: "New poll: Kaza or Tabo first?", time: "2d", unread: 5, members: 10 },
];

const INITIAL_MESSAGES_BY_CHAT: Record<string, Message[]> = {
    "1": [
        { from: "Arjun", initials: "AK", msg: "Hey everyone! I have booked a cab from Shillong to Dawki for Day 3. Fits all 4 of us.", time: "10:12 AM", self: false },
        { from: "Priya", initials: "PS", msg: "Perfect! What time does it pick us up?", time: "10:14 AM", self: false },
        { from: "Arjun", initials: "AK", msg: "8 AM sharp from the hotel lobby.", time: "10:14 AM", self: false },
        { from: "You", initials: "IA", msg: "Great, I will update the itinerary with the cab details now.", time: "10:15 AM", self: true },
        { from: "Priya", initials: "PS", msg: "Also, should we do the Umngot River boating first or the border visit?", time: "10:17 AM", self: false },
    ],
    "2": [
        { from: "Priya", initials: "PS", msg: "Pinned: NYE beach plan confirmed for Dec 31.", time: "8:42 AM", self: false },
        { from: "Rohan", initials: "RK", msg: "I dropped the hostel location in group files.", time: "8:50 AM", self: false },
        { from: "You", initials: "IA", msg: "Nice. I will book scooters for Jan 1.", time: "9:01 AM", self: true },
    ],
    "3": [
        { from: "Priya", initials: "PS", msg: "See you at the airport tomorrow!", time: "7:16 PM", self: false },
        { from: "You", initials: "IA", msg: "Yep, I will be there by 6:30.", time: "7:18 PM", self: true },
    ],
    "4": [
        { from: "Arjun", initials: "AK", msg: "Sent the hotel confirmation PDF.", time: "11:02 AM", self: false },
        { from: "You", initials: "IA", msg: "Received. Thanks!", time: "11:05 AM", self: true },
    ],
    "5": [
        { from: "Rahul", initials: "RG", msg: "Weather update: clear skies all week.", time: "6:10 AM", self: false },
        { from: "You", initials: "IA", msg: "Perfect for summit photos then.", time: "6:13 AM", self: true },
    ],
    "6": [
        { from: "Rahul", initials: "RG", msg: "Thanks for the itinerary link.", time: "9:44 PM", self: false },
        { from: "You", initials: "IA", msg: "No problem, check Day 4 for updates.", time: "9:45 PM", self: true },
    ],
    "7": [
        { from: "Tsering", initials: "TS", msg: "New poll: Kaza or Tabo first?", time: "4:30 PM", self: false },
        { from: "You", initials: "IA", msg: "Kaza first. Better acclimatization flow.", time: "4:33 PM", self: true },
    ],
};

export default function ChatPage() {
    const { isSignedIn } = useAuth();
    const [activeChat, setActiveChat] = useState(INITIAL_CHATS[0].id);
    const [chatTab, setChatTab] = useState<"all" | "group" | "dm">("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [draft, setDraft] = useState("");
    const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
    const [messagesByChat, setMessagesByChat] = useState<Record<string, Message[]>>(INITIAL_MESSAGES_BY_CHAT);

    const visibleChats = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return chats.filter((chat) => {
            const tabMatch = chatTab === "all" ? true : chat.type === chatTab;
            if (!tabMatch) return false;
            if (!q) return true;
            return chat.name.toLowerCase().includes(q) || chat.lastMsg.toLowerCase().includes(q);
        });
    }, [chats, chatTab, searchQuery]);

    useEffect(() => {
        if (visibleChats.length === 0) return;
        const exists = visibleChats.some((chat) => chat.id === activeChat);
        if (!exists) setActiveChat(visibleChats[0].id);
    }, [activeChat, visibleChats]);

    const active = chats.find((chat) => chat.id === activeChat) ?? visibleChats[0] ?? null;
    const activeMessages = active ? messagesByChat[active.id] ?? [] : [];

    const handleSendMessage = () => {
        const text = draft.trim();
        if (!active || !text) return;

        const time = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
        const newMessage: Message = {
            from: "You",
            initials: "IA",
            msg: text,
            time,
            self: true,
        };

        setMessagesByChat((prev) => ({
            ...prev,
            [active.id]: [...(prev[active.id] ?? []), newMessage],
        }));

        setChats((prev) =>
            prev.map((chat) =>
                chat.id === active.id
                    ? { ...chat, lastMsg: `You: ${text}`, time: "now", unread: 0 }
                    : chat,
            ),
        );

        setDraft("");
    };

    return (
        <div className="min-h-screen bg-white text-black antialiased">
            <Navbar />

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

            <section className="py-12 lg:py-20">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={40} direction="vertical" duration={0.7} ease="power2.out">
                        <div className="bg-white border border-black/10 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
                            <div className="flex items-center gap-2 px-5 py-3 border-b border-black/5 bg-black/2">
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="w-2.5 h-2.5 rounded-full bg-black/10" />
                                <span className="ml-3 text-[10px] font-medium text-black/30">tripkaro.app/chat</span>
                            </div>

                            <div className="grid lg:grid-cols-[320px_1fr] min-h-130">
                                <div className="border-r border-black/5 flex flex-col">
                                    <div className="px-4 py-3 border-b border-black/5">
                                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black/3 border border-black/5">
                                            <svg className="w-3.5 h-3.5 text-black/25" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                            <input
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Search conversations..."
                                                className="w-full bg-transparent text-[12px] placeholder:text-black/25 text-black/70 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex border-b border-black/5">
                                        <button
                                            onClick={() => setChatTab("all")}
                                            className={`flex-1 py-2.5 text-[11px] font-bold text-center border-b-2 ${chatTab === "all" ? "border-black text-black" : "border-transparent text-black/30 hover:text-black/50"}`}
                                        >
                                            All Chats
                                        </button>
                                        <button
                                            onClick={() => setChatTab("group")}
                                            className={`flex-1 py-2.5 text-[11px] font-bold text-center border-b-2 ${chatTab === "group" ? "border-black text-black" : "border-transparent text-black/30 hover:text-black/50"}`}
                                        >
                                            Groups
                                        </button>
                                        <button
                                            onClick={() => setChatTab("dm")}
                                            className={`flex-1 py-2.5 text-[11px] font-bold text-center border-b-2 ${chatTab === "dm" ? "border-black text-black" : "border-transparent text-black/30 hover:text-black/50"}`}
                                        >
                                            Direct
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto">
                                        {visibleChats.map((chat) => (
                                            <button
                                                key={chat.id}
                                                onClick={() => {
                                                    setActiveChat(chat.id);
                                                    setChats((prev) => prev.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c)));
                                                }}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors ${activeChat === chat.id ? "bg-black/4" : "hover:bg-black/2"}`}
                                            >
                                                <div className="relative shrink-0">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${chat.type === "group" ? "bg-black/5 text-lg" : "bg-black text-white text-[11px]"}`}>
                                                        {chat.avatar}
                                                    </div>
                                                    {chat.online && (
                                                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-black border-2 border-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-[13px] font-semibold truncate">{chat.name}</p>
                                                        <span className="text-[10px] text-black/25 shrink-0 ml-2">{chat.time}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-0.5">
                                                        <p className="text-[11px] text-black/35 truncate">{chat.lastMsg}</p>
                                                        {chat.unread > 0 && (
                                                            <span className="ml-2 shrink-0 w-4.5 h-4.5 min-w-4.5 rounded-full bg-black text-white text-[9px] font-bold flex items-center justify-center px-1">
                                                                {chat.unread}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                        {visibleChats.length === 0 && (
                                            <div className="px-4 py-10 text-center text-[12px] text-black/35">No chats found.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    {active ? (
                                        <>
                                            <div className="px-6 py-4 border-b border-black/5 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold ${active.type === "group" ? "bg-black/5 text-base" : "bg-black text-white text-[10px]"}`}>
                                                        {active.avatar}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{active.name}</p>
                                                        <p className="text-[10px] text-black/30">
                                                            {active.type === "group" ? `${active.members} members` : active.online ? "Online" : "Last seen 1h ago"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                                                <div className="flex items-center gap-3 my-2">
                                                    <div className="flex-1 h-px bg-black/5" />
                                                    <span className="text-[10px] font-medium text-black/25 uppercase tracking-wider">Today</span>
                                                    <div className="flex-1 h-px bg-black/5" />
                                                </div>

                                                {activeMessages.map((m, i) => (
                                                    <div key={`${active.id}-${i}-${m.time}`} className={`flex gap-2.5 ${m.self ? "justify-end" : "justify-start"}`}>
                                                        {!m.self && (
                                                            <div className="w-7 h-7 rounded-full bg-black/8 flex items-center justify-center text-[9px] font-bold text-black/40 shrink-0 mt-0.5">
                                                                {m.initials}
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[70%] ${m.self ? "order-first" : ""}`}>
                                                            {!m.self && <p className="text-[10px] font-semibold text-black/40 mb-0.5 ml-1">{m.from}</p>}
                                                            <div className={`px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed ${m.self ? "bg-black text-white rounded-br-md" : "bg-black/4 text-black/75 rounded-bl-md"}`}>
                                                                {m.msg}
                                                            </div>
                                                            <p className={`text-[9px] mt-1 ${m.self ? "text-right" : "ml-1"} text-black/20`}>{m.time}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="px-5 py-4 border-t border-black/5 flex items-center gap-3">
                                                <button className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center transition-colors shrink-0" aria-label="Attach file">
                                                    <svg className="w-4.5 h-4.5 text-black/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                </button>
                                                <input
                                                    value={draft}
                                                    onChange={(e) => setDraft(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") handleSendMessage();
                                                    }}
                                                    placeholder={`Message ${active.name}...`}
                                                    className="flex-1 h-10 rounded-full bg-black/3 border border-black/5 px-4 text-[13px] placeholder:text-black/25 outline-none"
                                                />
                                                <button onClick={handleSendMessage} className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 hover:bg-black/80 transition-colors" aria-label="Send message">
                                                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-black/35 text-sm">Select a chat to start messaging.</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </AnimatedContent>
                </div>
            </section>

            <section className="py-20 lg:py-28 border-t border-b border-black/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-10">
                    <AnimatedContent distance={20} direction="vertical" duration={0.5} ease="power2.out">
                        <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-center mb-12">
                            Two ways to connect
                        </h2>
                    </AnimatedContent>

                    <div className="grid md:grid-cols-2 gap-5">
                        <AnimatedContent distance={30} direction="vertical" duration={0.5} ease="power2.out">
                            <div className="p-8 rounded-2xl bg-black text-white">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <h3 className="text-xl font-black mb-2">Trip Group Chat</h3>
                                <p className="text-sm text-white/40 leading-relaxed mb-6">Every trip gets its own group chat. Coordinate plans, share locations, vote on activities, and keep everyone in sync.</p>
                            </div>
                        </AnimatedContent>

                        <AnimatedContent distance={30} direction="vertical" duration={0.5} delay={0.08} ease="power2.out">
                            <div className="p-8 rounded-2xl border border-black/8 hover:border-black/15 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-5">
                                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                </div>
                                <h3 className="text-xl font-black mb-2">Direct Messages</h3>
                                <p className="text-sm text-black/40 leading-relaxed mb-6">Message any traveler one-on-one. Coordinate meetups, share recommendations, or just say hello.</p>
                            </div>
                        </AnimatedContent>
                    </div>
                </div>
            </section>

            <section className="bg-black text-white py-24 lg:py-32 text-center">
                <div className="max-w-3xl mx-auto px-6">
                    <AnimatedContent distance={25} direction="vertical" duration={0.6} ease="power2.out">
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">Start chatting with your crew</h2>
                        <p className="mt-4 text-white/35 text-base">Every trip deserves its own conversation.</p>
                        <div className="mt-8">
                            {!isSignedIn ? (
                                <SignInButton mode="modal">
                                    <button className="px-8 py-3.5 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all">
                                        Get started free {"->"}
                                    </button>
                                </SignInButton>
                            ) : (
                                <Link href="/dashboard" className="px-8 py-3.5 text-sm font-bold bg-white text-black rounded-full hover:bg-white/90 transition-all inline-block">
                                    Open Dashboard {"->"}
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
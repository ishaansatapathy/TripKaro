import React from "react";
import Link from "@/lib/link";
import Logo from "@/components/Logo";

const FOOTER_LINKS = [
    { label: "Trip Planning", href: "/trip-planning" },
    { label: "Community", href: "/community" },
    { label: "Chat", href: "/chat" },
    { label: "Explorer", href: "/explorer" },
    { label: "Safety", href: "/safety" },
    { label: "Deals", href: "/deals" },
];

export default function Footer() {
    return (
        <footer className="bg-black text-white border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2">
                    <Logo className="h-10 w-auto invert" />
                </div>
                <div className="flex items-center gap-6">
                    {FOOTER_LINKS.map((n) => (
                        <Link key={n.href} href={n.href} className="text-[12px] font-medium text-white/30 hover:text-white transition-colors">
                            {n.label}
                        </Link>
                    ))}
                </div>
                <p className="text-[11px] text-white/20">© 2026 TripKaro. All rights reserved.</p>
            </div>
        </footer>
    );
}

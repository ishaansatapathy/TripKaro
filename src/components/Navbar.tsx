import React from "react";
import Link from "@/lib/link";
import { usePathname } from "@/lib/navigation";
import { useAuth, UserButton } from "@clerk/react";
import Logo from "@/components/Logo";

const NAV_LINKS = [
    { label: "Trip Planning", href: "/trip-planning" },
    { label: "Community", href: "/community" },
    { label: "Chat", href: "/chat" },
    { label: "Explorer", href: "/explorer" },
    { label: "Safety", href: "/safety" },
    { label: "Deals", href: "/deals" },
];

export default function Navbar() {
    const { isSignedIn, isLoaded } = useAuth();
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-black/5">
            <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
                    <Logo className="h-12 w-auto" />
                </Link>

                <nav className="hidden lg:flex items-center gap-7">
                    {NAV_LINKS.map((n) => (
                        <Link
                            key={n.href}
                            href={n.href}
                            className={`text-[13px] font-medium transition-colors ${pathname === n.href
                                    ? "text-black"
                                    : "text-black/40 hover:text-black"
                                }`}
                        >
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-2.5">
                    {!isLoaded ? (
                        <span className="w-20 h-8" />
                    ) : !isSignedIn ? (
                        <>
                            <Link
                                href="/sign-in"
                                className="px-4 py-1.5 text-[13px] font-semibold text-black/60 hover:text-black transition-colors"
                            >
                                Log in
                            </Link>
                            <Link
                                href="/sign-up"
                                className="px-5 py-2 text-[13px] font-semibold text-white bg-black hover:bg-black/80 rounded-full transition-all"
                            >
                                Get started
                            </Link>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                href="/dashboard"
                                className="px-5 py-2 text-[13px] font-semibold text-white bg-black rounded-full hover:bg-black/80 transition-all"
                            >
                                Dashboard
                            </Link>
                            <UserButton />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

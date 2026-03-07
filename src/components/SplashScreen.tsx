import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function SplashScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"in" | "out">("in");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("out"), 1400);
    const t2 = setTimeout(onDone, 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 ${
        phase === "out" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* logo */}
      <div
        className="animate-[scaleIn_0.6s_ease-out_both]"
        style={{ animationDelay: "0.1s" }}
      >
        <Logo className="h-24 w-auto invert drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]" />
      </div>

      {/* tagline */}
      <p
        className="mt-2 text-sm text-white/40 font-medium animate-[fadeUp_0.5s_ease-out_both]"
        style={{ animationDelay: "0.55s" }}
      >
        Plan. Explore. Travel Together.
      </p>

      {/* tiny loader line */}
      <div className="mt-8 w-24 h-[2px] rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-white/60 rounded-full animate-[loaderBar_1.2s_ease-in-out_both]" />
      </div>
    </div>
  );
}

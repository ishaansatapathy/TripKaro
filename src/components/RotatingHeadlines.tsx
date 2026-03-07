import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const HEADLINES = [
  {
    line1: "Your friends flaked.",
    line2: "Your trip doesn't have to.",
    sub: "Find travel partners who actually show up, plan trips that actually happen, and explore places you've only saved on Instagram.",
  },
  {
    line1: "Stop planning trips in",
    line2: "group chats that go nowhere.",
    sub: "TripKaro brings together people who actually want to travel — not just \"react\" to the message and disappear.",
  },
  {
    line1: "\"We'll plan something soon\"",
    line2: "never works.",
    sub: "Build real itineraries with real people. Whether your squad bailed or you're flying solo — your next adventure starts here.",
  },
  {
    line1: "Friends cancel plans.",
    line2: "Strangers become travel buddies.",
    sub: "Plan trips, split costs, and explore together — with people who won't ghost the group chat two days before the flight.",
  },
  {
    line1: "The trip your friends keep",
    line2: "postponing? Just go.",
    sub: "Match with travel partners, co-plan itineraries, and finally stop waiting for everyone to \"confirm.\"",
  },
];

const INTERVAL = 2800;

export default function RotatingHeadlines() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % HEADLINES.length);
    }, INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const current = HEADLINES[index];

  return (
    <div className="space-y-5">
      {/* Headline */}
      <div className="relative min-h-[3.5em] sm:min-h-[3em]">
        <AnimatePresence mode="wait">
          <motion.h1
            key={index}
            initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight leading-[1.08]"
          >
            {current.line1}
            <br />
            {current.line2}
          </motion.h1>
        </AnimatePresence>
      </div>

      {/* Subtext */}
      <div className="relative min-h-[3em]">
        <AnimatePresence mode="wait">
          <motion.p
            key={`sub-${index}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
            className="text-base sm:text-lg text-black/45 leading-relaxed max-w-lg"
          >
            {current.sub}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";

interface GhostCursorProps {
  /** Number of trailing circles */
  trailCount?: number;
  /** Base size of the ghost dot in px */
  size?: number;
  /** Trail color — use soft, muted tones */
  color?: string;
  /** Smoothing factor (0–1). Lower = more floaty lag */
  smoothing?: number;
  children?: React.ReactNode;
}

const GhostCursor: React.FC<GhostCursorProps> = ({
  trailCount = 14,
  size = 18,
  color = "rgba(180, 160, 200, 0.45)",
  smoothing = 0.15,
  children,
}) => {
  const dotsRef = useRef<HTMLDivElement[]>([]);
  const mouse = useRef({ x: -100, y: -100 });
  const positions = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    positions.current = Array.from({ length: trailCount }, () => ({
      x: -100,
      y: -100,
    }));

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    window.addEventListener("mousemove", handleMouseMove);

    let raf: number;

    const animate = () => {
      positions.current.forEach((pos, i) => {
        const target = i === 0 ? mouse.current : positions.current[i - 1];
        const factor = smoothing * (1 - i * 0.03);
        pos.x += (target.x - pos.x) * Math.max(factor, 0.04);
        pos.y += (target.y - pos.y) * Math.max(factor, 0.04);

        const dot = dotsRef.current[i];
        if (dot) {
          const scale = 1 - i / trailCount;
          const opacity = (1 - i / trailCount) * 0.6;
          dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%) scale(${scale})`;
          dot.style.opacity = `${opacity}`;
        }
      });

      raf = requestAnimationFrame(animate);
    };

    raf = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(raf);
    };
  }, [trailCount, smoothing]);

  return (
    <>
      {/* Ghost trail dots */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {Array.from({ length: trailCount }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) dotsRef.current[i] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              willChange: "transform, opacity",
              transition: "none",
            }}
          />
        ))}
      </div>
      {children}
    </>
  );
};

export default GhostCursor;

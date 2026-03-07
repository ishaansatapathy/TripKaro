declare module "@/components/BlurText" {
  import { ComponentType } from "react";
  interface BlurTextProps {
    text?: string;
    delay?: number;
    className?: string;
    animateBy?: "words" | "characters";
    direction?: "top" | "bottom";
    threshold?: number;
    rootMargin?: string;
    animationFrom?: Record<string, unknown>;
    animationTo?: Record<string, unknown>[];
    easing?: (t: number) => number;
    onAnimationComplete?: () => void;
    stepDuration?: number;
  }
  const BlurText: ComponentType<BlurTextProps>;
  export default BlurText;
}

declare module "@/components/RotatingText" {
  import { ComponentType } from "react";
  interface RotatingTextProps {
    texts: string[];
    transition?: Record<string, unknown>;
    initial?: Record<string, unknown>;
    animate?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    animatePresenceMode?: "wait" | "sync" | "popLayout";
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: "first" | "last" | "center" | "random" | number;
    loop?: boolean;
    auto?: boolean;
    splitBy?: "characters" | "words" | "lines" | string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
  }
  const RotatingText: ComponentType<RotatingTextProps>;
  export default RotatingText;
}

declare module "@/components/SplitText" {
  import { ComponentType } from "react";
  interface SplitTextProps {
    text?: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    splitType?: string;
    from?: Record<string, unknown>;
    to?: Record<string, unknown>;
    threshold?: number;
    rootMargin?: string;
    tag?: string;
    textAlign?: string;
    onComplete?: () => void;
  }
  const SplitText: ComponentType<SplitTextProps>;
  export default SplitText;
}

import { useRef, useEffect, useState, useCallback } from 'react';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={itemClassName}>{children}</div>
);

const ScrollStack = ({ children, className = '' }) => {
  const wrapperRef = useRef(null);
  const stickyRef = useRef(null);
  const [cardStyles, setCardStyles] = useState([]);
  const childCount = Array.isArray(children) ? children.length : 1;

  const update = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const wrapperHeight = wrapper.offsetHeight;
    const viewportH = window.innerHeight;

    // How far we've scrolled into this section (0 at top, 1 at bottom)
    const scrolled = -rect.top;
    const totalScrollable = wrapperHeight - viewportH;
    const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

    // Each card gets an equal slice of the progress
    const segmentSize = 1 / childCount;
    const styles = [];

    for (let i = 0; i < childCount; i++) {
      const cardStart = i * segmentSize;
      const cardEnd = (i + 1) * segmentSize;
      // How far through THIS card's segment
      const cardProgress = Math.max(0, Math.min(1, (progress - cardStart) / segmentSize));

      // Cards below current: off-screen below
      // Current card: visible, scaling down as next arrives
      // Cards above current: scaled down and stacked behind

      let translateY = 0;
      let scale = 1;
      let opacity = 1;
      let zIndex = childCount - i;

      if (progress < cardStart) {
        // Not reached yet — off screen below
        translateY = 100;
        opacity = 0;
      } else if (progress >= cardStart && progress < cardEnd) {
        // Active card — enters from below, then stays
        const enterPhase = Math.min(cardProgress / 0.3, 1); // first 30% of segment = enter
        translateY = (1 - enterPhase) * 60;
        opacity = enterPhase;
        scale = 1;
        zIndex = childCount + 1;
      } else {
        // Past card — scale down and push back
        const stackIndex = Math.floor((progress - cardEnd) / segmentSize);
        scale = Math.max(0.85, 1 - (stackIndex + 1) * 0.04);
        translateY = (stackIndex + 1) * -8;
        opacity = Math.max(0, 1 - (stackIndex + 1) * 0.25);
        zIndex = childCount - i;
      }

      styles.push({
        transform: `translateY(${translateY}%) scale(${scale})`,
        opacity,
        zIndex,
      });
    }

    setCardStyles(styles);
  }, [childCount]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();

    return () => window.removeEventListener('scroll', onScroll);
  }, [update]);

  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      ref={wrapperRef}
      className={`scroll-stack-wrapper ${className}`.trim()}
      style={{ height: `${(childCount + 1) * 100}vh` }}
    >
      <div ref={stickyRef} className="scroll-stack-sticky">
        {items.map((child, i) => (
          <div
            key={i}
            className="scroll-stack-card"
            style={cardStyles[i] || { transform: 'translateY(100%)', opacity: 0 }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollStack;

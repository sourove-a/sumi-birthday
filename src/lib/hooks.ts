import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react';

/** Current time, refreshed every `ms` milliseconds. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

/**
 * Left/right swipe with finger or mouse. Spread `handlers` on the element.
 * `swiped()` is true right after a swipe, so a click handler can ignore that tap.
 */
export function useSwipe(onLeft: () => void, onRight: () => void, min = 45) {
  const start = useRef<{ x: number; y: number } | null>(null);
  const lastSwipe = useRef(0);
  const handlers = {
    onPointerDown: (e: ReactPointerEvent) => { start.current = { x: e.clientX, y: e.clientY }; },
    onPointerUp: (e: ReactPointerEvent) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.abs(dx) < min || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      lastSwipe.current = Date.now();
      if (dx < 0) onLeft(); else onRight();
    },
    onPointerCancel: () => { start.current = null; },
  };
  return { handlers, swiped: () => Date.now() - lastSwipe.current < 250 };
}

/** True while the element is at least partly on screen. */
export function useOnScreen<T extends Element>(ref: RefObject<T | null>): boolean {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

/** Window width, updated on resize. */
export function useViewportWidth(): number {
  const [w, setW] = useState(() => innerWidth);
  useEffect(() => {
    const on = () => setW(innerWidth);
    addEventListener('resize', on);
    return () => removeEventListener('resize', on);
  }, []);
  return w;
}

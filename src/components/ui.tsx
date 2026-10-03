/* Small shared building blocks. */
import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

/** Material Symbols icon. */
export function Icon({ name, fill = false, className = '', style }: { name: string; fill?: boolean; className?: string; style?: CSSProperties }) {
  return <span className={`ms ${fill ? 'fill' : ''} ${className}`} style={style} aria-hidden="true">{name}</span>;
}

/** Fades + slides in when scrolled into view. */
export function Reveal({ as = 'div', className = '', style, children, onClick }: {
  as?: 'div' | 'figure';
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const check = () => {
      const el = ref.current;
      if (el && el.getBoundingClientRect().top < innerHeight * 0.92) setShown(true);
    };
    check();
    addEventListener('scroll', check, { passive: true });
    addEventListener('resize', check);
    return () => { removeEventListener('scroll', check); removeEventListener('resize', check); };
  }, [shown]);

  return createElement(as, { ref, className: `reveal ${shown ? 'in' : ''} ${className}`, style, onClick }, children);
}

/** Centered eyebrow + title + text. */
export function SectionHead({ eyebrow, title, text, bn = false, level = 2, children }: {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  bn?: boolean;
  level?: 2 | 3;
  children?: ReactNode;
}) {
  const Title = level === 2 ? 'h2' : 'h3';
  return (
    <div className="section-head">
      <div className="eyebrow">{eyebrow}</div>
      <Title className={bn ? 'bn' : ''}>{title}</Title>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}

/** Countdown number that rolls in each time it changes. */
export const Roll = ({ v }: { v: string }) => <span key={v} className="roll">{v}</span>;

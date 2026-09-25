import { useEffect, useRef, type ReactNode } from "react";
import { animate, motion, useInView, useReducedMotion, type Variants } from "motion/react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/** Fades + lifts children into view once. */
export function Reveal({ children, delay = 0, y = 28, className, as = "div" }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: "div" | "section" | "li" | "article" }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT }}
    >
      {children}
    </Tag>
  );
}

const lineVariants: Variants = {
  hidden: { y: "110%", rotate: 3 },
  shown: (i: number) => ({ y: "0%", rotate: 0, transition: { duration: 0.9, delay: 0.08 * i, ease: EASE_OUT } }),
};

/** Display headline where each line lifts out of a mask, the brand's signature reveal. */
export function Lines({ lines, className, as = "h2", immediate = false }: { lines: ReactNode[]; className?: string; as?: "h1" | "h2" | "h3"; immediate?: boolean }) {
  const Tag = motion[as];
  return (
    <Tag className={className} initial="hidden" {...(immediate ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, margin: "-60px" } })}>
      {lines.map((line, i) => (
        <span className="lineMask" key={i}>
          <motion.span className="line" custom={i} variants={lineVariants}>{line}</motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Counts up to a value when visible; jumps straight to it under reduced motion. */
export function Counter({ value, format = (n: number) => Math.round(n).toLocaleString(), duration = 1.2 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const from = useRef(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduce) { el.textContent = format(value); from.current = value; return; }
    const controls = animate(from.current, value, { duration, ease: EASE_OUT, onUpdate: (v) => { el.textContent = format(v); } });
    from.current = value;
    return () => controls.stop();
  }, [value, inView, reduce]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className="tabular">{format(0)}</span>;
}

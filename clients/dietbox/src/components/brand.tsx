import { Link } from "react-router-dom";

type Tone = "volt" | "white" | "black";

export function Logo({ tone = "volt", height = 34 }: { tone?: Tone; height?: number }) {
  return (
    <Link to="/" className="logo" aria-label="Dietbox home">
      <img src={`/brand/dietbox-logo-${tone}.png`} alt="Dietbox" height={height} width={Math.round(height * 3.41)} />
    </Link>
  );
}

export function Mark({ tone = "volt", size = 40 }: { tone?: Tone; size?: number }) {
  return <img className="mark" src={`/brand/dietbox-mark-${tone}.png`} alt="" width={size} height={size} />;
}

/** The skewed Volt ticker band. */
export function Ticker({ items, reverse = false, tone = "volt" }: { items: string[]; reverse?: boolean; tone?: "volt" | "carbon" }) {
  const row = items.map((item, i) => (
    <span key={i} className="tickerItem">{item}<i className="slash" aria-hidden /></span>
  ));
  return (
    <div className={`ticker ${tone}`} aria-hidden>
      <div className={`tickerTrack ${reverse ? "reverse" : ""}`}>
        <div className="tickerRow">{row}</div>
        <div className="tickerRow">{row}</div>
      </div>
    </div>
  );
}

export function Eyebrow({ children, tone }: { children: React.ReactNode; tone?: "dark" }) {
  return <span className={`eyebrow ${tone === "dark" ? "onDark" : ""}`}><i className="dot" />{children}</span>;
}

export function Arrow() {
  return (
    <svg className="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" />
    </svg>
  );
}

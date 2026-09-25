import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { authClient } from "../lib/auth-client";
import { Logo, Mark } from "./brand";
import { productConfig } from "../../product.config";

const DARK_TOP_ROUTES = ["/", "/menu"];

export function Nav() {
  const { pathname } = useLocation();
  const { data: session } = authClient.useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  const overDark = DARK_TOP_ROUTES.includes(pathname) && !scrolled && !open;

  return (
    <header className={`nav ${overDark ? "overDark" : "solid"} ${scrolled ? "scrolled" : ""}`}>
      <div className="navInner">
        <Logo tone={overDark || open ? "volt" : "black"} height={30} />
        <nav className="navLinks" aria-label="Primary">
          <NavLink to="/menu">Menu</NavLink>
          <a href="/#plans">Plans</a>
          <a href="/#how">How it works</a>
          <a href="/#faq">FAQ</a>
        </nav>
        <div className="navActions">
          {session ? <Link to="/app" className="navText">My plan</Link> : <Link to="/login" className="navText">Sign in</Link>}
          <Link to="/start" className="btn primary sm">Build my plan</Link>
          <button className="burger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu" type="button"><i /><i /></button>
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div className="mobileMenu" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}>
            {[["/menu", "Menu"], ["/#plans", "Plans"], ["/#how", "How it works"], ["/#faq", "FAQ"], [session ? "/app" : "/login", session ? "My plan" : "Sign in"]].map(([to, label], i) => (
              <motion.a key={to} href={to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>{label}</motion.a>
            ))}
            <Link to="/start" className="btn primary lg">Build my plan</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="footerTop">
        <div className="footerBrand">
          <Mark size={56} />
          <p className="footerLine">Eat for the body<br />you're building.</p>
        </div>
        <div className="footerCols">
          <div><h4>Eat</h4><Link to="/menu">This week's menu</Link><Link to="/start">Build a plan</Link><a href="/#plans">Programmes</a></div>
          <div><h4>Account</h4><Link to="/app">My plan</Link><Link to="/login">Sign in</Link><Link to="/signup">Create account</Link></div>
          <div><h4>Company</h4><a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div>
        </div>
      </div>
      <div className="footerGiant" aria-hidden>DIETBOX</div>
      <div className="footerBottom">
        <span>© {new Date().getUTCFullYear()} Dietbox. Delivering across the UAE.</span>
        <span>Prices in AED, incl. 5% VAT.</span>
      </div>
    </footer>
  );
}

export function PageShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.main className={`page ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
      {children}
    </motion.main>
  );
}

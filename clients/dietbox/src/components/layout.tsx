import { useEffect, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { authClient } from "../lib/auth-client";
import { Logo, Mark } from "./brand";
import { productConfig } from "../../product.config";
import { useI18n } from "../i18n";

/** Switches between English and Arabic; the label is always shown in the other language. */
export function LangSwitch() {
  const { locale, setLocale } = useI18n();
  return (
    <button type="button" className="langSwitch" onClick={() => setLocale(locale === "ar" ? "en" : "ar")} lang={locale === "ar" ? "en" : "ar"}>
      {locale === "ar" ? "English" : "العربية"}
    </button>
  );
}

const DARK_TOP_ROUTES = ["/", "/menu"];

export function Nav() {
  const { pathname } = useLocation();
  const { data: session } = authClient.useSession();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  const overDark = DARK_TOP_ROUTES.includes(pathname) && !scrolled && !open;

  return (
    <>
    <header className={`nav ${open ? "open" : overDark ? "overDark" : "solid"} ${scrolled ? "scrolled" : ""}`}>
      <div className="navInner">
        <Logo tone={overDark || open ? "volt" : "black"} height={30} />
        <nav className="navLinks" aria-label="Primary">
          <NavLink to="/menu">{t("Menu")}</NavLink>
          <Link to="/#plans">{t("Plans")}</Link>
          <Link to="/#how">{t("How it works")}</Link>
          <Link to="/#faq">{t("FAQ")}</Link>
        </nav>
        <div className="navActions">
          <span className="navText"><LangSwitch /></span>
          {session ? <Link to="/app" className="navText">{t("My plan")}</Link> : <Link to="/login" className="navText">{t("Sign in")}</Link>}
          <Link to="/start" className="btn primary sm">{t("Build my plan")}</Link>
          <button className="burger" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="mobile-menu" aria-label={open ? t("Close menu") : t("Open menu")} type="button"><i /><i /></button>
        </div>
      </div>
    </header>
    {/* Rendered outside <header>: the header's backdrop-filter would otherwise become the containing block and collapse this fixed overlay. */}
    <AnimatePresence>
        {open && (
          <motion.nav id="mobile-menu" aria-label={t("Menu")} className="mobileMenu" initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} exit={{ clipPath: "inset(0 0 100% 0)" }} transition={{ duration: 0.5, ease: [0.77, 0, 0.175, 1] }}>
            {[["/menu", t("Menu")], ["/#plans", t("Plans")], ["/#how", t("How it works")], ["/#faq", t("FAQ")], [session ? "/app" : "/login", session ? t("My plan") : t("Sign in")]].map(([to, label], i) => (
              <motion.div key={to} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                <Link to={to} className="mobileLink" onClick={() => setOpen(false)}>{label}</Link>
              </motion.div>
            ))}
            <LangSwitch />
            <Link to="/start" className="btn primary lg" onClick={() => setOpen(false)}>{t("Build my plan")}</Link>
          </motion.nav>
        )}
    </AnimatePresence>
    </>
  );
}

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="footer">
      <div className="footerTop">
        <div className="footerBrand">
          <Mark size={56} />
          <p className="footerLine">{t("Eat for the body")}<br />{t("you're building.")}</p>
        </div>
        <div className="footerCols">
          <div><h4>{t("Eat")}</h4><Link to="/menu">{t("This week's menu")}</Link><Link to="/start">{t("Build a plan")}</Link><Link to="/#plans">{t("Programmes")}</Link></div>
          <div><h4>{t("Account")}</h4><Link to="/app">{t("My plan")}</Link><Link to="/login">{t("Sign in")}</Link><Link to="/signup">{t("Create account")}</Link></div>
          <div><h4>{t("Company")}</h4><a href={`mailto:${productConfig.supportEmail}`}>{productConfig.supportEmail}</a><Link to="/privacy">{t("Privacy")}</Link><Link to="/terms">{t("Terms")}</Link></div>
        </div>
      </div>
      <div className="footerGiant" aria-hidden>DIETBOX</div>
      <div className="footerBottom">
        <span>{t("© {year} Dietbox. Delivering across the UAE.", { year: new Date().getUTCFullYear() })}</span>
        <span>{t("Prices in AED, incl. 5% VAT.")}</span>
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

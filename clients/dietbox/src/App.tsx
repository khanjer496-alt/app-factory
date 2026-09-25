import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { MotionConfig } from "motion/react";
import { authClient } from "./lib/auth-client";
import { Nav, PageShell } from "./components/layout";
import Landing from "./pages/Landing";
import { productConfig } from "../product.config";
import { useI18n } from "./i18n";

const Menu = lazy(() => import("./pages/Menu"));
const Builder = lazy(() => import("./pages/Builder"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth").then((m) => ({ default: m.Login })));
const Forgot = lazy(() => import("./pages/Auth").then((m) => ({ default: m.ForgotPassword })));
const Reset = lazy(() => import("./pages/Auth").then((m) => ({ default: m.ResetPassword })));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function Protected({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const { pathname } = useLocation();
  if (isPending) return <main className="dash"><div className="dashSkeleton"><i /><i /><i /></div></main>;
  if (!data) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />;
  return <>{children}</>;
}

function Legal({ kind }: { kind: "privacy" | "terms" }) {
  const { t } = useI18n();
  return (
    <PageShell className="prose">
      <span className="eyebrow"><i className="dot" />{t("Template · replace before launch")}</span>
      <h1 className="display l">{kind === "privacy" ? t("{name} privacy policy", { name: productConfig.name }) : t("{name} terms of service", { name: productConfig.name })}</h1>
      {kind === "privacy"
        ? <p lang="en" dir="ltr">Document the data collected (account, delivery address, phone, optional body metrics used only in the browser to estimate calories), purposes, retention, subprocessors (Cloudflare, Stripe), transfers, user rights and contact details. Review against UAE PDPL with qualified counsel. Data export and account deletion are available from the dashboard.</p>
        : <p lang="en" dir="ltr">Cover eligibility, plan purchase and refunds, delivery windows and failed deliveries, the 48-hour change lock, skipped days, allergen disclaimer, acceptable use, liability and governing law (UAE).</p>}
    </PageShell>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <Nav />
      <Suspense fallback={<main className="page" />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/start" element={<Builder />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/signup" element={<Auth signup />} />
          <Route path="/forgot-password" element={<Forgot />} />
          <Route path="/reset-password" element={<Reset />} />
          <Route path="/app" element={<Protected><Dashboard /></Protected>} />
          <Route path="/admin" element={<Protected><div dir="ltr" lang="en"><Admin /></div></Protected>} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}

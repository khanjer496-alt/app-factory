import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { authClient } from "../lib/auth-client";
import { safeNext } from "../lib/format";
import { Turnstile } from "../components/Turnstile";
import { Eyebrow } from "../components/brand";
import { Lines } from "../components/motion";
import { useI18n } from "../i18n";

function AuthFrame({ title, eyebrow, children }: { title: ReactNode[]; eyebrow: string; children: ReactNode }) {
  const { t } = useI18n();
  return (
    <main className="authPage">
      <section className="authForm">
        <Eyebrow>{eyebrow}</Eyebrow>
        <Lines as="h1" immediate className="display l" lines={title} />
        {children}
      </section>
      <aside className="authArt" aria-hidden>
        <img src="/meals/butter-chicken.webp" alt="" />
        <p className="display l">{t("Train hard.")}<br /><em>{t("Eat smart.")}</em></p>
      </aside>
    </main>
  );
}

export function Login({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { t } = useI18n();
  const next = safeNext(params.get("next"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const googleEnabled = import.meta.env.VITE_GOOGLE_AUTH_ENABLED === "true";

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setError(""); setSuccess("");
    const fetchOptions = token ? { headers: { "x-captcha-response": token } } : undefined;
    const result = signup
      ? await authClient.signUp.email({ name, email, password, callbackURL: next, fetchOptions })
      : await authClient.signIn.email({ email, password, callbackURL: next, fetchOptions });
    setBusy(false);
    if (result.error) return setError(result.error.message ? t(result.error.message) : t("Authentication failed"));
    // No session token means email verification is required before signing in.
    if (signup && !result.data?.token) return setSuccess(t("Account created. Check your inbox and verify your email. The link brings you straight back."));
    navigate(next);
  }

  return (
    <AuthFrame eyebrow={signup ? t("Create account") : t("Welcome back")} title={signup ? [t("Let's get"), <em key="c">{t("you cooking.")}</em>] : [t("Good to"), <em key="s">{t("see you.")}</em>]}>
      <form className="authFields" onSubmit={submit}>
        {signup && <label className="input"><span>{t("Name")}</span><input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required /></label>}
        <label className="input"><span>{t("Email")}</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
        <label className="input"><span>{t("Password")}</span><input type="password" minLength={10} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} required /></label>
        <Turnstile onToken={setToken} />
        {error && <p className="error" role="alert">{error}</p>}
        {success && <p className="notice">{success}</p>}
        <button className="btn primary lg block" disabled={busy}>{busy ? t("Working…") : signup ? t("Create account") : t("Sign in")}</button>
      </form>
      {googleEnabled && <button className="btn ghost lg block" type="button" onClick={() => authClient.signIn.social({ provider: "google", callbackURL: next })}>{t("Continue with Google")}</button>}
      <p className="authSwitch">
        {!signup && <><Link to="/forgot-password">{t("Forgot password?")}</Link> · </>}
        {signup ? t("Already have an account?") : t("New here?")}{" "}
        <Link to={`${signup ? "/login" : "/signup"}?next=${encodeURIComponent(next)}`}>{signup ? t("Sign in") : t("Create account")}</Link>
      </p>
    </AuthFrame>
  );
}

export function ForgotPassword() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [done, setDone] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    await authClient.requestPasswordReset({ email, redirectTo: `${location.origin}/reset-password`, fetchOptions: token ? { headers: { "x-captcha-response": token } } : undefined });
    setDone(true);
  }
  return (
    <AuthFrame eyebrow={t("Reset password")} title={[t("Forgot it?"), <em key="f">{t("Happens.")}</em>]}>
      {done ? <p className="notice">{t("If that account exists, a reset link is on its way.")}</p> : (
        <form className="authFields" onSubmit={submit}>
          <label className="input"><span>{t("Email")}</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <Turnstile onToken={setToken} />
          <button className="btn primary lg block">{t("Send reset link")}</button>
        </form>
      )}
    </AuthFrame>
  );
}

export function ResetPassword() {
  const { t } = useI18n();
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const token = new URLSearchParams(location.search).get("token") || "";
  async function submit(e: FormEvent) {
    e.preventDefault();
    const r = await authClient.resetPassword({ newPassword, token });
    setMessage(r.error?.message || t("Password updated. You can sign in now."));
  }
  return (
    <AuthFrame eyebrow={t("New password")} title={[t("Choose a"), <em key="n">{t("new password.")}</em>]}>
      <form className="authFields" onSubmit={submit}>
        <label className="input"><span>{t("New password")}</span><input type="password" minLength={10} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" /></label>
        <button className="btn primary lg block">{t("Update password")}</button>
      </form>
      {message && <p className="notice">{message} <Link to="/login">{t("Sign in")}</Link></p>}
    </AuthFrame>
  );
}

import { FormEvent, useState } from "react";
import { Link, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { authClient } from "./lib/auth-client";
import { api } from "./lib/api";
import { Turnstile } from "./components/Turnstile";
import { productConfig } from "../product.config";

function Layout({ children }: { children: React.ReactNode }) {
  const { data: session } = authClient.useSession();
  return <>
    <header className="nav"><Link to="/" className="brand">{productConfig.name}</Link><nav>
      {productConfig.billing.enabled && <Link to="/pricing">Pricing</Link>}<Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
      {session ? <><Link to="/app">Dashboard</Link><Link to="/admin">Admin</Link><button className="linkButton" onClick={() => authClient.signOut()}>Sign out</button></> : <><Link to="/login">Sign in</Link><Link className="button small" to="/signup">Start</Link></>}
    </nav></header>
    <main>{children}</main>
  </>;
}

function Home() { return <section className="hero"><span className="eyebrow">{productConfig.name.toUpperCase()}</span><h1>{productConfig.description}</h1><p>This starter page is intentionally simple. Replace it with the product-specific marketing surface while keeping the shared auth, billing, storage, analytics, email and operations runtime.</p><div className="actions"><Link className="button" to="/signup">Create account</Link>{productConfig.billing.enabled && <Link className="button secondary" to="/pricing">See pricing</Link>}</div></section>; }

function Login({ signup = false }: { signup?: boolean }) {
  const navigate = useNavigate();
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
    setBusy(true);
    setError("");
    setSuccess("");
    const fetchOptions = token ? { headers: { "x-captcha-response": token } } : undefined;
    const result = signup
      ? await authClient.signUp.email({ name, email, password, callbackURL: "/app", fetchOptions })
      : await authClient.signIn.email({ email, password, callbackURL: "/app", fetchOptions });
    setBusy(false);
    if (result.error) {
      setError(result.error.message || "Authentication failed");
      return;
    }
    if (signup) {
      setSuccess("Account created. Check your email and verify it before signing in.");
      return;
    }
    navigate("/app");
  }

  async function googleSignIn() {
    setError("");
    const result = await authClient.signIn.social({ provider: "google", callbackURL: "/app" });
    if (result?.error) setError(result.error.message || "Google sign-in failed");
  }

  return <section className="authCard">
    <h1>{signup ? "Create account" : "Welcome back"}</h1>
    <form onSubmit={submit}>
      {signup && <label>Name<input value={name} onChange={e => setName(e.target.value)} required /></label>}
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" minLength={10} value={password} onChange={e => setPassword(e.target.value)} required /></label>
      <Turnstile onToken={setToken}/>
      {error && <p className="error">{error}</p>}
      {success && <p>{success}</p>}
      <button className="button" disabled={busy}>{busy ? "Working…" : signup ? "Create account" : "Sign in"}</button>
    </form>
    {googleEnabled && <button className="button secondary" type="button" onClick={googleSignIn}>Continue with Google</button>}
    {!signup && <Link to="/forgot-password">Forgot password?</Link>}
    <p>{signup ? "Already have an account? " : "New here? "}<Link to={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create account"}</Link></p>
  </section>;
}

function ForgotPassword(){const[email,setEmail]=useState("");const[token,setToken]=useState("");const[done,setDone]=useState(false);async function submit(e:FormEvent){e.preventDefault();await authClient.requestPasswordReset({email,redirectTo:`${location.origin}/reset-password`,fetchOptions:token?{headers:{"x-captcha-response":token}}:undefined});setDone(true)}return <section className="authCard"><h1>Reset password</h1>{done?<p>If that account exists, check your email.</p>:<form onSubmit={submit}><label>Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label><Turnstile onToken={setToken}/><button className="button">Send reset link</button></form>}</section>}

function ResetPassword(){const[newPassword,setNewPassword]=useState("");const[message,setMessage]=useState("");const token=new URLSearchParams(location.search).get("token")||"";async function submit(e:FormEvent){e.preventDefault();const r=await authClient.resetPassword({newPassword,token});setMessage(r.error?.message||"Password updated. You can sign in.")};return <section className="authCard"><h1>Choose a new password</h1><form onSubmit={submit}><label>New password<input type="password" minLength={10} required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label><button className="button">Update password</button></form>{message&&<p>{message}</p>}</section>}

function Protected({children}:{children:React.ReactNode}){const{data,isPending}=authClient.useSession();if(isPending)return <section className="panel">Loading…</section>;if(!data)return <Navigate to="/login" replace/>;return <>{children}</>}

function Dashboard(){const{data}=authClient.useSession();const[status,setStatus]=useState("");async function checkout(plan:string){const r=await api<{url:string}>("/api/billing/checkout",{method:"POST",body:JSON.stringify({plan})});location.href=r.url}async function portal(){const r=await api<{url:string}>("/api/billing/portal",{method:"POST",body:"{}"});location.href=r.url}return <section className="shell"><aside><strong>{productConfig.name}</strong><a href="#overview">Overview</a>{productConfig.features.uploads&&<a href="#files">Files</a>}{productConfig.features.billing&&<a href="#billing">Billing</a>}<a href="#account">Account</a></aside><div className="content"><h1>Dashboard</h1><p>Signed in as {data?.user.email}</p><div className="grid"><article className="card"><h3>Product status</h3><p>Your reusable SaaS runtime is active. Replace this card with your product&apos;s core workflow.</p></article><article className="card"><h3>Health</h3><button onClick={async()=>{const r=await api<{status:string}>("/api/health");setStatus(r.status)}}>Check API</button><p>{status}</p></article></div>{productConfig.features.uploads&&<section id="files"><h2>Private files</h2><FilePanel/></section>}{productConfig.features.billing&&<section id="billing"><h2>Billing</h2><div className="actions">{productConfig.billing.plans.map(plan=><button key={plan.id} className="button" onClick={()=>checkout(plan.id)}>Choose {plan.name}</button>)}<button className="button secondary" onClick={portal}>Manage billing</button></div></section>}<section id="account"><h2>Account</h2><AccountPanel/></section></div></section>}

function FilePanel(){const[files,setFiles]=useState<Array<{id:string;name:string;size:number}>>([]);const[error,setError]=useState("");async function refresh(){setFiles(await api("/api/files"))}async function upload(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];if(!file)return;const form=new FormData();form.set("file",file);try{await api("/api/files",{method:"POST",body:form});await refresh()}catch(err){setError(String(err))}}return <div><div className="actions"><input type="file" onChange={upload}/><button onClick={refresh}>Refresh</button></div>{error&&<p className="error">{error}</p>}<ul>{files.map(f=><li key={f.id}><a href={`/api/files/${f.id}`}>{f.name}</a> · {Math.round(f.size/1024)} KB <button onClick={async()=>{await api(`/api/files/${f.id}`,{method:"DELETE"});refresh()}}>Delete</button></li>)}</ul></div>}

function AccountPanel(){const[exportText,setExportText]=useState("");const[message,setMessage]=useState("");async function exportData(){const data=await api("/api/account/export");setExportText(JSON.stringify(data,null,2))}async function remove(){if(prompt('Type DELETE to request permanent account deletion')!=="DELETE")return;const result=await authClient.deleteUser({callbackURL:"/"});if(result.error){setMessage(result.error.message||"Could not request account deletion");return;}setMessage("Deletion requested. If confirmation is required, use the link sent to your email.")}return <><div className="actions"><button onClick={exportData}>Export my data</button><button className="danger" onClick={remove}>Delete account</button></div>{message&&<p>{message}</p>}{exportText&&<pre>{exportText}</pre>}</>}


function AdminPage(){const[overview,setOverview]=useState<any>(null);const[users,setUsers]=useState<any[]>([]);const[error,setError]=useState("");async function load(){try{setOverview(await api("/api/admin/overview"));setUsers(await api("/api/admin/users"));}catch(e){setError(String(e))}}return <section className="page"><h1>Admin</h1><p>Internal operations surface. Admin access is enforced server-side.</p><button className="button" onClick={load}>Load admin data</button>{error&&<p className="error">{error}</p>}{overview&&<div className="grid"><article className="card"><strong>Users</strong><p className="price">{overview.users}</p></article><article className="card"><strong>Active subscriptions</strong><p className="price">{overview.activeSubscriptions}</p></article><article className="card"><strong>Files</strong><p className="price">{overview.files.count}</p></article><article className="card"><strong>Failed webhooks</strong><p className="price">{overview.failedWebhooks}</p></article></div>}{users.length>0&&<div className="card"><h2>Recent users</h2><ul>{users.map(u=><li key={u.id}>{u.email} · {u.role||"user"}</li>)}</ul></div>}</section>}

function Pricing(){if(!productConfig.billing.enabled)return <Navigate to="/" replace/>;return <section className="page"><h1>Pricing</h1><div className="grid">{productConfig.billing.plans.map(plan=><article className="card" key={plan.id}><h2>{plan.name}</h2><p className="price">{plan.priceLabel}</p><p>Configure the matching Stripe price ID in Worker secrets/variables before launch.</p><Link className="button" to="/signup">Start</Link></article>)}</div></section>}
function Privacy(){return <section className="page prose"><h1>{productConfig.name} privacy policy template</h1><p>Replace this template before launch. Document the data you collect, why you collect it, retention periods, subprocessors, international transfers, user rights, analytics, AI providers and contact details.</p><p>The starter already includes data export and account deletion endpoints. Verify jurisdiction-specific requirements with qualified counsel before launch.</p></section>}
function Terms(){return <section className="page prose"><h1>{productConfig.name} terms of service template</h1><p>Replace this template before launch. Cover eligibility, account responsibilities, payments, acceptable use, intellectual property, suspension, termination, disclaimers and governing law.</p></section>}

export default function App(){return <Layout><Routes><Route path="/" element={<Home/>}/><Route path="/login" element={<Login/>}/><Route path="/signup" element={<Login signup/>}/><Route path="/forgot-password" element={<ForgotPassword/>}/><Route path="/reset-password" element={<ResetPassword/>}/><Route path="/app" element={<Protected><Dashboard/></Protected>}/><Route path="/pricing" element={<Pricing/>}/><Route path="/admin" element={<Protected><AdminPage/></Protected>}/><Route path="/privacy" element={<Privacy/>}/><Route path="/terms" element={<Terms/>}/><Route path="*" element={<Navigate to="/"/>}/></Routes></Layout>}

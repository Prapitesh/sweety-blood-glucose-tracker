import { useState } from "react";
import { HeartPulse, ShieldCheck } from "./Icons";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await (mode === "login"
        ? signIn({ email: form.email, password: form.password })
        : signUp(form));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="brand brand-white">
          <HeartPulse /> <b>Sweety</b>
        </div>
        <div className="art-copy">
          <span className="eyebrow">YOUR HEALTH, IN YOUR HANDS</span>
          <h1>
            Small steps.
            <br />
            <i>Clearer</i> patterns.
          </h1>
          <p>A calmer way to keep track of your glucose readings and understand your day.</p>
          <div className="art-points">
            <span>Daily insights</span>
            <span>Private by design</span>
          </div>
        </div>
        <div className="art-orbit" />
      </section>

      <section className="auth-side">
        <div className="auth-box">
          <div className="brand mobile-brand">
            <HeartPulse />
            <b>Sweety</b>
          </div>
          <span className="eyebrow">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span>
          <h2>{mode === "login" ? "Sign in to Sweety" : "Create your account"}</h2>
          <p className="muted">
            {mode === "login"
              ? "Your daily health log is right where you left it."
              : "Build a simple habit of checking in with yourself."}
          </p>
          <form onSubmit={submit}>
            {mode === "signup" && (
              <label>
                Full name
                <input
                  required
                  maxLength="100"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </label>
            <label>
              Password
              <input
                required
                minLength="8"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder="At least 8 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </label>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
            <button className="primary wide" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <p className="switch">
            {mode === "login" ? "New to Sweety?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "signup" : "login");
                setError("");
              }}
            >
              {mode === "login" ? "Create account" : "Sign in"}
            </button>
          </p>
          <small className="privacy">
            <ShieldCheck size={15} /> Your readings are private and only visible to you.
          </small>
        </div>
      </section>
    </main>
  );
}

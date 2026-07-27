import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate(location.state?.from || "/admin/dashboard", { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="container-page py-24 max-w-md">
      <span className="eyebrow">Admin</span>
      <h1 className="text-3xl mt-2 mb-8">Admin sign in</h1>
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div>
          <label className="block text-sm text-chrome-light mb-1">Email</label>
          <input
            required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber"
          />
        </div>
        <div>
          <label className="block text-sm text-chrome-light mb-1">Password</label>
          <input
            required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-steel border border-steel-line rounded px-4 py-2.5 focus:outline-none focus:border-amber"
          />
        </div>
        {error && <p className="text-danger text-sm">{error}</p>}
        <button type="submit" disabled={loading} className="btn btn-primary justify-self-start">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="text-chrome text-xs mt-6 font-mono">
        Single hardcoded admin account, configured via ADMIN_EMAIL / ADMIN_PASSWORD in the backend .env
      </p>
    </section>
  );
}

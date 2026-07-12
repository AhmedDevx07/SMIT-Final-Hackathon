import { useState } from "react";
import { Navigate } from "react-router-dom";
import { getDashboardPath, useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const { login, loading, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-100">
      <div className="pointer-events-none absolute inset-0 theme-grid opacity-30" />
      <div className="pointer-events-none absolute -left-28 top-10 h-72 w-72 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-1/4 h-80 w-80 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="animate-fade-up hidden lg:block">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200/90 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]" />
                Smart maintenance operations, beautifully streamlined
              </div>

              <h1 className="mt-8 text-5xl font-semibold leading-tight text-white">
                A cleaner, faster control center for modern maintenance teams.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">
                Track assets, triage complaints, and coordinate technician
                workflows from a premium workspace designed to feel calm, sharp,
                and reliable.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: "Unified Visibility",
                    text: "Assets, issues, and triage in one place.",
                  },
                  {
                    title: "AI-Ready Flow",
                    text: "Turn scanned complaints into structured actions.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.title}
                    className={`glass-panel animate-float rounded-3xl p-5 ${index === 1 ? "lg:mt-8" : ""}`}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
                      {item.title}
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="animate-fade-up">
            <div className="glass-panel mx-auto w-full max-w-xl rounded-[32px] p-6 shadow-2xl shadow-black/30 sm:p-8">
              <div className="mb-8">
                <div className="inline-flex items-center gap-3 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
                  AssetCare Cloud
                </div>
                <h2 className="mt-6 text-3xl font-semibold text-white sm:text-4xl">
                  Welcome back
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  Sign in to continue into your operations workspace.
                </p>
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold text-indigo-300 mb-2">
                    Default Credentials
                  </p>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>
                      <span className="font-semibold text-white">Admin:</span>{" "}
                      admin@maintainiq.com / Admin123!
                    </p>
                    <p>
                      <span className="font-semibold text-white">
                        Technician:
                      </span>{" "}
                      tech@maintainiq.com / Tech123!
                    </p>
                  </div>
                </div>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="group relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pt-5 text-sm text-white outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    required
                  />
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-4 top-4 origin-left text-sm text-slate-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:scale-75 peer-focus:text-indigo-300 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:scale-75"
                  >
                    Email address
                  </label>
                </div>

                <div className="group relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder=" "
                    className="peer h-14 w-full rounded-2xl border border-white/10 bg-white/5 px-4 pt-5 text-sm text-white outline-none focus:border-transparent focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                    required
                  />
                  <label
                    htmlFor="password"
                    className="pointer-events-none absolute left-4 top-4 origin-left text-sm text-slate-400 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:scale-75 peer-focus:text-indigo-300 peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:scale-75"
                  >
                    Password
                  </label>
                </div>

                {error ? (
                  <div className="animate-alert-in rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-[0_10px_30px_rgba(239,68,68,0.12)]">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-400/20 text-xs font-bold text-red-200">
                        !
                      </span>
                      <p className="leading-6">{error}</p>
                    </div>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? (
                    <>
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                      Signing you in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              <div className="mt-8 grid gap-3 border-t border-white/10 pt-6 text-sm text-slate-400 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Secure role-based access
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  AI-assisted triage
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  Live asset visibility
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Login;

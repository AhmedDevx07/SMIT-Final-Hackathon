import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../redux/authSlice';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      const role = result.payload.role;
      navigate(role === 'admin' ? '/admin' : '/technician');
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row bg-[#030712] font-sans antialiased text-[#f9fafb]">

      {/* LEFT PANEL: Branding & Aesthetics */}
      <motion.div
        className="relative flex flex-1 flex-col justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,#1e1b4b,#0f172a_60%,#020617)] px-8 py-16 sm:px-12 lg:flex-[1.2] lg:px-20 xl:px-24"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {/* Modern Cyber Ambient Glows */}
        <div className="absolute top-[-200px] right-[-200px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.12)_0%,transparent_60%)] blur-[40px]" />
        <div className="absolute bottom-[-100px] left-[-100px] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_60%)] blur-[40px]" />

        <div className="relative z-10 flex flex-col">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#6366f1] mb-6 backdrop-blur-md">
            <svg className="h-3 w-3 animate-pulse text-indigo-400" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="3" />
            </svg>
            Maintainiq Enterprise
          </div>

          <h1 className="max-w-[540px] text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl/tight">
            Scan. Diagnose.<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Resolve.
            </span>
          </h1>

          <p className="mt-6 max-w-[440px] text-base leading-relaxed text-[#9ca3af] lg:text-lg">
            Empower your maintenance team with next-generation AI triage.
            Every asset gets a digital identity and an immutable timeline tracking history at scale.
          </p>

          {/* Impact Stats Group */}
          <div className="mt-12 grid grid-cols-2 gap-6 border-t border-white/10 pt-8 sm:gap-10">
            <div className="flex flex-col gap-1 border-l-2 border-indigo-500/40 pl-4">
              <span className="flex items-center gap-1.5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                99.9%
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l6 6 9-9" />
                </svg>
              </span>
              <span className="text-xs font-medium text-[#9ca3af] sm:text-sm">Uptime Delivered</span>
            </div>

            <div className="flex flex-col gap-1 border-l-2 border-purple-500/40 pl-4">
              <span className="flex items-center gap-1.5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                3x
                <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </span>
              <span className="text-xs font-medium text-[#9ca3af] sm:text-sm">Faster Resolutions</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT PANEL: Intelligent Login Space */}
      <motion.div
        className="relative flex flex-1 items-center justify-center bg-[#030712] px-6 py-12 sm:px-12 lg:px-16"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.03)_0%,transparent_50%)]" />

        <div className="relative z-10 w-full max-w-[420px]">
          <form className="flex flex-col" onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Welcome back</h2>
              <p className="mt-2 text-sm text-[#9ca3af]">Sign in to your intelligent operational control room</p>
            </div>

            {/* Error Notification Block */}
            {error && (
              <motion.div
                className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-md"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg className="h-5 w-5 flex-shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span className="font-medium">{error}</span>
              </motion.div>
            )}

            {/* Email Field Group */}
            <div className="mb-5 flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#111827] px-4 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:border-[#6366f1] focus:bg-[#1f2937] focus:ring-4 focus:ring-[#6366f1]/15"
                  required
                />
              </div>
            </div>

            {/* Password Field Group */}
            <div className="mb-6 flex flex-col gap-2">
              <label htmlFor="password" className="text-xs font-semibold tracking-wide text-gray-300 uppercase">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#111827] pl-4 pr-12 py-3.5 text-sm text-white placeholder-gray-600 outline-none transition-all duration-200 focus:border-[#6366f1] focus:bg-[#1f2937] focus:ring-4 focus:ring-[#6366f1]/15"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 text-xs font-bold uppercase tracking-wider text-[#9ca3af] transition-colors hover:text-[#6366f1]"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178a1.012 1.012 0 010 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Action Trigger Button */}
            <motion.button
              type="submit"
              className="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] py-4 text-center text-sm font-bold tracking-wide text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] outline-none transition-all duration-200 hover:shadow-[0_0_28px_rgba(99,102,241,0.65)] disabled:opacity-50 disabled:pointer-events-none"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.015 }}
              whileTap={{ scale: loading ? 1 : 0.985 }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Authenticating Engine...
                </span>
              ) : (
                'Sign In Workspace'
              )}
            </motion.button>

            {/* Premium Seeded Credentials Block */}
            <div className="mt-8 rounded-xl border border-white/[0.08] bg-[rgba(31,41,55,0.4)] p-5 text-xs text-[#9ca3af] backdrop-blur-md">
              <div className="flex items-center gap-1.5 font-bold tracking-wider uppercase text-gray-300 mb-3">
                <svg className="h-4 w-4 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Quick Access Sandbox
              </div>
              <div className="space-y-2 leading-relaxed">
                <div>
                  <span className="font-semibold text-gray-200">👑 Admin Core:</span>{' '}
                  <code className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-300">admin@maintainiq.com</code> /{' '}
                  <code className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-300">Admin123!</code>
                </div>
                <div>
                  <span className="font-semibold text-gray-200">🔧 Technician Node:</span>{' '}
                  <code className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-300">Ali@maintainiq.com</code> /{' '}
                  <code className="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-gray-300">tech123</code>
                </div>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
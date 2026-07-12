import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { loginUser } from '../redux/authSlice';
import './Login.css';

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
    <div className="login-wrapper">
      <motion.div
        className="login-brand-panel"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <div className="brand-glow" />
        <div className="brand-glow-2" />
        <span className="brand-kicker">EquipSense Enterprise</span>
        <h1 className="brand-title">Scan. Diagnose.<br /><span>Resolve.</span></h1>
        <p className="brand-subtext">
          Empower your maintenance team with next-generation AI triage. 
          Every asset gets a digital identity and a permanent history that scales with your infrastructure.
        </p>

        <div className="brand-stats">
          <div className="stat-block">
            <span className="stat-number">99%</span>
            <span className="stat-label">Uptime Delivered</span>
          </div>
          <div className="stat-block">
            <span className="stat-number">3x</span>
            <span className="stat-label">Faster Resolution</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="login-form-panel"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
      >
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Welcome back</h2>
          <p className="form-subtext">Sign in to your intelligent workspace</p>

          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </motion.div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? 'Hide' : 'Show'}
              </span>
            </div>
          </div>

          <motion.button
            type="submit"
            className="login-btn"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </motion.button>

          <div className="demo-creds">
            <strong>Demo Accounts:</strong><br /><br />
            Admin: <code>admin@equipSense.com</code> / <code>Admin123!</code><br /><br />
            <strong>Technicians:</strong> (Password: <code>tech123</code>)<br />
            <code>Ali@equipSense.com</code><br />
            <code>sarah@equipSense.com</code><br />
            <code>john@equipSense.com</code><br />
            <code>maria@equipSense.com</code>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const TechnicianForm = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/technician', form);
      onSuccess(res.data);
      onClose();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add technician');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/80 p-4 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-[480px] overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900 p-6 shadow-2xl md:p-8"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-indigo-500 to-violet-500" />

          <h2 className="text-xl font-bold text-white md:text-2xl">Add Technician</h2>
          <p className="mt-1.5 text-sm text-gray-400 mb-6">
            Create a new technician account for your team.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Full Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Full Name</label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Email Address</label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Password</label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Secure password"
                required
                minLength="6"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Technician'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TechnicianForm;
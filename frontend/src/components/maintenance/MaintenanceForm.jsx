import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const MaintenanceForm = ({ issueId, onClose, onSaved }) => {
  const [form, setForm] = useState({
    findings: '',
    actionTaken: '',
    partsReplaced: '',
    cost: 0,
    finalCondition: 'Good',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        issueId,
        findings: form.findings,
        actionTaken: form.actionTaken,
        partsReplaced: form.partsReplaced ? form.partsReplaced.split(',').map((p) => p.trim()) : [],
        cost: Number(form.cost) || 0,
        finalCondition: form.finalCondition,
      };
      const { data } = await api.post('/maintenance', payload);
      onSaved(data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save maintenance record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop Shell Overlay */}
      <motion.div 
        className="fixed inset-0 bg-gray-950/75 backdrop-blur-md flex items-center justify-center z-100 p-5"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
      >
        {/* Main Dialog Modal Panel */}
        <motion.div
          className="relative bg-gray-900 border border-white/[0.06] rounded-2xl p-6 sm:p-8 w-full max-w-[480px] shadow-2xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Border Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">Add Maintenance Record</h2>
          <p className="text-sm text-gray-400 mb-6">Required before this issue can be marked Resolved.</p>

          {/* Error Message Flash */}
          {error && (
            <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Findings Block */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-white">Findings</label>
              <textarea 
                name="findings" 
                rows="2" 
                value={form.findings} 
                onChange={handleChange} 
                placeholder="What did you find during inspection?" 
                required 
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all resize-y focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              />
            </div>

            {/* Action Taken Block */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-white">Action Taken</label>
              <textarea 
                name="actionTaken" 
                rows="2" 
                value={form.actionTaken} 
                onChange={handleChange} 
                placeholder="What repair/action was performed?" 
                required 
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all resize-y focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              />
            </div>

            {/* Comma Parts & Cost Inline Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-white">Parts Replaced (comma-separated)</label>
                <input 
                  name="partsReplaced" 
                  value={form.partsReplaced} 
                  onChange={handleChange} 
                  placeholder="HDMI cable, fuse" 
                  className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs sm:text-sm font-medium text-white">Cost (PKR)</label>
                <input 
                  name="cost" 
                  type="number" 
                  min="0" 
                  value={form.cost} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            {/* Condition Dropdown Block */}
            <div className="flex flex-col gap-2">
              <label className="text-xs sm:text-sm font-medium text-white">Final Condition</label>
              <select 
                name="finalCondition" 
                value={form.finalCondition} 
                onChange={handleChange}
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
              >
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>

            {/* Control Panel Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                className="border border-white/[0.08] text-gray-400 px-5 py-3 rounded-xl font-medium text-sm transition-all hover:bg-white/[0.04] hover:text-white" 
                onClick={onClose}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/10 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/20 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MaintenanceForm;
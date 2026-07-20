import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { createAsset, updateAsset } from '../../redux/assetSlice';

const CATEGORIES = ['Electronics', 'HVAC', 'Plumbing', 'Furniture', 'Machinery', 'Electrical', 'Other'];

const AssetForm = ({ onClose, initialData = null }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.assets);

  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    location: '',
    condition: 'Good',
    lastServiceDate: '',
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        category: initialData.category || 'Electronics',
        location: initialData.location || '',
        condition: initialData.condition || 'Good',
        lastServiceDate: initialData.lastServiceDate ? initialData.lastServiceDate.substring(0, 10) : '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initialData) {
      const result = await dispatch(updateAsset({ id: initialData._id, updates: form }));
      if (updateAsset.fulfilled.match(result)) {
        onClose();
      }
    } else {
      const result = await dispatch(createAsset(form));
      if (createAsset.fulfilled.match(result)) {
        onClose();
      }
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

          <h2 className="text-xl font-bold text-white md:text-2xl">{initialData ? 'Update Asset' : 'Register New Asset'}</h2>
          <p className="mt-1.5 text-sm text-gray-400 mb-6">
            {initialData ? 'Update details for the selected asset.' : 'A unique asset code and QR link will be generated automatically.'}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Asset Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Asset Name</label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Classroom Projector 01"
                required
              />
            </div>

            {/* Category & Condition Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Category</label>
                <div className="relative">
                  <select
                    className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-gray-900 text-white">{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Condition</label>
                <select
                  className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer"
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                >
                  <option className="bg-gray-900 text-white">Excellent</option>
                  <option className="bg-gray-900 text-white">Good</option>
                  <option className="bg-gray-900 text-white">Fair</option>
                  <option className="bg-gray-900 text-white">Poor</option>
                </select>
              </div>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Location</label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Block A - Room 101"
                required
              />
            </div>

            {/* Service Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold tracking-wide text-gray-300 uppercase">Last Service Date (Optional)</label>
              <input
                className="w-full rounded-xl border border-white/[0.08] bg-gray-950/40 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:bg-gray-950 focus:ring-4 focus:ring-indigo-500/10 cursor-pointer icon-white"
                type="date"
                name="lastServiceDate"
                value={form.lastServiceDate}
                onChange={handleChange}
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
                {loading ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Asset' : 'Create Asset')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssetForm;
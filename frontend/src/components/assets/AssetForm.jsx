import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { createAsset } from '../../redux/assetSlice';
import './AssetForm.css';

const CATEGORIES = ['Electronics', 'HVAC', 'Plumbing', 'Furniture', 'Machinery', 'Electrical', 'Other'];

const AssetForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.assets);

  const [form, setForm] = useState({
    name: '',
    category: 'Electronics',
    location: '',
    condition: 'Good',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createAsset(form));
    if (createAsset.fulfilled.match(result)) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Register New Asset</h2>
          <p className="modal-subtext">A unique asset code and QR link will be generated automatically.</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Asset Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Classroom Projector 01" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Condition</label>
                <select name="condition" value={form.condition} onChange={handleChange}>
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Poor</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Location</label>
              <input name="location" value={form.location} onChange={handleChange} placeholder="Block A - Room 101" required />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Asset'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AssetForm;
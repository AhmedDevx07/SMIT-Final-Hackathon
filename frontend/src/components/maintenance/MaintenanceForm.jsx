import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import './MaintenanceForm.css';

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
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div
          className="modal-panel"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2>Add Maintenance Record</h2>
          <p className="modal-subtext">Required before this issue can be marked Resolved.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Findings</label>
              <textarea name="findings" rows="2" value={form.findings} onChange={handleChange} placeholder="What did you find during inspection?" required />
            </div>

            <div className="form-group">
              <label>Action Taken</label>
              <textarea name="actionTaken" rows="2" value={form.actionTaken} onChange={handleChange} placeholder="What repair/action was performed?" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Parts Replaced (comma-separated)</label>
                <input name="partsReplaced" value={form.partsReplaced} onChange={handleChange} placeholder="HDMI cable, fuse" />
              </div>
              <div className="form-group">
                <label>Cost (PKR)</label>
                <input name="cost" type="number" min="0" value={form.cost} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Final Condition</label>
              <select name="finalCondition" value={form.finalCondition} onChange={handleChange}>
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={loading}>
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

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AITriagePreview from '../components/issues/AITriagePreview';
import './PublicAssetPage.css';

const STATUS_COLORS = {
  Operational: 'status-ok',
  'Issue Reported': 'status-warn',
  'Under Inspection': 'status-warn',
  'Under Maintenance': 'status-warn',
  'Out of Service': 'status-danger',
  Retired: 'status-muted',
};

const PublicAssetPage = () => {
  const { assetCode } = useParams();
  const [asset, setAsset] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  const [showReportForm, setShowReportForm] = useState(false);
  const [complaint, setComplaint] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [editedValues, setEditedValues] = useState({ title: '', category: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const { data } = await api.get(`/assets/public/${assetCode}`);
        setAsset(data.asset);
        setRecentActivity(data.recentActivity || []);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetCode]);

  const handleGetAiSuggestion = async () => {
    if (!complaint || complaint.trim().length < 5) return;
    setAiLoading(true);
    try {
      const { data } = await api.post('/ai/triage', {
        complaint,
        assetName: asset.name,
        assetCategory: asset.category,
        assetCondition: asset.condition,
        assetLocation: asset.location,
      });
      setAiSuggestion(data);
      setEditedValues({
        title: data.suggestedTitle || '',
        category: data.suggestedCategory || '',
        priority: data.suggestedPriority || 'Medium',
      });
    } catch (error) {
      // graceful — user can still submit manually
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitIssue = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const { data } = await api.post('/issues/public', {
        assetCode,
        title: editedValues.title || complaint.slice(0, 60),
        description: complaint,
        category: editedValues.category || 'General',
        priority: editedValues.priority || 'Medium',
        reporterName: reporterName || 'Anonymous',
        aiSuggestion: aiSuggestion
          ? {
              suggestedTitle: aiSuggestion.suggestedTitle,
              suggestedCategory: aiSuggestion.suggestedCategory,
              suggestedPriority: aiSuggestion.suggestedPriority,
              possibleCauses: aiSuggestion.possibleCauses,
              initialChecks: aiSuggestion.initialChecks,
              wasEdited:
                editedValues.title !== aiSuggestion.suggestedTitle ||
                editedValues.category !== aiSuggestion.suggestedCategory ||
                editedValues.priority !== aiSuggestion.suggestedPriority,
            }
          : undefined,
      });
      setSubmitted(data);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="public-page-state">Loading asset...</div>;
  }

  if (notFound) {
    return (
      <div className="public-page-state">
        <div className="not-found-box">
          <h2>Asset Not Found</h2>
          <p>This QR code or link doesn't match any registered asset. Please check with your facility administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-page">
      <div className="public-container">
        <motion.div className="public-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="public-kicker">Maintainiq · Asset Record</span>
          <h1>{asset.name}</h1>
          <div className="public-badges">
            <span className={`status-pill ${STATUS_COLORS[asset.status] || 'status-muted'}`}>{asset.status}</span>
            <span className="asset-code-badge">{asset.assetCode}</span>
          </div>
        </motion.div>

        {asset.isRetired && (
          <div className="retired-banner">This asset has been permanently retired from service.</div>
        )}

        <motion.div className="asset-info-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="info-item"><span className="info-label">Category</span><span>{asset.category}</span></div>
          <div className="info-item"><span className="info-label">Location</span><span>{asset.location}</span></div>
          <div className="info-item"><span className="info-label">Condition</span><span>{asset.condition}</span></div>
          <div className="info-item"><span className="info-label">Last Service</span><span>{asset.lastServiceDate ? new Date(asset.lastServiceDate).toLocaleDateString() : '—'}</span></div>
          <div className="info-item"><span className="info-label">Next Service</span><span>{asset.nextServiceDate ? new Date(asset.nextServiceDate).toLocaleDateString() : '—'}</span></div>
        </motion.div>

        {recentActivity.length > 0 && (
          <div className="activity-section">
            <h3>Recent Activity</h3>
            <ul>
              {recentActivity.map((item, i) => (
                <li key={i}>
                  <span>{item.action}</span>
                  <span className="activity-date">{new Date(item.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!asset.isRetired && !submitted && !showReportForm && (
          <motion.button className="report-issue-btn" onClick={() => setShowReportForm(true)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Report an Issue
          </motion.button>
        )}

        <AnimatePresence>
          {showReportForm && !submitted && (
            <motion.div
              className="report-form-card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3>Report an Issue</h3>

              {submitError && <div className="dash-error">{submitError}</div>}

              <form onSubmit={handleSubmitIssue}>
                <div className="form-group">
                  <label>Your Name (optional)</label>
                  <input value={reporterName} onChange={(e) => setReporterName(e.target.value)} placeholder="Anonymous" />
                </div>

                <div className="form-group">
                  <label>Describe the problem</label>
                  <textarea
                    rows="3"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI."
                    required
                  />
                </div>

                {!aiSuggestion && (
                  <button type="button" className="ai-generate-btn" onClick={handleGetAiSuggestion} disabled={aiLoading || complaint.trim().length < 5}>
                    {aiLoading ? 'Analyzing complaint...' : '✦ Get AI Suggestion'}
                  </button>
                )}

                {aiSuggestion && (
                  <AITriagePreview
                    suggestion={aiSuggestion}
                    editedValues={editedValues}
                    onEdit={(field, value) => setEditedValues({ ...editedValues, [field]: value })}
                  />
                )}

                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowReportForm(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {submitted && (
          <motion.div className="submitted-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <h3>✓ Issue Reported</h3>
            <p>Your issue number is <strong>{submitted.issueNumber}</strong>. Save this to track its status.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicAssetPage;

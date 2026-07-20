import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import AITriagePreview from '../components/issues/AITriagePreview';

const STATUS_COLORS = {
  Operational: 'bg-emerald-500/15 text-emerald-400',
  'Issue Reported': 'bg-amber-500/15 text-amber-400',
  'Under Inspection': 'bg-amber-500/15 text-amber-400',
  'Under Maintenance': 'bg-amber-500/15 text-amber-400',
  'Out of Service': 'bg-rose-500/15 text-rose-400',
  Retired: 'bg-zinc-500/12 text-zinc-400',
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
        suggestedTitle: data.suggestedTitle || '',
        suggestedCategory: data.suggestedCategory || '',
        suggestedPriority: data.suggestedPriority || 'Medium',
      });
    } catch (error) {
      // Graceful fallback
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
        title: editedValues.title || editedValues.suggestedTitle || complaint.slice(0, 60),
        description: complaint,
        category: editedValues.category || editedValues.suggestedCategory || 'General',
        priority: editedValues.priority || editedValues.suggestedPriority || 'Medium',
        reporterName: reporterName || 'Anonymous',
        aiSuggestion: aiSuggestion
          ? {
              suggestedTitle: aiSuggestion.suggestedTitle,
              suggestedCategory: aiSuggestion.suggestedCategory,
              suggestedPriority: aiSuggestion.suggestedPriority,
              possibleCauses: aiSuggestion.possibleCauses,
              initialChecks: aiSuggestion.initialChecks,
              wasEdited:
                (editedValues.title || editedValues.suggestedTitle) !== aiSuggestion.suggestedTitle ||
                (editedValues.category || editedValues.suggestedCategory) !== aiSuggestion.suggestedCategory ||
                (editedValues.priority || editedValues.suggestedPriority) !== aiSuggestion.suggestedPriority,
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
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-400">
        Loading asset...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
        <div className="w-full max-w-md border border-white/[0.08] bg-gray-900 p-8 text-center rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold text-white mb-3">Asset Not Found</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            This QR code or link doesn't match any registered asset. Please check with your facility administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 p-6 sm:py-16 sm:px-5 relative overflow-hidden text-white">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.1)_0%,transparent_70%)] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-[680px]">
        
        {/* Header */}
        <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <span className="text-xs font-bold tracking-[2px] text-indigo-400 uppercase">Maintainiq · Asset Record</span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mt-3 mb-5">{asset.name}</h1>
          <div className="flex items-center gap-3">
            <span className={`text-[0.7rem] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${STATUS_COLORS[asset.status] || 'bg-zinc-500/12 text-zinc-400'}`}>
              {asset.status}
            </span>
            <span className="font-mono text-xs text-gray-400 bg-white/[0.05] px-2.5 py-1 rounded-md">
              {asset.assetCode}
            </span>
          </div>
        </motion.div>

        {/* Retired Status Banner */}
        {asset.isRetired && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm font-medium text-rose-300">
            This asset has been permanently retired from service.
          </div>
        )}

        {/* Details Metrics Card */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 gap-5 rounded-2xl border border-white/[0.08] bg-gray-900/60 p-7 mb-8 shadow-xl backdrop-blur-md"
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.72rem] font-bold tracking-wider text-gray-500 uppercase">Category</span>
            <span className="text-white font-medium text-sm sm:text-base">{asset.category}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.72rem] font-bold tracking-wider text-gray-500 uppercase">Location</span>
            <span className="text-white font-medium text-sm sm:text-base">{asset.location}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.72rem] font-bold tracking-wider text-gray-500 uppercase">Condition</span>
            <span className="text-white font-medium text-sm sm:text-base">{asset.condition}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-[0.72rem] font-bold tracking-wider text-gray-500 uppercase">Last Service</span>
            <span className="text-white font-medium text-sm sm:text-base">
              {asset.lastServiceDate ? new Date(asset.lastServiceDate).toLocaleDateString() : '—'}
            </span>
          </div>
        </motion.div>

        {/* Activity Timeline Mini Section */}
        {recentActivity.length > 0 && (
          <div className="mb-8">
            <h3 className="text-md font-semibold text-white mb-4">Recent Activity</h3>
            <ul className="flex flex-col gap-3 list-none p-0 m-0">
              {recentActivity.map((item, i) => (
                <li key={i} className="flex justify-between items-center rounded-xl bg-gray-900/60 border border-white/[0.04] border-l-[3px] border-l-indigo-500 p-4.5 text-sm text-white transition-transform hover:translate-x-1">
                  <span className="font-medium">{item.action}</span>
                  <span className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Trigger Button */}
        {!asset.isRetired && !submitted && !showReportForm && (
          <motion.button 
            className="cursor-pointer w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white p-4.5 rounded-2xl font-bold text-[1.05rem] shadow-lg shadow-indigo-500/20 transition-all"
            onClick={() => setShowReportForm(true)} 
            whileHover={{ scale: 1.01 }} 
            whileTap={{ scale: 0.99 }}
          >
            Report an Issue
          </motion.button>
        )}

        {/* Form Overlay/Expansion Wrapper */}
        <AnimatePresence>
          {showReportForm && !submitted && (
            <motion.div
              className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-gray-900/80 p-5 sm:p-8 shadow-2xl backdrop-blur-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <h3 className="text-xl font-bold text-white mb-6">Report an Issue</h3>

              {submitError && (
                <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmitIssue} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-400">Your Name (optional)</label>
                  <input 
                    className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3.5 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                    value={reporterName} 
                    onChange={(e) => setReporterName(e.target.value)} 
                    placeholder="Anonymous" 
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-400">Describe the problem</label>
                  <textarea
                    className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3.5 text-sm text-white outline-none transition-all resize-y min-h-[100px] focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
                    rows="3"
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="e.g. The projector display is flickering and sometimes does not detect HDMI."
                    required
                  />
                </div>

                {!aiSuggestion && (
                  <button 
                    type="button" 
                    className="cursor-pointer w-full rounded-xl border border-dashed border-indigo-500/50 bg-indigo-500/5 p-3.5 text-sm font-semibold text-indigo-400 transition-colors hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed" 
                    onClick={handleGetAiSuggestion} 
                    disabled={aiLoading || complaint.trim().length < 5}
                  >
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

                {/* Form Buttons Container */}
                <div className="flex flex-col-reverse sm:flex-row justify-end gap-4 mt-4">
                  <button 
                    type="button" 
                    className="cursor-pointer w-full sm:w-auto rounded-xl border border-white/[0.08] px-6 py-3 text-sm font-medium text-gray-400 transition-colors hover:bg-white/[0.04] hover:text-white" 
                    onClick={() => setShowReportForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="cursor-pointer w-full sm:w-auto rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none" 
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Feedback Screen */}
        {submitted && (
          <motion.div 
            className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center shadow-lg"
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-bold text-emerald-400 mb-3">✓ Issue Reported</h3>
            <p className="text-sm sm:text-base text-gray-300">
              Your issue number is <strong className="text-white font-mono">{submitted.issueNumber}</strong>. Save this to track its status.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PublicAssetPage;
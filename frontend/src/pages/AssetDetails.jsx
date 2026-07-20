import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import QRDisplay from '../components/assets/QRDisplay';
import api from '../services/api';

const PRIORITY_STYLE = {
  low: 'bg-zinc-500/10 text-zinc-400',
  medium: 'bg-purple-500/10 text-purple-400',
  high: 'bg-amber-500/15 text-amber-500',
  critical: 'bg-rose-500/10 text-rose-500',
};

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [issues, setIssues] = useState([]);
  const [history, setHistory] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigningIssue, setAssigningIssue] = useState(null);

  const loadData = async () => {
    if (!id || id === 'undefined') {
      navigate('/admin');
      return;
    }

    setLoading(true);
    try {
      const [assetRes, issuesRes, historyRes, techRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/issues?assetId=${id}`),
        api.get(`/assets/${id}/history`),
        api.get(`/auth/technicians`),
      ]);
      setAsset(assetRes.data);
      setIssues(issuesRes.data);
      setHistory(historyRes.data);
      setTechnicians(techRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAssign = async (issueId, technicianId) => {
    if (!technicianId) return;
    await api.put(`/issues/${issueId}/assign`, { technicianId });
    setAssigningIssue(null);
    loadData();
  };

  const navItems = [{ key: 'back', label: '← Back to Assets', active: false, onClick: () => navigate('/admin') }];

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
        <Sidebar navItems={navItems} />
        <main className="flex-1 p-6 md:p-10">
          <div className="mx-auto max-w-7xl">
            <p className="text-gray-400 text-sm animate-pulse">Loading asset...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      <Sidebar navItems={navItems} />

      <main className="flex-1 p-6 md:p-10 relative overflow-hidden">
        {/* Background Glow Flare */}
        <div className="absolute top-[-100px] left-[-50px] w-[250px] h-[250px] bg-indigo-500/15 blur-[70px] rounded-full pointer-events-none z-0" />

        <div className="mx-auto max-w-7xl relative z-10">
          {/* Header */}
          <motion.div className="mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-sm font-bold tracking-wider text-indigo-400 font-mono">{asset.assetCode}</span>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1.5 mb-2">{asset.name}</h1>
            <p className="text-sm text-gray-400">{asset.category} · {asset.location} · {asset.status}</p>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 items-start">
            
            {/* Left Content Column */}
            <div className="flex flex-col gap-6">
              
              {/* Issues Section */}
              <section className="rounded-2xl border border-white/[0.08] bg-gray-900/60 p-6 md:p-7 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-5 flex items-center gap-2">Issues for this Asset</h3>
                {issues.length === 0 ? (
                  <p className="text-sm text-gray-500">No issues reported for this asset yet.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {issues.map((issue) => (
                      <div key={issue._id} className="grid grid-cols-1 sm:grid-cols-[2fr_auto_auto_auto] items-center gap-4 p-4 bg-gray-950/40 border border-transparent rounded-xl text-sm transition-all hover:border-white/[0.08] hover:translate-x-1">
                        <div>
                          <span className="text-xs font-bold text-indigo-400 font-mono block">{issue.issueNumber}</span>
                          <span className="text-white font-medium block mt-0.5">{issue.title}</span>
                        </div>
                        <span className={`text-[0.72rem] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider justify-self-start sm:justify-self-center ${PRIORITY_STYLE[issue.priority?.toLowerCase()] || 'bg-gray-800 text-gray-400'}`}>
                          {issue.priority}
                        </span>
                        <span className="text-gray-400 text-xs sm:text-sm">{issue.status}</span>
                        
                        {!issue.assignedTechnician && issue.status === 'Reported' ? (
                          assigningIssue === issue._id ? (
                            <select
                              autoFocus
                              className="rounded-lg border border-white/[0.08] bg-gray-900 px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                              onChange={(e) => handleAssign(issue._id, e.target.value)}
                              defaultValue=""
                            >
                              <option value="" disabled>Select technician</option>
                              {technicians.map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                              ))}
                            </select>
                          ) : (
                            <button
                              className="cursor-pointer rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 hover:-translate-y-0.5 transition-all"
                              onClick={() => setAssigningIssue(issue._id)}
                            >
                              Assign
                            </button>
                          )
                        ) : (
                          <span className="text-indigo-400 font-medium text-xs sm:text-sm">{issue.assignedTechnician?.name || '—'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* History Section */}
              <section className="rounded-2xl border border-white/[0.08] bg-gray-900/60 p-6 md:p-7 shadow-xl backdrop-blur-md">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">Asset History Timeline</h3>
                {history.length === 0 ? (
                  <p className="text-sm text-gray-500">No history recorded yet.</p>
                ) : (
                  <div className="flex flex-col">
                    {history.map((h, index) => (
                      <div key={h._id} className="flex gap-4 relative pb-6 group">
                        {/* Timeline Connector Line */}
                        {index !== history.length - 1 && (
                          <div className="absolute left-[5px] top-4 bottom-0 w-[2px] bg-white/[0.06]" />
                        )}
                        {/* Dot */}
                        <div className="w-3 h-3 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                        
                        {/* Timeline Item Content */}
                        <div className="flex-1">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-white font-semibold text-sm sm:text-base">{h.action}</span>
                            <span className="text-gray-500 text-xs">{new Date(h.createdAt).toLocaleString()}</span>
                          </div>
                          {h.details && <p className="text-gray-400 text-xs sm:text-sm mt-1.5 leading-relaxed">{h.details}</p>}
                          <span className="text-violet-400 text-xs font-medium block mt-1.5">by {h.actorName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Side Column (QR Code) */}
            <div className="w-full lg:sticky lg:top-10">
              <QRDisplay asset={asset} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetDetails;
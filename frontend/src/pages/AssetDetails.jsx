import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import QRDisplay from '../components/assets/QRDisplay';
import api from '../services/api';
import './AssetDetails.css';

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
      <div className="dashboard-layout">
        <Sidebar navItems={navItems} />
        <main className="dashboard-main"><div className="page-container"><p className="loading-text">Loading asset...</p></div></main>
      </div>
    );
  }

  if (!asset) return null;

  return (
    <div className="dashboard-layout">
      <Sidebar navItems={navItems} />

      <main className="dashboard-main">
        <div className="page-container">
          <motion.div className="details-header" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <div>
              <span className="details-code">{asset.assetCode}</span>
              <h1>{asset.name}</h1>
              <p className="dashboard-subtext">{asset.category} · {asset.location} · {asset.status}</p>
            </div>
          </motion.div>

          <div className="details-grid">
            <div className="details-main">
              <section className="details-section">
                <h3>Issues for this Asset</h3>
                {issues.length === 0 ? (
                  <p className="empty-text">No issues reported for this asset yet.</p>
                ) : (
                  <div className="issue-table">
                    {issues.map((issue) => (
                      <div key={issue._id} className="issue-row">
                        <div>
                          <span className="issue-row-number">{issue.issueNumber}</span>
                          <span className="issue-row-title">{issue.title}</span>
                        </div>
                        <span className={`priority-pill priority-${issue.priority?.toLowerCase()}`}>{issue.priority}</span>
                        <span className="issue-row-status">{issue.status}</span>
                        {!issue.assignedTechnician && issue.status === 'Reported' ? (
                          assigningIssue === issue._id ? (
                            <select autoFocus onChange={(e) => handleAssign(issue._id, e.target.value)} defaultValue="">
                              <option value="" disabled>Select technician</option>
                              {technicians.map((t) => (
                                <option key={t._id} value={t._id}>{t.name}</option>
                              ))}
                            </select>
                          ) : (
                            <button className="assign-btn" onClick={() => setAssigningIssue(issue._id)}>Assign</button>
                          )
                        ) : (
                          <span className="assigned-tech-name">{issue.assignedTechnician?.name || '—'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="details-section">
                <h3>Asset History Timeline</h3>
                {history.length === 0 ? (
                  <p className="empty-text">No history recorded yet.</p>
                ) : (
                  <div className="history-timeline">
                    {history.map((h) => (
                      <div key={h._id} className="history-item">
                        <div className="history-dot" />
                        <div className="history-content">
                          <div className="history-top">
                            <span className="history-action">{h.action}</span>
                            <span className="history-date">{new Date(h.createdAt).toLocaleString()}</span>
                          </div>
                          {h.details && <p className="history-details">{h.details}</p>}
                          <span className="history-actor">by {h.actorName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="details-side">
              <QRDisplay asset={asset} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AssetDetails;
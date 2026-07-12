import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import IssueCard from '../components/issues/IssueCard';
import MaintenanceForm from '../components/maintenance/MaintenanceForm';
import { fetchIssues, updateIssueStatus } from '../redux/issueSlice';
import './TechnicianDashboard.css';

const NEXT_STATUS_MAP = {
  Assigned: 'Inspection Started',
  'Inspection Started': 'Maintenance In Progress',
  'Maintenance In Progress': 'Resolved',
};

const TechnicianDashboard = () => {
  const dispatch = useDispatch();
  const { items: issues, loading } = useSelector((state) => state.issues);
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [tab, setTab] = useState('new');

  useEffect(() => {
    dispatch(fetchIssues({ assignedTechnician: userInfo?._id }));
  }, [dispatch, userInfo]);

  const myIssues = issues.filter((i) => i.assignedTechnician?._id === userInfo?._id || i.assignedTechnician === userInfo?._id);

  const statusGroups = {
    new: ['Reported', 'Assigned'],
    inProgress: ['Inspection Started', 'Maintenance In Progress', 'Waiting for Parts'],
    completed: ['Resolved', 'Closed']
  };

  const totalAssigned = myIssues.length;
  const totalInProgress = myIssues.filter(i => statusGroups.inProgress.includes(i.status)).length;
  const totalCompleted = myIssues.filter(i => statusGroups.completed.includes(i.status)).length;

  const displayIssues = myIssues.filter(i => statusGroups[tab].includes(i.status));

  const handleAdvance = async (issue) => {
    setActionError(null);
    const next = NEXT_STATUS_MAP[issue.status];
    if (!next) return;

    if (next === 'Resolved') {
      setSelectedIssue(issue);
      setShowMaintenanceForm(true);
      return;
    }

    const result = await dispatch(updateIssueStatus({ id: issue._id, status: next }));
    if (updateIssueStatus.rejected.match(result)) {
      setActionError(result.payload);
    }
  };

  const handleMaintenanceSaved = async () => {
    if (selectedIssue) {
      await dispatch(updateIssueStatus({ id: selectedIssue._id, status: 'Resolved' }));
      dispatch(fetchIssues({ assignedTechnician: userInfo?._id }));
    }
  };

  const navItems = [{ key: 'issues', label: 'My Issues', active: true, onClick: () => {} }];

  return (
    <div className="dashboard-layout">
      <Sidebar navItems={navItems} />

      <main className="dashboard-main">
        <div className="page-container">
          <div className="dashboard-header">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h1>My Assigned Work</h1>
              <p className="dashboard-subtext">Move each issue through inspection, repair, and resolution.</p>
            </motion.div>
          </div>

          {actionError && <div className="dash-error">{actionError}</div>}

          <div className="tech-summary-grid">
            <motion.div className="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <span className="summary-value">{totalAssigned}</span>
              <span className="summary-label">Total Assigned</span>
            </motion.div>
            <motion.div className="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <span className="summary-value">{totalInProgress}</span>
              <span className="summary-label">In Progress</span>
            </motion.div>
            <motion.div className="summary-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <span className="summary-value">{totalCompleted}</span>
              <span className="summary-label">Completed</span>
            </motion.div>
          </div>

          <div className="tech-tabs-container">
            <button className={`tech-tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>New</button>
            <button className={`tech-tab ${tab === 'inProgress' ? 'active' : ''}`} onClick={() => setTab('inProgress')}>In Progress</button>
            <button className={`tech-tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>Completed</button>
          </div>

          {loading ? (
            <p className="loading-text">Loading issues...</p>
          ) : displayIssues.length === 0 ? (
            <p className="empty-text">No issues found in this category.</p>
          ) : (
            <div className="tech-issue-list">
              {displayIssues.map((issue, i) => (
                <motion.div
                  key={issue._id}
                  className="tech-issue-row"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <IssueCard issue={issue} onClick={() => {}} />
                  {NEXT_STATUS_MAP[issue.status] && (
                    <button className="advance-btn" onClick={() => handleAdvance(issue)}>
                      Move to: {NEXT_STATUS_MAP[issue.status]}
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showMaintenanceForm && selectedIssue && (
        <MaintenanceForm
          issueId={selectedIssue._id}
          onClose={() => setShowMaintenanceForm(false)}
          onSaved={handleMaintenanceSaved}
        />
      )}
    </div>
  );
};

export default TechnicianDashboard;

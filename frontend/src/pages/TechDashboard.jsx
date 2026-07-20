import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import IssueCard from '../components/issues/IssueCard';
import MaintenanceForm from '../components/maintenance/MaintenanceForm';
import { fetchIssues, updateIssueStatus } from '../redux/issueSlice';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const NEXT_STATUS_MAP = {
  Assigned: 'Inspection Started',
  'Inspection Started': 'Maintenance In Progress',
  'Maintenance In Progress': 'Resolved',
};

const TechnicianDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: issues, loading: issuesLoading } = useSelector((state) => state.issues);
  const { userInfo } = useSelector((state) => state.auth);

  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showMaintenanceForm, setShowMaintenanceForm] = useState(false);
  const [actionError, setActionError] = useState(null);

  const [mainTab, setMainTab] = useState('dashboard');
  const [issueTab, setIssueTab] = useState('new');

  const [techHistory, setTechHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchIssues({ assignedTechnician: userInfo?._id }));
    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get('/assets/history/me');
        setTechHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch technician history", err);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, [dispatch, userInfo]);

  const myIssues = issues.filter((i) => i.assignedTechnician?._id === userInfo?._id || i.assignedTechnician === userInfo?._id);

  const statusGroups = {
    new: ['Reported', 'Assigned'],
    inProgress: ['Inspection Started', 'Maintenance In Progress', 'Waiting for Parts'],
    completed: ['Resolved', 'Closed']
  };

  const totalAssigned = myIssues.length;
  const totalNew = myIssues.filter(i => statusGroups.new.includes(i.status)).length;
  const totalInProgress = myIssues.filter(i => statusGroups.inProgress.includes(i.status)).length;
  const totalCompleted = myIssues.filter(i => statusGroups.completed.includes(i.status)).length;

  const displayIssues = myIssues.filter(i => statusGroups[issueTab].includes(i.status));

  const issuesByStatus = [
    { name: 'New', value: totalNew },
    { name: 'In Progress', value: totalInProgress },
    { name: 'Completed', value: totalCompleted },
  ].filter(i => i.value > 0);

  const issuesByPriority = [
    { name: 'Low', value: myIssues.filter((i) => i.priority === 'Low').length },
    { name: 'Medium', value: myIssues.filter((i) => i.priority === 'Medium').length },
    { name: 'High', value: myIssues.filter((i) => i.priority === 'High').length },
    { name: 'Critical', value: myIssues.filter((i) => i.priority === 'Critical').length },
  ].filter(i => i.value > 0);

  const ISSUE_STATUS_COLORS = {
    'New': '#6366f1',
    'In Progress': '#6366f1',
    'Completed': '#6366f1'
  };

  const PRIORITY_COLORS = {
    'Low': '#6366f1',
    'Medium': '#6366f1',
    'High': '#6366f1',
    'Critical': '#6366f1'
  };

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
      const res = await api.get('/assets/history/me');
      setTechHistory(res.data);
    }
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', active: mainTab === 'dashboard', onClick: () => setMainTab('dashboard') },
    { key: 'issues', label: 'My Issues', active: mainTab === 'issues', onClick: () => setMainTab('issues') },
    { key: 'history', label: 'History', active: mainTab === 'history', onClick: () => setMainTab('history') },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gray-950 text-white">
      <Sidebar navItems={navItems} />

      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="border-b border-white/[0.06] pb-5">
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">Technician Workspace</h1>
              <p className="text-sm text-gray-400 mt-1">Manage your assignments, track your progress, and view your activity history.</p>
            </motion.div>
          </div>

          {/* Action Error Box */}
          {actionError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300 flex items-center gap-2.5">
              <span>⚠️</span> {actionError}
            </div>
          )}

          {/* Main Dashboard Tab */}
          {mainTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Summary Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <motion.div className="bg-gray-900 border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-2 shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                  <span className="text-4xl font-black font-display text-indigo-400 line-height-none">{totalAssigned}</span>
                  <span className="text-sm font-medium text-gray-300">Total Assigned</span>
                </motion.div>
                <motion.div className="bg-gray-900 border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-2 shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <span className="text-4xl font-black font-display text-indigo-400 line-height-none">{totalInProgress}</span>
                  <span className="text-sm font-medium text-gray-300">In Progress</span>
                </motion.div>
                <motion.div className="bg-gray-900 border border-white/[0.06] rounded-2xl p-6 flex flex-col gap-2 shadow-lg transition-all hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-indigo-500/5" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <span className="text-4xl font-black font-display text-indigo-400 line-height-none">{totalCompleted}</span>
                  <span className="text-sm font-medium text-gray-300">Completed</span>
                </motion.div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Workload Breakdown Chart */}
                <div className="bg-gray-900 p-5 rounded-2xl border border-white/[0.06]">
                  <h3 className="text-base font-semibold mb-4 text-white">Workload Breakdown</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={issuesByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {issuesByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ISSUE_STATUS_COLORS[entry.name] || '#6366f1'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Issues by Priority Chart */}
                <div className="bg-gray-900 p-5 rounded-2xl border border-white/[0.06]">
                  <h3 className="text-base font-semibold mb-4 text-white">Issues by Priority</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer>
                      <BarChart data={issuesByPriority}>
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} allowDecimals={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.03)' }} contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                          {issuesByPriority.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#6366f1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Activity Mini Log */}
              <div className="bg-gray-900 p-5 rounded-2xl border border-white/[0.06]">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-semibold text-white">Your Recent Activity</h3>
                  <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors" onClick={() => setMainTab('history')}>View All</button>
                </div>
                <div className="flex flex-col">
                  {historyLoading ? (
                    <p className="text-sm text-gray-500 py-4">Loading...</p>
                  ) : techHistory.slice(0, 5).map(h => (
                    <div key={h._id} className="flex justify-between items-center py-3.5 border-b border-white/[0.06] last:border-0">
                      <div>
                        <h4 className="text-sm font-medium text-white">{h.action}</h4>
                        {h.asset && <p className="text-xs text-gray-400 mt-0.5">{h.asset.name}</p>}
                      </div>
                      <span className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                  {techHistory.length === 0 && !historyLoading && <p className="text-sm text-gray-500 py-4">No recent activity.</p>}
                </div>
              </div>
            </div>
          )}

          {/* Issues Operational List Tab */}
          {mainTab === 'issues' && (
            <div className="space-y-5">
              <div className="flex gap-3 border-b border-white/[0.06] pb-3">
                <button className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${issueTab === 'new' ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'}`} onClick={() => setIssueTab('new')}>New</button>
                <button className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${issueTab === 'inProgress' ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'}`} onClick={() => setIssueTab('inProgress')}>In Progress</button>
                <button className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${issueTab === 'completed' ? 'bg-indigo-500/10 text-indigo-400' : 'text-gray-400 hover:bg-white/[0.04] hover:text-white'}`} onClick={() => setIssueTab('completed')}>Completed</button>
              </div>

              {issuesLoading ? (
                <p className="text-sm text-gray-500">Loading issues...</p>
              ) : displayIssues.length === 0 ? (
                <p className="text-sm text-gray-500">No issues found in this category.</p>
              ) : (
                <div className="flex flex-col gap-4 relative z-10">
                  {displayIssues.map((issue, i) => (
                    <motion.div
                      key={issue._id}
                      className="flex flex-col sm:flex-row items-stretch gap-4"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="flex-1">
                        <IssueCard issue={issue} onClick={() => { }} />
                      </div>
                      {NEXT_STATUS_MAP[issue.status] && (
                        <button className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm px-6 py-4 sm:py-0 rounded-2xl whitespace-nowrap shadow-lg shadow-indigo-500/10 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/20 active:translate-y-0" onClick={() => handleAdvance(issue)}>
                          Move to: {NEXT_STATUS_MAP[issue.status]}
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* History Timeline Tab */}
          {mainTab === 'history' && (
            <div className="bg-gray-900 p-6 rounded-2xl border border-white/[0.06]">
              <h2 className="text-lg font-bold text-white">Your Activity History</h2>
              <p className="text-sm text-gray-400 mt-1 mb-6">A complete timeline of all maintenance and actions you have performed.</p>

              {historyLoading ? (
                <p className="text-sm text-gray-500">Loading history...</p>
              ) : techHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No history recorded yet.</p>
              ) : (
                <div className="relative pl-5 border-l-2 border-white/[0.08] space-y-6">
                  {techHistory.map((h) => (
                    <div key={h._id} className="relative">
                      {/* Timeline Node Bullet */}
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-gray-900" />

                      <div className="bg-gray-950 p-4 rounded-xl border border-white/[0.06]">
                        <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                          <div>
                            <span className="font-semibold text-white block text-sm sm:text-base">{h.action}</span>
                            {h.asset && (
                              <span className="text-xs text-indigo-400 font-medium mt-0.5 block">
                                {h.asset.name} ({h.asset.assetCode})
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{new Date(h.createdAt).toLocaleString()}</span>
                        </div>
                        {h.details && <p className="text-sm text-gray-400 leading-relaxed mt-2">{h.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Conditional Modal Overlay Form */}
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

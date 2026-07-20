import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import AssetCard from '../components/assets/AssetCard';
import IssueCard from '../components/issues/IssueCard';
import AssetForm from '../components/assets/AssetForm';
import TechnicianForm from '../components/team/TechnicianForm';
import { fetchAssets, deleteAsset } from '../redux/assetSlice';
import { fetchIssues } from '../redux/issueSlice';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: assets, loading: assetsLoading } = useSelector((state) => state.assets);
  const { items: issues, loading: issuesLoading } = useSelector((state) => state.issues);

  const [tab, setTab] = useState('dashboard');
  const [assetFormState, setAssetFormState] = useState({ isOpen: false, data: null });
  const [showTechForm, setShowTechForm] = useState(false);
  const [search, setSearch] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [techLoading, setTechLoading] = useState(false);
  const [globalHistory, setGlobalHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAssets());
    dispatch(fetchIssues());

    const fetchTechs = async () => {
      setTechLoading(true);
      try {
        const res = await api.get('/auth/technicians');
        setTechnicians(res.data);
      } catch (err) {
        console.error("Failed to fetch technicians:", err);
      } finally {
        setTechLoading(false);
      }
    };

    const fetchGlobalHistory = async () => {
      setHistoryLoading(true);
      try {
        const res = await api.get('/assets/history/all');
        setGlobalHistory(res.data);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchTechs();
    fetchGlobalHistory();
  }, [dispatch]);

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditAsset = (asset) => {
    setAssetFormState({ isOpen: true, data: asset });
  };

  const handleDeleteAsset = (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      dispatch(deleteAsset(id));
    }
  };

  const handleAddTechnician = (newTech) => {
    setTechnicians([newTech, ...technicians]);
  };

  const handleDeleteTech = async (id) => {
    if (window.confirm('Are you sure you want to delete this technician?')) {
      try {
        await api.delete(`/auth/technician/${id}`);
        setTechnicians(technicians.filter((t) => t._id !== id));
      } catch (err) {
        alert('Failed to delete technician');
      }
    }
  };

  const handleToggleTechStatus = async (id) => {
    try {
      const res = await api.put(`/auth/technician/${id}/status`);
      setTechnicians(technicians.map((t) => t._id === id ? { ...t, isActive: res.data.isActive } : t));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const summaryCards = [
    { label: 'Total Assets', value: assets.length },
    { label: 'Operational', value: assets.filter((a) => a.status === 'Operational').length },
    { label: 'Open Issues', value: issues.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length },
    { label: 'Critical', value: issues.filter((i) => i.priority === 'Critical').length },
  ];

  const overviewStats = [
    { name: 'Operational', value: assets.filter((a) => a.status === 'Operational').length },
    { name: 'Open Issues', value: issues.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length },
    { name: 'Critical', value: issues.filter((i) => i.priority === 'Critical').length },
  ].filter(i => i.value > 0);

  const issuesByPriority = [
    { name: 'Low', value: issues.filter((i) => i.priority === 'Low').length },
    { name: 'Medium', value: issues.filter((i) => i.priority === 'Medium').length },
    { name: 'High', value: issues.filter((i) => i.priority === 'High').length },
    { name: 'Critical', value: issues.filter((i) => i.priority === 'Critical').length },
  ].filter(i => i.value > 0);

  const OVERVIEW_COLORS = {
    'Operational': '#6366f1',
    'Open Issues': '#6366f1',
    'Critical': '#6366f1'
  };

  const PRIORITY_COLORS = {
    'Low': '#6366f1',
    'Medium': '#6366f1',
    'High': '#6366f1',
    'Critical': '#6366f1'
  };
 
  const navItems = [
    { key: 'dashboard', label: 'Dashboard', active: tab === 'dashboard', onClick: () => setTab('dashboard') },
    { key: 'assets', label: 'Assets', active: tab === 'assets', onClick: () => setTab('assets') },
    { key: 'issues', label: 'Issues', active: tab === 'issues', onClick: () => setTab('issues') },
    { key: 'history', label: 'History', active: tab === 'history', onClick: () => setTab('history') },
    { key: 'team', label: 'Team', active: tab === 'team', onClick: () => setTab('team') },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 font-sans text-gray-100">
      <Sidebar navItems={navItems} />

      <main className="flex-1 overflow-x-hidden px-6 py-10 md:px-12">
        <div className="max-w-[1400px] mx-auto w-full">

          {/* Header */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 relative"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">Full visibility into every asset and issue.</p>
            </div>
            {tab === 'assets' && (
              <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setAssetFormState({ isOpen: true, data: null })}>
                + Register Asset
              </button>
            )}
            {tab === 'team' && (
              <button className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all hover:-translate-y-0.5 cursor-pointer" onClick={() => setShowTechForm(true)}>
                + Add Technician
              </button>
            )}
          </motion.div>

          {/* Tab: Dashboard */}
          {tab === 'dashboard' && (
            <div className="flex flex-col gap-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col gap-2 shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="text-4xl font-extrabold text-indigo-500 leading-none">{card.value}</span>
                    <span className="text-gray-300 text-sm font-medium tracking-wide">{card.label}</span>
                  </motion.div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-white mb-6">System Overview</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={overviewStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {overviewStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={OVERVIEW_COLORS[entry.name] || '#6366f1'} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-semibold text-white mb-6">Issues by Priority</h3>
                  <div className="w-full h-[250px]">
                    <ResponsiveContainer>
                      <BarChart data={issuesByPriority}>
                        <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} tickLine={false} />
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

              {/* Recent Sections */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Assets */}
                <div className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Assets</h3>
                    <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all cursor-pointer" onClick={() => setTab('assets')}>View All</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {assets.slice(0, 3).map(asset => (
                      <div key={asset._id} className="flex justify-between items-center p-4 border border-white/[0.06] rounded-xl bg-gray-950/40 hover:bg-gray-950/70 hover:border-indigo-500/30 transition-all hover:translate-x-1.5 cursor-pointer" onClick={() => navigate(`/admin/asset/${asset._id}`)}>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{asset.name}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{asset.assetCode}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider ${asset.status === 'Operational' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>{asset.status}</span>
                      </div>
                    ))}
                    {assets.length === 0 && <p className="text-center text-gray-500 py-8 border border-dashed border-white/10 rounded-xl">No assets found.</p>}
                  </div>
                </div>

                {/* Recent Issues */}
                <div className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-white">Recent Issues</h3>
                    <button className="text-indigo-400 hover:text-indigo-300 font-semibold text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-500/10 transition-all cursor-pointer" onClick={() => setTab('issues')}>View All</button>
                  </div>
                  <div className="flex flex-col gap-3">
                    {issues.slice(0, 3).map(issue => (
                      <div key={issue._id} className="flex justify-between items-center p-4 border border-white/[0.06] rounded-xl bg-gray-950/40 hover:bg-gray-950/70 hover:border-indigo-500/30 transition-all hover:translate-x-1.5 cursor-pointer" onClick={() => { if (issue.asset?._id) navigate(`/admin/asset/${issue.asset._id}`) }}>
                        <div>
                          <h4 className="text-sm font-semibold text-white">{issue.title}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{issue.asset?.name || 'Unknown Asset'}</p>
                        </div>
                        <span className={`text-xs px-2.5 py-1 rounded-md font-medium uppercase tracking-wider ${issue.priority === 'Critical' || issue.priority === 'High' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>{issue.priority}</span>
                      </div>
                    ))}
                    {issues.length === 0 && <p className="text-center text-gray-500 py-8 border border-dashed border-white/10 rounded-xl">No issues reported.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Assets */}
          {tab === 'assets' && (
            <>
              <input
                className="w-full max-w-[480px] px-5 py-3.5 rounded-xl border border-white/[0.08] bg-gray-900/60 text-white placeholder-gray-500 text-sm outline-none mb-8 focus:border-indigo-500 focus:bg-gray-900 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-md"
                placeholder="Search assets by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {assetsLoading ? (
                <p className="text-center text-gray-400 py-16 border border-dashed border-white/10 rounded-2xl bg-gray-900/40">Loading assets...</p>
              ) : filteredAssets.length === 0 ? (
                <p className="text-center text-gray-400 py-16 border border-dashed border-white/10 rounded-2xl bg-gray-900/40">No assets found. Register your first asset to get started.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAssets.map((asset, i) => (
                    <AssetCard key={asset._id} asset={asset} index={i} onEdit={handleEditAsset} onDelete={handleDeleteAsset} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: Issues */}
          {tab === 'issues' && (
            <>
              {issuesLoading ? (
                <p className="text-center text-gray-400 py-16 border border-dashed border-white/10 rounded-2xl bg-gray-900/40">Loading issues...</p>
              ) : issues.length === 0 ? (
                <p className="text-center text-gray-400 py-16 border border-dashed border-white/10 rounded-2xl bg-gray-900/40">No issues reported yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {issues.map((issue, i) => (
                    <IssueCard
                      key={issue._id}
                      issue={issue}
                      index={i}
                      onClick={() => {
                        if (issue.asset?._id) {
                          navigate(`/admin/asset/${issue.asset._id}`);
                        }
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: Team */}
          {tab === 'team' && (
            <>
              {techLoading ? (
                <p className="text-center text-gray-400 py-16 border border-dashed border-white/10 rounded-2xl bg-gray-900/40">Loading technicians...</p>
              ) : technicians.length === 0 ? (
                <p className="text-center text-gray-400 py-16 border border-dashed border-white/10 rounded-2xl bg-gray-900/40">No technicians found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {technicians.map((tech, i) => (
                    <motion.div
                      key={tech._id}
                      className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between shadow-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div>
                        <h3 className={`text-base font-bold text-white ${tech.isActive === false ? 'line-through opacity-50' : ''}`}>{tech.name}</h3>
                        <div className="flex flex-col gap-1 mt-2">
                          <p className="text-sm text-gray-400 break-all">{tech.email}</p>
                          <span className={`self-start text-xs font-semibold px-2.5 py-0.5 mt-2 rounded-md ${tech.isActive === false ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'}`}>
                            {tech.isActive === false ? 'Inactive' : 'Technician'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6 pt-4 border-t border-white/[0.06]">
                        <button
                          className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium py-2 rounded-lg border border-white/5 cursor-pointer transition-colors"
                          onClick={(e) => { e.stopPropagation(); handleToggleTechStatus(tech._id); }}
                        >
                          {tech.isActive === false ? 'Activate' : 'Deactivate'}
                        </button>
                        <button
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 rounded-lg cursor-pointer transition-colors shadow-md shadow-rose-600/10"
                          onClick={(e) => { e.stopPropagation(); handleDeleteTech(tech._id); }}
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tab: History */}
          {tab === 'history' && (
            <div className="bg-gray-900/70 backdrop-blur-md border border-white/[0.08] rounded-2xl p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-1">Global Asset History</h2>
              <p className="text-gray-400 text-sm mb-6">A complete timeline of all activities across every asset.</p>
              {historyLoading ? (
                <p className="text-center text-gray-400 py-12 border border-dashed border-white/10 rounded-xl bg-gray-950/20">Loading history...</p>
              ) : globalHistory.length === 0 ? (
                <p className="text-center text-gray-400 py-12 border border-dashed border-white/10 rounded-xl bg-gray-950/20">No history recorded yet.</p>
              ) : (
                <div className="relative pl-6 border-l-2 border-white/[0.08] flex flex-col gap-6">
                  {globalHistory.map((h) => (
                    <div key={h._id} className="relative group">
                      <div className="absolute -left-[33px] top-1.5 w-3.5 height h-3.5 rounded-full bg-indigo-500 border-4 border-gray-950 group-hover:scale-110 transition-transform" />
                      <div className="bg-gray-950/40 backdrop-blur-sm p-4 rounded-xl border border-white/[0.06] flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div className="flex-1">
                          <span className="font-semibold text-white block text-sm sm:text-base">{h.action}</span>
                          {h.asset && (
                            <span className="text-xs sm:text-sm text-indigo-400 hover:underline cursor-pointer mt-0.5 inline-block" onClick={() => navigate(`/admin/asset/${h.asset._id}`)}>
                              {h.asset.name} ({h.asset.assetCode})
                            </span>
                          )}
                          {h.details && <p className="text-xs sm:text-sm text-gray-400 mt-2 line-clamp-3 leading-relaxed">{h.details}</p>}
                          <span className="text-xs text-gray-500 mt-2 block">by {h.actorName}</span>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap self-end sm:self-start">{new Date(h.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {assetFormState.isOpen && (
        <AssetForm
          onClose={() => setAssetFormState({ isOpen: false, data: null })}
          initialData={assetFormState.data}
        />
      )}

      {showTechForm && (
        <TechnicianForm
          onClose={() => setShowTechForm(false)}
          onSuccess={handleAddTechnician}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

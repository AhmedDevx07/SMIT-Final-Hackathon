import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Sidebar from '../components/layout/Sidebar';
import AssetCard from '../components/assets/AssetCard';
import IssueCard from '../components/issues/IssueCard';
import AssetForm from '../components/assets/AssetForm';
import { fetchAssets } from '../redux/assetSlice';
import { fetchIssues } from '../redux/issueSlice';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: assets, loading: assetsLoading } = useSelector((state) => state.assets);
  const { items: issues, loading: issuesLoading } = useSelector((state) => state.issues);

  const [tab, setTab] = useState('dashboard');
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [search, setSearch] = useState('');
  const [technicians, setTechnicians] = useState([]);
  const [techLoading, setTechLoading] = useState(false);

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
    fetchTechs();
  }, [dispatch]);

  const filteredAssets = assets.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.assetCode.toLowerCase().includes(search.toLowerCase())
  );

  const summaryCards = [
    { label: 'Total Assets', value: assets.length },
    { label: 'Operational', value: assets.filter((a) => a.status === 'Operational').length },
    { label: 'Open Issues', value: issues.filter((i) => !['Resolved', 'Closed'].includes(i.status)).length },
    { label: 'Critical', value: issues.filter((i) => i.priority === 'Critical').length },
  ];

  const assetsByStatus = [
    { name: 'Operational', value: assets.filter((a) => a.status === 'Operational').length },
    { name: 'Maintenance', value: assets.filter((a) => a.status === 'Under Maintenance').length },
    { name: 'Decommissioned', value: assets.filter((a) => a.status === 'Decommissioned').length },
  ].filter(i => i.value > 0);

  const issuesByPriority = [
    { name: 'Low', value: issues.filter((i) => i.priority === 'Low').length },
    { name: 'Medium', value: issues.filter((i) => i.priority === 'Medium').length },
    { name: 'High', value: issues.filter((i) => i.priority === 'High').length },
    { name: 'Critical', value: issues.filter((i) => i.priority === 'Critical').length },
  ].filter(i => i.value > 0);

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#6366f1'];

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', active: tab === 'dashboard', onClick: () => setTab('dashboard') },
    { key: 'assets', label: 'Assets', active: tab === 'assets', onClick: () => setTab('assets') },
    { key: 'issues', label: 'Issues', active: tab === 'issues', onClick: () => setTab('issues') },
    { key: 'team', label: 'Team', active: tab === 'team', onClick: () => setTab('team') },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar navItems={navItems} />

      <main className="dashboard-main">
        <div className="page-container">
          <motion.div
            className="dashboard-header"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1>Admin Dashboard</h1>
              <p className="dashboard-subtext">Full visibility into every asset and issue.</p>
            </div>
            {tab === 'assets' && (
              <button className="btn-primary" onClick={() => setShowAssetForm(true)}>
                + Register Asset
              </button>
            )}
          </motion.div>

          {tab === 'dashboard' && (
            <div className="dashboard-content-wrapper">
              <div className="summary-grid">
                {summaryCards.map((card, i) => (
                  <motion.div
                    key={card.label}
                    className="summary-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className="summary-value">{card.value}</span>
                    <span className="summary-label">{card.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="dashboard-charts">
                <div className="chart-card">
                  <h3>Assets by Status</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={assetsByStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {assetsByStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Issues by Priority</h3>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer>
                      <BarChart data={issuesByPriority}>
                        <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} />
                        <YAxis stroke="var(--color-muted)" fontSize={12} allowDecimals={false} />
                        <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '8px' }} />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="dashboard-recent">
                <div className="recent-section">
                  <div className="recent-header">
                    <h3>Recent Assets</h3>
                    <button className="btn-text" onClick={() => setTab('assets')}>View All</button>
                  </div>
                  <div className="recent-list">
                    {assets.slice(0, 3).map(asset => (
                      <div key={asset._id} className="recent-item" onClick={() => navigate(`/admin/asset/${asset._id}`)}>
                        <div className="recent-info">
                          <h4>{asset.name}</h4>
                          <p>{asset.assetCode}</p>
                        </div>
                        <span className={`asset-status tag-${asset.status.toLowerCase().replace(' ', '-')}`}>{asset.status}</span>
                      </div>
                    ))}
                    {assets.length === 0 && <p className="empty-text" style={{padding: '20px'}}>No assets found.</p>}
                  </div>
                </div>

                <div className="recent-section">
                  <div className="recent-header">
                    <h3>Recent Issues</h3>
                    <button className="btn-text" onClick={() => setTab('issues')}>View All</button>
                  </div>
                  <div className="recent-list">
                    {issues.slice(0, 3).map(issue => (
                      <div key={issue._id} className="recent-item" onClick={() => { if(issue.asset?._id) navigate(`/admin/asset/${issue.asset._id}`) }}>
                        <div className="recent-info">
                          <h4>{issue.title}</h4>
                          <p>{issue.asset?.name || 'Unknown Asset'}</p>
                        </div>
                        <span className={`issue-priority priority-${issue.priority.toLowerCase()}`}>{issue.priority}</span>
                      </div>
                    ))}
                    {issues.length === 0 && <p className="empty-text" style={{padding: '20px'}}>No issues reported.</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'assets' && (
            <>
              <input
                className="search-input"
                placeholder="Search assets by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {assetsLoading ? (
                <p className="loading-text">Loading assets...</p>
              ) : filteredAssets.length === 0 ? (
                <p className="empty-text">No assets found. Register your first asset to get started.</p>
              ) : (
                <div className="asset-grid">
                  {filteredAssets.map((asset, i) => (
                    <AssetCard key={asset._id} asset={asset} index={i} />
                  ))}
                </div>
              )}
            </>
          )}

          {tab === 'issues' && (
            <>
              {issuesLoading ? (
                <p className="loading-text">Loading issues...</p>
              ) : issues.length === 0 ? (
                <p className="empty-text">No issues reported yet.</p>
              ) : (
                <div className="issue-grid">
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

          {tab === 'team' && (
            <>
              {techLoading ? (
                <p className="loading-text">Loading technicians...</p>
              ) : technicians.length === 0 ? (
                <p className="empty-text">No technicians found.</p>
              ) : (
                <div className="asset-grid">
                  {technicians.map((tech, i) => (
                    <motion.div
                      key={tech._id}
                      className="asset-card"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <h3 className="asset-name">{tech.name}</h3>
                      <div className="asset-meta">
                        <p style={{ color: 'var(--text-secondary)' }}>{tech.email}</p>
                        <span className="asset-status tag-operational">Technician</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showAssetForm && <AssetForm onClose={() => setShowAssetForm(false)} />}
    </div>
  );
};

export default AdminDashboard;

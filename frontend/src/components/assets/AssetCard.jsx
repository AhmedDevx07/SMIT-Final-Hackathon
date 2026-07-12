import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import './AssetCard.css';

const STATUS_COLORS = {
  Operational: 'status-ok',
  'Issue Reported': 'status-warn',
  'Under Inspection': 'status-warn',
  'Under Maintenance': 'status-warn',
  'Out of Service': 'status-danger',
  Retired: 'status-muted',
};

const AssetCard = ({ asset, index = 0 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="asset-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/admin/asset/${asset._id}`)}
    >
      <div className="asset-card-top">
        <span className="asset-code">{asset.assetCode}</span>
        <span className={`status-pill ${STATUS_COLORS[asset.status] || 'status-muted'}`}>
          {asset.status}
        </span>
      </div>

      <h3 className="asset-name">{asset.name}</h3>
      <p className="asset-meta">{asset.category} · {asset.location}</p>

      <div className="asset-card-bottom">
        <span className="asset-condition">Condition: {asset.condition}</span>
        {asset.assignedTechnician && (
          <span className="asset-tech">🔧 {asset.assignedTechnician.name}</span>
        )}
      </div>
    </motion.div>
  );
};

export default AssetCard;
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS = {
  Operational: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  'Issue Reported': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Under Inspection': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Under Maintenance': 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  'Out of Service': 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  Retired: 'bg-gray-500/10 text-gray-400 border border-gray-500/20',
};

const AssetCard = ({ asset, index = 0, onEdit, onDelete }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      className="flex cursor-pointer flex-col rounded-2xl border border-white/[0.08] bg-gray-900/70 p-6 shadow-xl backdrop-blur-md transition-colors hover:border-indigo-500/40 hover:shadow-indigo-500/10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      onClick={() => navigate(`/admin/asset/${asset._id}`)}
    >
      {/* Top Meta */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[0.8rem] font-bold tracking-wider text-indigo-400 font-mono">
          {asset.assetCode}
        </span>
        <span className={`text-[0.7rem] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${STATUS_COLORS[asset.status] || STATUS_COLORS.Retired}`}>
          {asset.status}
        </span>
      </div>

      {/* Info */}
      <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
      <p className="text-gray-400 text-sm mb-4">
        {asset.category} <span className="text-gray-600 mx-1">·</span> {asset.location}
      </p>

      {/* Bottom Status */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/[0.06] pt-3">
        <span>Condition: <span className="text-gray-200 font-medium">{asset.condition}</span></span>
        {asset.assignedTechnician && (
          <span className="text-purple-400 font-medium flex items-center gap-1">
            🔧 {asset.assignedTechnician.name}
          </span>
        )}
      </div>

      {/* Actions */}
      {(onEdit || onDelete) && (
        <div className="flex gap-2 mt-4 pt-3 border-t border-white/[0.06]">
          {onEdit && (
            <button
              className="flex-1 cursor-pointer rounded-lg border border-white/[0.08] bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium py-2 transition-colors"
              onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
            >
              Update
            </button>
          )}
          {onDelete && (
            <button
              className="flex-1 cursor-pointer rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold py-2 transition-colors shadow-md shadow-rose-600/10"
              onClick={(e) => { e.stopPropagation(); onDelete(asset._id); }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default AssetCard;
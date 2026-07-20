import { motion } from 'framer-motion';

const PRIORITY_CLASS = {
  Low: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  Medium: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  High: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  Critical: 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/20',
};

const STATUS_CLASS = {
  'Open': 'text-sky-400 bg-sky-500/10 border border-sky-500/10',
  'In Progress': 'text-amber-400 bg-amber-500/10 border border-amber-500/10',
  'Resolved': 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10',
};

const IssueCard = ({ issue, index = 0, onClick }) => {
  return (
    <motion.div
      className={`flex cursor-pointer flex-col rounded-2xl p-6 shadow-xl backdrop-blur-md transition-all duration-200 hover:border-indigo-500/40 hover:shadow-indigo-500/10 ${
        issue.priority === 'Critical'
          ? 'border border-rose-500/30 bg-gradient-to-b from-rose-500/5 to-gray-900/90'
          : 'border border-white/5 bg-gray-900/70'
      }`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -3 }}
      onClick={onClick}
    >
      {/* Top Header Section */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold tracking-wider text-indigo-400 font-mono">
          {issue.issueNumber}
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${PRIORITY_CLASS[issue.priority] || PRIORITY_CLASS.Medium}`}>
          {issue.priority}
        </span>
      </div>

      {/* Main Asset Information */}
      <h4 className="text-base font-bold text-white mb-1 tracking-tight line-clamp-1">{issue.title}</h4>
      <p className="text-gray-400 text-xs mb-4 flex items-center gap-1.5">
        <span className="truncate">{issue.asset?.name}</span>
        <span className="text-gray-700 font-bold">·</span>
        <span className="text-gray-500 font-mono text-[11px] shrink-0">{issue.asset?.assetCode}</span>
      </p>

      {/* Bottom Status Panel */}
      <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3 mt-auto">
        <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide ${STATUS_CLASS[issue.status] || 'bg-gray-800 text-gray-300'}`}>
          {issue.status}
        </span>
        
        {issue.assignedTechnician && (
          <span className="text-indigo-400 font-medium text-[11px] flex items-center gap-1 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded-md">
            <span className="text-[10px]">🔧</span> {issue.assignedTechnician.name}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default IssueCard;
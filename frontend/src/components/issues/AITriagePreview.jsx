import { motion } from 'framer-motion';

const AITriagePreview = ({ suggestion, editedValues, onEdit }) => {
  if (!suggestion) return null;

  // Safe priority mapping checking backward compatibility
  const currentPriority = editedValues.priority || editedValues.suggestedPriority || 'Medium';
  const isCritical = currentPriority === 'Critical';

  return (
    <motion.div
      className="relative mt-5 rounded-2xl border border-white/[0.08] bg-gradient-to-b from-indigo-500/[0.05] to-transparent p-6 overflow-hidden"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      {/* Top Accent Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 to-transparent" />

      {/* Header Info */}
      <div className="flex flex-wrap justify-between items-center gap-2 mb-5">
        <span className="text-indigo-400 font-bold text-sm sm:text-base flex items-center gap-2">✦ AI Suggestion</span>
        <span className="text-gray-400 text-xs">Review and edit before submitting</span>
      </div>

      {/* Safety Critical Alert */}
      {isCritical && (
        <div className="mb-5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-sm text-rose-300 leading-relaxed">
          ⚠️ This may be a safety-critical issue. Please review the checks below carefully.
        </div>
      )}

      {/* Editable Title Input */}
      <div className="flex flex-col gap-2 mb-4">
        <label className="text-xs sm:text-sm font-medium text-white">Title</label>
        <input
          className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
          value={editedValues.title || editedValues.suggestedTitle || ''}
          onChange={(e) => onEdit(editedValues.suggestedTitle ? 'suggestedTitle' : 'title', e.target.value)}
        />
      </div>

      {/* Grid Inputs for Category and Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-white">Category</label>
          <input
            className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
            value={editedValues.category || editedValues.suggestedCategory || ''}
            onChange={(e) => onEdit(editedValues.suggestedCategory ? 'suggestedCategory' : 'category', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs sm:text-sm font-medium text-white">Priority</label>
          <select 
            className="w-full rounded-xl border border-white/[0.08] bg-gray-950 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500 focus:ring-3 focus:ring-indigo-500/20"
            value={currentPriority} 
            onChange={(e) => onEdit(editedValues.suggestedPriority ? 'suggestedPriority' : 'priority', e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
      </div>

      {/* Possible Causes List Block */}
      {suggestion.possibleCauses?.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-xs sm:text-sm font-medium text-white">Possible Causes</label>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {suggestion.possibleCauses.map((cause, i) => (
              <li key={i} className="text-gray-300 text-sm p-3 bg-gray-950/40 rounded-xl border-l-[3px] border-l-indigo-500">
                {cause}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Initial Checks List Block */}
      {suggestion.initialChecks?.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-xs sm:text-sm font-medium text-white">Safe Initial Checks</label>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {suggestion.initialChecks.map((check, i) => (
              <li key={i} className="text-gray-300 text-sm p-3 bg-gray-950/40 rounded-xl border-l-[3px] border-l-indigo-500">
                {check}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recurring Issue Alert */}
      {suggestion.recurringWarning && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-400 leading-relaxed">
          🔁 {suggestion.recurringWarning}
        </div>
      )}

      {/* Fallback Warning Box */}
      {!suggestion.aiAvailable && (
        <p className="text-xs text-gray-500 italic mt-2.5">
          AI suggestion service was unavailable — these fields are placeholders. Please fill them in yourself.
        </p>
      )}
    </motion.div>
  );
};

export default AITriagePreview;
import { motion } from 'framer-motion';
import './AITriagePreview.css';

const AITriagePreview = ({ suggestion, editedValues, onEdit }) => {
  if (!suggestion) return null;

  const isCritical = editedValues.priority === 'Critical';

  return (
    <motion.div
      className="ai-preview"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{ duration: 0.3 }}
    >
      <div className="ai-preview-header">
        <span className="ai-badge">✦ AI Suggestion</span>
        <span className="ai-note">Review and edit before submitting</span>
      </div>

      {isCritical && (
        <div className="ai-safety-warning">
          ⚠️ This may be a safety-critical issue. Please review the checks below carefully.
        </div>
      )}

      <div className="ai-field">
        <label>Title</label>
        <input
          value={editedValues.title}
          onChange={(e) => onEdit('title', e.target.value)}
        />
      </div>

      <div className="ai-field-row">
        <div className="ai-field">
          <label>Category</label>
          <input
            value={editedValues.category}
            onChange={(e) => onEdit('category', e.target.value)}
          />
        </div>
        <div className="ai-field">
          <label>Priority</label>
          <select value={editedValues.priority} onChange={(e) => onEdit('priority', e.target.value)}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>
        </div>
      </div>

      {suggestion.possibleCauses?.length > 0 && (
        <div className="ai-list-block">
          <label>Possible Causes</label>
          <ul>
            {suggestion.possibleCauses.map((cause, i) => (
              <li key={i}>{cause}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestion.initialChecks?.length > 0 && (
        <div className="ai-list-block">
          <label>Safe Initial Checks</label>
          <ul>
            {suggestion.initialChecks.map((check, i) => (
              <li key={i}>{check}</li>
            ))}
          </ul>
        </div>
      )}

      {suggestion.recurringWarning && (
        <div className="ai-recurring-warning">
          🔁 {suggestion.recurringWarning}
        </div>
      )}

      {!suggestion.aiAvailable && (
        <p className="ai-fallback-note">
          AI suggestion service was unavailable — these fields are placeholders. Please fill them in yourself.
        </p>
      )}
    </motion.div>
  );
};

export default AITriagePreview;
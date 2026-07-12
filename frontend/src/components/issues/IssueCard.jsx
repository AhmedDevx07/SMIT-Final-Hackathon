import { motion } from 'framer-motion';
import './IssueCard.css';

const PRIORITY_CLASS = {
  Low: 'priority-low',
  Medium: 'priority-medium',
  High: 'priority-high',
  Critical: 'priority-critical',
};

const IssueCard = ({ issue, index = 0, onClick }) => {
  return (
    <motion.div
      className={`issue-card ${issue.priority === 'Critical' ? 'issue-critical' : ''}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
    >
      <div className="issue-card-top">
        <span className="issue-number">{issue.issueNumber}</span>
        <span className={`priority-pill ${PRIORITY_CLASS[issue.priority]}`}>{issue.priority}</span>
      </div>

      <h4 className="issue-title">{issue.title}</h4>
      <p className="issue-asset">{issue.asset?.name} · {issue.asset?.assetCode}</p>

      <div className="issue-card-bottom">
        <span className="issue-status">{issue.status}</span>
        {issue.assignedTechnician && <span className="issue-tech">🔧 {issue.assignedTechnician.name}</span>}
      </div>
    </motion.div>
  );
};

export default IssueCard;
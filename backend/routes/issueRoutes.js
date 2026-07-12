const express = require('express');
const router = express.Router();
const {
  reportIssuePublic,
  getIssues,
  getIssueById,
  assignIssue,
  updateIssueStatus,
  markCritical,
  trackPublicIssue,
} = require('../controllers/issueController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes
router.post('/public', reportIssuePublic);
router.get('/public/track/:issueNumber', trackPublicIssue);

// Internal routes
router.get('/', protect, getIssues);
router.get('/:id', protect, getIssueById);
router.put('/:id/assign', protect, authorize('admin'), assignIssue);
router.put('/:id/status', protect, updateIssueStatus);
router.put('/:id/mark-critical', protect, markCritical);

module.exports = router;

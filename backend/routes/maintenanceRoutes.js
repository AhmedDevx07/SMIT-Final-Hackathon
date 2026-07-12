const express = require('express');
const router = express.Router();
const {
  createMaintenanceLog,
  getLogsByIssue,
  getLogsByAsset,
} = require('../controllers/maintenanceControllers');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('technician', 'admin'), createMaintenanceLog);
router.get('/issue/:issueId', protect, getLogsByIssue);
router.get('/asset/:assetId', protect, getLogsByAsset);

module.exports = router;
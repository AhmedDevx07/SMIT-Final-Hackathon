const express = require('express');
const router = express.Router();
const {
  createAsset,
  getAssets,
  getAssetById,
  getPublicAsset,
  updateAsset,
  retireAsset,
  getAssetHistory,
  deleteAsset,
  getAllAssetHistory,
  getTechnicianHistory,
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route MUST be declared before /:id to avoid route collision
router.get('/public/:assetCode', getPublicAsset);
router.get('/history/all', protect, authorize('admin'), getAllAssetHistory);
router.get('/history/me', protect, authorize('technician'), getTechnicianHistory);

router.post('/', protect, authorize('admin'), createAsset);
router.get('/', protect, getAssets);
router.get('/:id', protect, getAssetById);
router.put('/:id', protect, authorize('admin'), updateAsset);
router.delete('/:id', protect, authorize('admin'), deleteAsset);
router.put('/:id/retire', protect, authorize('admin'), retireAsset);
router.get('/:id/history', protect, getAssetHistory);

module.exports = router;

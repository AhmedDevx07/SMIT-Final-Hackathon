const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getTechnicians, createTechnician, deleteTechnician, toggleTechnicianStatus } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/technicians', protect, authorize('admin'), getTechnicians);
router.post('/technician', protect, authorize('admin'), createTechnician);
router.delete('/technician/:id', protect, authorize('admin'), deleteTechnician);
router.put('/technician/:id/status', protect, authorize('admin'), toggleTechnicianStatus);

module.exports = router;

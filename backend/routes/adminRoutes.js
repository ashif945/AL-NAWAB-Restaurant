const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStaffList,
  createStaff,
  updateStaff,
  getRestaurantSettings,
  updateRestaurantSettings,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/settings', getRestaurantSettings);

router.use(protect);
router.get('/dashboard', authorize('ADMIN', 'MANAGER'), getDashboardStats);
router.get('/staff', authorize('ADMIN'), getStaffList);
router.post('/staff', authorize('ADMIN'), createStaff);
router.put('/staff/:id', authorize('ADMIN'), updateStaff);
router.put('/settings', authorize('ADMIN'), updateRestaurantSettings);

module.exports = router;

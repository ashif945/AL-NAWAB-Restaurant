const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getCategories,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', getMenuItems);
router.get('/categories', getCategories);
router.get('/:id', getMenuItemById);

// Admin / Staff Routes
router.post('/', protect, authorize('ADMIN', 'MANAGER'), createMenuItem);
router.put('/:id', protect, authorize('ADMIN', 'MANAGER'), updateMenuItem);
router.patch('/:id/availability', protect, authorize('ADMIN', 'MANAGER', 'CHEF'), toggleAvailability);
router.delete('/:id', protect, authorize('ADMIN'), deleteMenuItem);

module.exports = router;

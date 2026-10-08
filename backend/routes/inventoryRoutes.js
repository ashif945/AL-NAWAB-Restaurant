const express = require('express');
const router = express.Router();
const {
  getInventory,
  addInventoryItem,
  updateStock,
  deleteInventoryItem,
} = require('../controllers/inventoryController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.use(protect);
router.get('/', authorize('ADMIN', 'MANAGER', 'CHEF'), getInventory);
router.post('/', authorize('ADMIN', 'MANAGER'), addInventoryItem);
router.patch('/:id/stock', authorize('ADMIN', 'MANAGER', 'CHEF'), updateStock);
router.delete('/:id', authorize('ADMIN'), deleteInventoryItem);

module.exports = router;

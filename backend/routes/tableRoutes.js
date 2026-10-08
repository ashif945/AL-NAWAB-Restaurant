const express = require('express');
const router = express.Router();
const {
  getTables,
  getTableByNumber,
  generateTableQR,
  createTable,
  updateTableStatus,
  deleteTable,
} = require('../controllers/tableController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

router.get('/', getTables);
router.get('/number/:tableNumber', getTableByNumber);
router.get('/:id/qr', generateTableQR);

router.post('/', protect, authorize('ADMIN', 'MANAGER'), createTable);
router.patch('/:id/status', protect, authorize('ADMIN', 'MANAGER', 'WAITER'), updateTableStatus);
router.delete('/:id', protect, authorize('ADMIN'), deleteTable);

module.exports = router;

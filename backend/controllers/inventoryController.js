const InventoryItem = require('../models/InventoryItem');

// @desc    Get all inventory items
// @route   GET /api/inventory
// @access  Private (ADMIN/MANAGER/CHEF)
const getInventory = async (req, res, next) => {
  try {
    const items = await InventoryItem.find().sort({ name: 1 }).populate('linkedMenuItem', 'name price');
    res.json({
      success: true,
      count: items.length,
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add inventory item
// @route   POST /api/inventory
// @access  Private (ADMIN/MANAGER)
const addInventoryItem = async (req, res, next) => {
  try {
    const item = await InventoryItem.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Inventory item added',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update stock quantity
// @route   PATCH /api/inventory/:id/stock
// @access  Private (ADMIN/MANAGER/CHEF)
const updateStock = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    item.quantity = Number(quantity);
    await item.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      item,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private (ADMIN)
const deleteInventoryItem = async (req, res, next) => {
  try {
    await InventoryItem.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Inventory item removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInventory,
  addInventoryItem,
  updateStock,
  deleteInventoryItem,
};

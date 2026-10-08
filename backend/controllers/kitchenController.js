const Order = require('../models/Order');
const { emitOrderUpdate } = require('../config/socket');

// @desc    Get active orders for Kitchen Display System (KDS)
// @route   GET /api/kitchen/active-orders
// @access  Private (CHEF/ADMIN/MANAGER)
const getKitchenOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({
      status: { $in: ['ORDER_PLACED', 'CONFIRMED', 'PREPARING'] },
    })
      .sort({ createdAt: 1 })
      .populate('items.menuItem', 'name preparationTime category isVeg');

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Advance kitchen order status (CONFIRMED -> PREPARING -> READY)
// @route   PATCH /api/kitchen/orders/:id/advance
// @access  Private (CHEF/ADMIN/MANAGER)
const advanceKitchenOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    let nextStatus = 'PREPARING';
    if (order.status === 'ORDER_PLACED' || order.status === 'CONFIRMED') {
      nextStatus = 'PREPARING';
    } else if (order.status === 'PREPARING') {
      nextStatus = 'READY';
    } else if (order.status === 'READY') {
      nextStatus = order.orderType === 'DELIVERY' ? 'OUT_FOR_DELIVERY' : 'COMPLETED';
    }

    order.status = nextStatus;
    order.statusHistory.push({
      status: nextStatus,
      timestamp: new Date(),
      note: `Kitchen advanced status to ${nextStatus}`,
      updatedBy: req.user ? `${req.user.name} (Kitchen)` : 'Kitchen Station',
    });

    await order.save();
    emitOrderUpdate(order._id, order);

    res.json({
      success: true,
      message: `Order transitioned to ${nextStatus}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getKitchenOrders,
  advanceKitchenOrder,
};

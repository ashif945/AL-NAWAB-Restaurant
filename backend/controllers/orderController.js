const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Table = require('../models/Table');
const LoyaltyTransaction = require('../models/LoyaltyTransaction');
const { emitNewOrder, emitOrderUpdate } = require('../config/socket');

// Generate unique royal order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `ALN-${dateStr}-${randomSuffix}`;
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (Optional auth for guests)
const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      customerDetails,
      orderType,
      deliveryAddress,
      deliveryInstructions,
      pickupTime,
      tableNumber,
      paymentMethod,
      couponCode,
      useLoyaltyPoints,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one menu item.',
      });
    }

    if (!customerDetails || !customerDetails.name || !customerDetails.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.',
      });
    }

    // 1. Fetch restaurant settings for taxes and delivery fees
    const restaurant = (await Restaurant.findOne()) || {
      taxRatePercent: 5,
      deliveryFee: 40,
      minOrderForFreeDelivery: 500,
      loyaltyPointsPer100Rupees: 10,
    };

    // 2. Validate all items & calculate verified server-side subtotal
    const verifiedItems = [];
    let serverSubtotal = 0;

    for (const itemRequest of items) {
      let menuItem;
      if (itemRequest.menuItemId && itemRequest.menuItemId.match(/^[0-9a-fA-F]{24}$/)) {
        menuItem = await MenuItem.findById(itemRequest.menuItemId);
      } else if (itemRequest.id) {
        menuItem = await MenuItem.findOne({ legacyId: itemRequest.id });
      } else if (itemRequest.name) {
        menuItem = await MenuItem.findOne({ name: itemRequest.name });
      }

      if (!menuItem) {
        return res.status(400).json({
          success: false,
          message: `Dish "${itemRequest.name || 'Unknown'}" is not available in our royal menu.`,
        });
      }

      if (!menuItem.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Dish "${menuItem.name}" is currently sold out. Please remove it to proceed.`,
        });
      }

      const qty = Math.max(1, parseInt(itemRequest.quantity, 10) || 1);
      const itemSubtotal = menuItem.price * qty;
      serverSubtotal += itemSubtotal;

      verifiedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: qty,
        specialInstructions: itemRequest.specialInstructions || '',
        isVeg: menuItem.isVeg,
      });
    }

    // 3. Process Coupon Discount if provided
    let discountAmount = 0;
    let appliedCoupon = null;

    if (couponCode && couponCode.trim() !== '') {
      appliedCoupon = await Coupon.findOne({
        code: couponCode.trim().toUpperCase(),
        isActive: true,
        validUntil: { $gte: new Date() },
      });

      if (appliedCoupon) {
        if (serverSubtotal >= (appliedCoupon.minOrderAmount || 0)) {
          if (appliedCoupon.discountType === 'PERCENTAGE') {
            discountAmount = (serverSubtotal * appliedCoupon.discountValue) / 100;
            if (appliedCoupon.maxDiscountAmount) {
              discountAmount = Math.min(discountAmount, appliedCoupon.maxDiscountAmount);
            }
          } else {
            discountAmount = appliedCoupon.discountValue;
          }
          discountAmount = Math.min(discountAmount, serverSubtotal);
        }
      }
    }

    // 4. Process Loyalty Points
    let pointsUsed = 0;
    let userDoc = null;
    if (req.user) {
      userDoc = await User.findById(req.user.id);
      if (useLoyaltyPoints && userDoc && userDoc.loyaltyPoints > 0) {
        const maxRedeemable = Math.min(userDoc.loyaltyPoints, serverSubtotal - discountAmount);
        pointsUsed = maxRedeemable;
        discountAmount += pointsUsed;
      }
    }

    // 5. Calculate Delivery Fee
    let deliveryFee = 0;
    if (orderType === 'DELIVERY') {
      if (serverSubtotal < (restaurant.minOrderForFreeDelivery || 500)) {
        deliveryFee = restaurant.deliveryFee || 40;
      }
    }

    // 6. Calculate Tax (5% GST on net subtotal)
    const netAmountBeforeTax = Math.max(0, serverSubtotal - discountAmount);
    const taxRate = (restaurant.taxRatePercent || 5) / 100;
    const tax = Math.round(netAmountBeforeTax * taxRate);

    // 7. Calculate Grand Total
    const grandTotal = Math.max(0, netAmountBeforeTax + tax + deliveryFee);

    // 8. Loyalty Points to Earn (10 points per ₹100 spent)
    const pointsToEarn = Math.floor((grandTotal / 100) * (restaurant.loyaltyPointsPer100Rupees || 10));

    // 9. Table linking for DINE_IN
    let tableDoc = null;
    if (orderType === 'DINE_IN' && tableNumber) {
      tableDoc = await Table.findOne({ tableNumber: tableNumber.trim() });
    }

    const orderNumber = generateOrderNumber();

    const order = new Order({
      orderNumber,
      customer: req.user ? req.user.id : undefined,
      customerDetails: {
        name: customerDetails.name.trim(),
        phone: customerDetails.phone.trim(),
        email: customerDetails.email ? customerDetails.email.trim() : (req.user ? req.user.email : ''),
      },
      orderType: orderType || 'DELIVERY',
      items: verifiedItems,
      subtotal: serverSubtotal,
      discount: discountAmount,
      tax,
      deliveryFee,
      total: grandTotal,
      couponCode: appliedCoupon ? appliedCoupon.code : '',
      loyaltyPointsUsed: pointsUsed,
      loyaltyPointsEarned: pointsToEarn,
      status: 'ORDER_PLACED',
      paymentStatus: paymentMethod === 'ONLINE' ? 'PENDING' : 'PAID',
      paymentMethod: paymentMethod || 'UPI',
      deliveryAddress: deliveryAddress || '',
      deliveryInstructions: deliveryInstructions || '',
      pickupTime: pickupTime || '',
      tableNumber: tableNumber || '',
      table: tableDoc ? tableDoc._id : undefined,
      statusHistory: [
        {
          status: 'ORDER_PLACED',
          timestamp: new Date(),
          note: 'Order placed by customer',
          updatedBy: req.user ? req.user.name : 'Customer',
        },
      ],
    });

    await order.save();

    // Update coupon usage count
    if (appliedCoupon) {
      appliedCoupon.usedCount = (appliedCoupon.usedCount || 0) + 1;
      await appliedCoupon.save();
    }

    // Deduct used loyalty points & log transaction
    if (userDoc && pointsUsed > 0) {
      userDoc.loyaltyPoints -= pointsUsed;
      await userDoc.save();
      await LoyaltyTransaction.create({
        user: userDoc._id,
        order: order._id,
        points: -pointsUsed,
        type: 'REDEEMED',
        description: `Redeemed ${pointsUsed} points on order ${orderNumber}`,
        balanceAfter: userDoc.loyaltyPoints,
      });
    }

    // Update Table status if Dine-In
    if (tableDoc) {
      tableDoc.status = 'OCCUPIED';
      tableDoc.currentOrderId = order._id;
      await tableDoc.save();
    }

    // Emit Real-time Socket.IO update
    emitNewOrder(order);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Your royal feast is underway.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('items.menuItem', 'name price image isVeg');

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order by ID or orderNumber
// @route   GET /api/orders/:id
// @access  Public (so customer can track with Order ID)
const getOrderById = async (req, res, next) => {
  try {
    let order;
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(req.params.id).populate('items.menuItem', 'name price image isVeg');
    } else {
      order = await Order.findOne({ orderNumber: req.params.id }).populate('items.menuItem', 'name price image isVeg');
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found with provided ID or tracking number.',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (ADMIN/MANAGER/CHEF/WAITER/DELIVERY_STAFF)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user ? `${req.user.name} (${req.user.role})` : 'Staff',
    });

    // If marked DELIVERED or COMPLETED, credit loyalty points to customer
    if (status === 'DELIVERED' || status === 'COMPLETED') {
      order.paymentStatus = 'PAID';

      if (order.customer && order.loyaltyPointsEarned > 0) {
        const customer = await User.findById(order.customer);
        if (customer) {
          customer.loyaltyPoints += order.loyaltyPointsEarned;
          await customer.save();

          await LoyaltyTransaction.create({
            user: customer._id,
            order: order._id,
            points: order.loyaltyPointsEarned,
            type: 'EARNED',
            description: `Earned ${order.loyaltyPointsEarned} points for order ${order.orderNumber}`,
            balanceAfter: customer.loyaltyPoints,
          });
        }
      }

      // If dine in, free up table
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, {
          status: 'CLEANING',
          currentOrderId: null,
        });
      }
    }

    await order.save();

    // Real-time socket broadcast
    emitOrderUpdate(order._id, order);

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   POST /api/orders/:id/cancel
// @access  Public / Private
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only allow cancellation if order is not already PREPARING, READY, or OUT_FOR_DELIVERY
    const nonCancellableStages = ['PREPARING', 'READY', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];
    if (nonCancellableStages.includes(order.status) && (!req.user || req.user.role === 'CUSTOMER')) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it reaches the "${order.status}" stage. Please contact restaurant directly.`,
      });
    }

    order.status = 'CANCELLED';
    order.cancellationReason = reason || 'Cancelled by user/staff';
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: `Order cancelled: ${order.cancellationReason}`,
      updatedBy: req.user ? req.user.name : 'Customer',
    });

    await order.save();

    // Release table if occupied
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, {
        status: 'AVAILABLE',
        currentOrderId: null,
      });
    }

    emitOrderUpdate(order._id, order);

    res.json({
      success: true,
      message: 'Order has been cancelled.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for Admin/Staff
// @route   GET /api/orders
// @access  Private (ADMIN/MANAGER/CHEF/WAITER/DELIVERY_STAFF)
const getAllOrders = async (req, res, next) => {
  try {
    const { status, orderType, search, limit = 50, page = 1 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }
    if (orderType && orderType !== 'ALL') {
      query.orderType = orderType;
    }
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerDetails.name': { $regex: search, $options: 'i' } },
        { 'customerDetails.phone': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('items.menuItem', 'name price image isVeg');

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
};

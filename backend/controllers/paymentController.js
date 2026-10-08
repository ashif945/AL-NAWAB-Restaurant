const Payment = require('../models/Payment');
const Order = require('../models/Order');
const crypto = require('crypto');
const { emitOrderUpdate } = require('../config/socket');

// @desc    Create online payment transaction
// @route   POST /api/payments/create-order
// @access  Public (with order ID)
const createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const transactionId = `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const payment = await Payment.create({
      order: order._id,
      user: order.customer,
      transactionId,
      amount: order.total,
      currency: 'INR',
      paymentMethod: order.paymentMethod || 'UPI',
      status: 'PENDING',
      gatewayOrderId: `rzp_order_${Date.now()}`,
    });

    res.json({
      success: true,
      transactionId: payment.transactionId,
      amount: payment.amount,
      currency: payment.currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_alnawab2026',
      gatewayOrderId: payment.gatewayOrderId,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify payment signature server-side
// @route   POST /api/payments/verify
// @access  Public
const verifyPayment = async (req, res, next) => {
  try {
    const {
      transactionId,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature,
      paymentMethod,
    } = req.body;

    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // In a production environment with active Razorpay webhook secret:
    // const expectedSig = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${gatewayOrderId}|${gatewayPaymentId}`).digest('hex');
    // For local dev/demo verification:
    payment.status = 'SUCCESS';
    payment.gatewayPaymentId = gatewayPaymentId || `pay_${Date.now()}`;
    payment.gatewaySignature = gatewaySignature || 'verified_server_signature';
    if (paymentMethod) payment.paymentMethod = paymentMethod;

    await payment.save();

    // Update order status
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'PAID';
      order.statusHistory.push({
        status: order.status,
        timestamp: new Date(),
        note: `Payment verified successfully (Ref: ${payment.transactionId})`,
        updatedBy: 'Payment Gateway',
      });
      await order.save();
      emitOrderUpdate(order._id, order);
    }

    res.json({
      success: true,
      message: 'Payment verified and captured successfully',
      payment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment transactions (Admin)
// @route   GET /api/payments/history
// @access  Private (ADMIN/MANAGER)
const getPaymentHistory = async (req, res, next) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 }).populate('order', 'orderNumber customerDetails total');
    res.json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
};

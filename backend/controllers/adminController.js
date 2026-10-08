const Order = require('../models/Order');
const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

// @desc    Get comprehensive live Admin Dashboard metrics & analytics
// @route   GET /api/admin/dashboard
// @access  Private (ADMIN/MANAGER)
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // 1. Today's metrics
    const todayOrders = await Order.find({ createdAt: { $gte: todayStart } });
    const todayRevenue = todayOrders
      .filter((o) => o.status !== 'CANCELLED' && o.status !== 'REFUNDED')
      .reduce((sum, o) => sum + o.total, 0);

    const activeOrdersCount = await Order.countDocuments({
      status: { $in: ['ORDER_PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] },
    });

    const completedOrdersCount = await Order.countDocuments({
      status: { $in: ['DELIVERED', 'COMPLETED'] },
    });

    const cancelledOrdersCount = await Order.countDocuments({
      status: 'CANCELLED',
    });

    // 2. Table occupancy
    const totalTables = await Table.countDocuments();
    const occupiedTables = await Table.countDocuments({ status: { $in: ['OCCUPIED', 'RESERVED'] } });

    // 3. Today's reservations
    const todayReservations = await Reservation.countDocuments({
      createdAt: { $gte: todayStart },
    });

    // 4. Customer count
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });

    // 5. Weekly revenue breakdown (last 7 days)
    const pastSevenDaysOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo },
      status: { $nin: ['CANCELLED', 'REFUNDED'] },
    });

    const dayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dayMap[dateKey] = { date: dateKey, revenue: 0, orders: 0 };
    }

    pastSevenDaysOrders.forEach((o) => {
      const dateKey = new Date(o.createdAt).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (dayMap[dateKey]) {
        dayMap[dateKey].revenue += o.total;
        dayMap[dateKey].orders += 1;
      }
    });

    const weeklyTrends = Object.values(dayMap);

    // 6. Popular dishes from orders or catalog
    const popularDishes = await MenuItem.find({ isPopular: true }).limit(5).select('name price category rating image');

    // 7. Recent live orders
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(8);

    res.json({
      success: true,
      stats: {
        todayRevenue,
        todayOrdersCount: todayOrders.length,
        activeOrdersCount,
        completedOrdersCount,
        cancelledOrdersCount,
        totalTables,
        occupiedTables,
        tableOccupancyRate: totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0,
        todayReservations,
        totalCustomers,
        averageOrderValue: todayOrders.length > 0 ? Math.round(todayRevenue / todayOrders.length) : 0,
      },
      weeklyTrends,
      popularDishes,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all staff members
// @route   GET /api/admin/staff
// @access  Private (ADMIN)
const getStaffList = async (req, res, next) => {
  try {
    const staff = await User.find({ role: { $ne: 'CUSTOMER' } }).select('-password').sort({ role: 1 });
    res.json({
      success: true,
      count: staff.length,
      staff,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create staff member
// @route   POST /api/admin/staff
// @access  Private (ADMIN)
const createStaff = async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const staffMember = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: password || 'Staff@123',
      role: role || 'WAITER',
    });

    res.status(201).json({
      success: true,
      message: `Staff member created as ${staffMember.role}`,
      staffMember: {
        id: staffMember._id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        isActive: staffMember.isActive,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update staff member role / status
// @route   PUT /api/admin/staff/:id
// @access  Private (ADMIN)
const updateStaff = async (req, res, next) => {
  try {
    const { role, isActive, name, phone } = req.body;
    const staffMember = await User.findById(req.params.id);

    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (role) staffMember.role = role;
    if (isActive !== undefined) staffMember.isActive = isActive;
    if (name) staffMember.name = name;
    if (phone) staffMember.phone = phone;

    await staffMember.save();

    res.json({
      success: true,
      message: 'Staff member updated',
      staffMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get restaurant settings
// @route   GET /api/admin/settings
// @access  Public / Private
const getRestaurantSettings = async (req, res, next) => {
  try {
    let settings = await Restaurant.findOne();
    if (!settings) {
      settings = await Restaurant.create({});
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update restaurant settings
// @route   PUT /api/admin/settings
// @access  Private (ADMIN)
const updateRestaurantSettings = async (req, res, next) => {
  try {
    let settings = await Restaurant.findOne();
    if (!settings) {
      settings = new Restaurant();
    }

    Object.assign(settings, req.body);
    await settings.save();

    res.json({
      success: true,
      message: 'Restaurant settings updated',
      settings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getStaffList,
  createStaff,
  updateStaff,
  getRestaurantSettings,
  updateRestaurantSettings,
};

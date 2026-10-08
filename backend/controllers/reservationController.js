const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { emitReservationUpdate } = require('../config/socket');

// @desc    Create a new table reservation
// @route   POST /api/reservations
// @access  Public
const createReservation = async (req, res, next) => {
  try {
    const { name, phone, email, date, time, guests, occasion, specialRequests } = req.body;

    if (!name || !phone || !date || !time || !guests) {
      return res.status(400).json({
        success: false,
        message: 'Missing required reservation fields (name, phone, date, time, guests)',
      });
    }

    const guestCountNumber = parseInt(guests, 10) || 2;

    // Check if duplicate reservation in same slot
    const existing = await Reservation.findOne({
      phone,
      date,
      time,
      status: { $in: ['CONFIRMED', 'PENDING'] },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active table reservation for this date and time slot.',
      });
    }

    // Auto-assign suitable table if available
    let assignedTable = null;
    const availableTables = await Table.find({
      capacity: { $gte: guestCountNumber },
      status: 'AVAILABLE',
    }).sort({ capacity: 1 });

    if (availableTables.length > 0) {
      assignedTable = availableTables[0];
    }

    const reservation = await Reservation.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : (req.user ? req.user.email : ''),
      date,
      time,
      guests: String(guests),
      guestCountNumber,
      occasion: occasion || '',
      specialRequests: specialRequests || '',
      tableNumber: assignedTable ? assignedTable.tableNumber : '',
      table: assignedTable ? assignedTable._id : undefined,
      user: req.user ? req.user.id : undefined,
      status: 'CONFIRMED',
    });

    if (assignedTable) {
      assignedTable.status = 'RESERVED';
      assignedTable.activeReservationId = reservation._id;
      await assignedTable.save();
    }

    emitReservationUpdate(reservation);

    res.status(201).json({
      success: true,
      message: `Reservation confirmed successfully for ${guests} guests on ${date} at ${time}! We look forward to hosting your royal feast.`,
      reservationId: reservation._id,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's reservations
// @route   GET /api/reservations/my-reservations
// @access  Private
const getMyReservations = async (req, res, next) => {
  try {
    const reservations = await Reservation.find({
      $or: [{ user: req.user.id }, { phone: req.user.phone }],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reservations (Admin)
// @route   GET /api/reservations
// @access  Public / Private (Admin)
const getAllReservations = async (req, res, next) => {
  try {
    const { date, status } = req.query;
    const query = {};

    if (date) query.date = date;
    if (status && status !== 'ALL') query.status = status;

    const reservations = await Reservation.find(query).sort({ date: -1, time: 1 });

    res.json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update reservation status (Admin/Staff)
// @route   PATCH /api/reservations/:id/status
// @access  Private (ADMIN/MANAGER/WAITER)
const updateReservationStatus = async (req, res, next) => {
  try {
    const { status, tableNumber, adminNotes } = req.body;
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    if (status) reservation.status = status;
    if (tableNumber) reservation.tableNumber = tableNumber;
    if (adminNotes !== undefined) reservation.adminNotes = adminNotes;

    // Handle table freeing
    if (status === 'COMPLETED' || status === 'CANCELLED') {
      if (reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, {
          status: 'AVAILABLE',
          activeReservationId: null,
        });
      }
    } else if (status === 'ARRIVED') {
      if (reservation.table) {
        await Table.findByIdAndUpdate(reservation.table, {
          status: 'OCCUPIED',
        });
      }
    }

    await reservation.save();
    emitReservationUpdate(reservation);

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel reservation
// @route   DELETE /api/reservations/:id
// @access  Public / Private
const cancelReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    reservation.status = 'CANCELLED';
    await reservation.save();

    if (reservation.table) {
      await Table.findByIdAndUpdate(reservation.table, {
        status: 'AVAILABLE',
        activeReservationId: null,
      });
    }

    emitReservationUpdate(reservation);

    res.json({
      success: true,
      message: 'Reservation has been cancelled.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
};

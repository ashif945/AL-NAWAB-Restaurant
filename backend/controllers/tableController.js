const Table = require('../models/Table');
const QRCode = require('qrcode');
const { emitTableUpdate } = require('../config/socket');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public (for viewing/waitlist) / Private
const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 }).populate('currentOrderId activeReservationId');
    res.json({
      success: true,
      count: tables.length,
      tables,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single table by tableNumber (for QR landing)
// @route   GET /api/tables/:tableNumber
// @access  Public
const getTableByNumber = async (req, res, next) => {
  try {
    const table = await Table.findOne({ tableNumber: req.params.tableNumber })
      .populate('currentOrderId')
      .populate('activeReservationId');

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found',
      });
    }

    res.json({
      success: true,
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate QR code for Table
// @route   GET /api/tables/:id/qr
// @access  Public
const generateTableQR = async (req, res, next) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const dineInUrl = `${frontendUrl}/menu?table=${table.tableNumber}`;

    const qrDataUrl = await QRCode.toDataURL(dineInUrl, {
      width: 400,
      margin: 2,
      color: {
        dark: '#4f3d36',
        light: '#fff7f0',
      },
    });

    table.qrCodeUrl = qrDataUrl;
    await table.save();

    res.json({
      success: true,
      tableNumber: table.tableNumber,
      dineInUrl,
      qrDataUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create table (Admin)
// @route   POST /api/tables
// @access  Private (ADMIN/MANAGER)
const createTable = async (req, res, next) => {
  try {
    const { tableNumber, capacity, section } = req.body;

    const exists = await Table.findOne({ tableNumber });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: `Table "${tableNumber}" already exists`,
      });
    }

    const table = await Table.create({
      tableNumber,
      capacity: Number(capacity) || 4,
      section: section || 'Main Hall',
    });

    // Generate initial QR code
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const dineInUrl = `${frontendUrl}/menu?table=${table.tableNumber}`;
    const qrDataUrl = await QRCode.toDataURL(dineInUrl, {
      width: 400,
      margin: 2,
      color: { dark: '#4f3d36', light: '#fff7f0' },
    });

    table.qrCodeUrl = qrDataUrl;
    await table.save();

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update table status
// @route   PATCH /api/tables/:id/status
// @access  Private (ADMIN/MANAGER/WAITER)
const updateTableStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const table = await Table.findById(req.params.id);

    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    table.status = status;
    if (status === 'AVAILABLE') {
      table.currentOrderId = null;
      table.activeReservationId = null;
    }

    await table.save();
    emitTableUpdate(table);

    res.json({
      success: true,
      message: `Table ${table.tableNumber} status changed to ${status}`,
      table,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private (ADMIN)
const deleteTable = async (req, res, next) => {
  try {
    const table = await Table.findByIdAndDelete(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    res.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTables,
  getTableByNumber,
  generateTableQR,
  createTable,
  updateTableStatus,
  deleteTable,
};

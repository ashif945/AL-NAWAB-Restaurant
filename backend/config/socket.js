const { Server } = require('socket.io');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Join order tracking room
    socket.on('join_order', (orderId) => {
      socket.join(`order_${orderId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined order_${orderId}`);
    });

    // Staff joining specific channel (admin, kitchen, waiter)
    socket.on('join_staff_room', (role) => {
      socket.join(`staff_${role.toLowerCase()}`);
      console.log(`[Socket.IO] Staff ${socket.id} joined room staff_${role.toLowerCase()}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    console.warn('[Socket.IO] io has not been initialized yet');
  }
  return io;
};

// Notification helper
const emitOrderUpdate = (orderId, orderData) => {
  if (io) {
    io.to(`order_${orderId}`).emit('order_status_updated', orderData);
    io.emit('kitchen_orders_updated', orderData);
    io.emit('admin_order_notification', orderData);
  }
};

const emitNewOrder = (orderData) => {
  if (io) {
    io.emit('new_incoming_order', orderData);
    io.emit('kitchen_orders_updated', orderData);
    io.emit('admin_order_notification', orderData);
  }
};

const emitTableUpdate = (tableData) => {
  if (io) {
    io.emit('table_status_updated', tableData);
  }
};

const emitReservationUpdate = (reservationData) => {
  if (io) {
    io.emit('reservation_updated', reservationData);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitOrderUpdate,
  emitNewOrder,
  emitTableUpdate,
  emitReservationUpdate,
};

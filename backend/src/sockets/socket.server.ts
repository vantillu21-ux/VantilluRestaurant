import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from '../config/env';

let io: SocketIOServer | null = null;

export const initSocketIO = (httpServer: HttpServer): SocketIOServer => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CLIENT_URL || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected: ${socket.id}`);

    // Join Kitchen / Admin rooms
    socket.on('join:kitchen', () => {
      socket.join('kitchen');
      console.log(`👨‍🍳 Socket ${socket.id} joined room 'kitchen'`);
    });

    socket.on('join:admin', () => {
      socket.join('admin');
      console.log(`👨‍💼 Socket ${socket.id} joined room 'admin'`);
    });

    socket.on('join:customer', (customerId: string) => {
      if (customerId) {
        socket.join(`customer_${customerId}`);
        console.log(`👤 Socket ${socket.id} joined room 'customer_${customerId}'`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io has not been initialized.');
  }
  return io;
};

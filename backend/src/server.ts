import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketIO } from './sockets/socket.server';
import { prisma } from './config/prisma';

const server = http.createServer(app);

// Initialize WebSockets
initSocketIO(server);

const PORT = env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
  🚀 VANTILLU Restaurant Production Backend API Running!
  ----------------------------------------------------
  📡 HTTP Server:    http://localhost:${PORT}
  📚 Swagger Docs:   http://localhost:${PORT}/api-docs
  🏥 Health Check:   http://localhost:${PORT}/health
  ⚡ WebSockets:     Socket.IO Initialized
  ----------------------------------------------------
  `);
});

// Handle Shutdown Gracefully
process.on('SIGINT', async () => {
  console.log(' Shutting down server gracefully...');
  await prisma.$disconnect();
  server.close(() => {
    console.log('👋 HTTP & Socket.IO server closed.');
    process.exit(0);
  });
});

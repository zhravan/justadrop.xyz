import { createApp } from './app.js';
import { config } from './shared/config/env.js';
import { connectDatabase, disconnectDatabase } from './shared/config/database.js';

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log(`
🚀 Server is running!
📍 Environment: ${config.env}
🌐 URL: http://${config.server.host}:${config.server.port}
🏥 Health: http://${config.server.host}:${config.server.port}/health
      `);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        await disconnectDatabase();
        
        console.log('Graceful shutdown completed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


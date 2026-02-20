import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import systemRoutes from './routes/system.routes.js';
import dockerRoutes from './routes/docker.routes.js';
import appStoreRoutes from './routes/appstore.routes.js';
import fileRoutes from './routes/file.routes.js';
import terminalRoutes from './routes/terminal.routes.js';
import userRoutes from './routes/user.routes.js';
import logRoutes from './routes/log.routes.js';
import configRoutes from './routes/config.routes.js';
import { initDatabase } from './db/index.js';
import { WebSocketService } from './services/websocket.service.js';
import { SystemMonitorService } from './services/system-monitor.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class VantaCoreServer {
  private app: express.Application;
  private server: http.Server;
  private io: SocketServer;
  private port: number;
  private wsService: WebSocketService;
  private monitorService: SystemMonitorService;

  constructor(port: number = 8080) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.io = new SocketServer(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });
    this.wsService = new WebSocketService(this.io);
    this.monitorService = new SystemMonitorService(this.io);
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeSocketIO();
    this.initializeErrorHandling();
  }

  private initializeMiddleware(): void {
    this.app.use(helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    }));
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
    this.app.use(express.static(path.join(__dirname, '../../public')));
  }

  private initializeRoutes(): void {
    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/system', systemRoutes);
    this.app.use('/api/docker', dockerRoutes);
    this.app.use('/api/appstore', appStoreRoutes);
    this.app.use('/api/files', fileRoutes);
    this.app.use('/api/terminal', terminalRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/logs', logRoutes);
    this.app.use('/api/config', configRoutes);

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // Serve client app
    this.app.use('*', express.static(path.join(__dirname, '../../client')));
  }

  private initializeSocketIO(): void {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);
      this.wsService.handleConnection(socket);

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
        this.wsService.handleDisconnect(socket);
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: {
          message: err.message || 'Internal server error',
          status: err.status || 500,
        },
      });
    });
  }

  public async start(): Promise<void> {
    try {
      await initDatabase();
      
      this.server.listen(this.port, '0.0.0.0', () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ███████╗██╗    ██╗███████╗███████╗ ██████╗ ███████╗    ║
║   ╚══███╔╝██║    ██║██╔════╝██╔════╝██╔═══██╗██╔════╝    ║
║     ███╔╝ ██║ █╗ ██║█████╗  ███████╗██║   ██║███████╗    ║
║    ███╔╝  ██║███╗██║██╔══╝  ╚════██║██║   ██║╚════██║    ║
║   ███████╗╚███╔███╔╝███████╗███████║╚██████╔╝███████║    ║
║   ╚══════╝ ╚══╝╚══╝ ╚══════╝╚══════╝ ╚═════╝ ╚══════╝    ║
║                                                           ║
║              Server Management Panel                      ║
║                                                           ║
║   Server running on: http://localhost:${this.port}           ║
║   Environment: ${process.env.NODE_ENV || 'development'}                          ║
║   Version: 1.0.0                                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
        `);
      });

      // Start system monitoring
      this.monitorService.start();

    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  public stop(): void {
    this.monitorService.stop();
    this.server.close(() => {
      console.log('Server stopped');
      process.exit(0);
    });
  }
}

const PORT = parseInt(process.env.PORT || '8080', 10);
const server = new VantaCoreServer(PORT);

process.on('SIGINT', () => server.stop());
process.on('SIGTERM', () => server.stop());

server.start();

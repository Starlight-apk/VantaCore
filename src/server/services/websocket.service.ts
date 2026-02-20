import { Server as SocketServer, Socket } from 'socket.io';
import os from 'os';
import si from 'systeminformation';

interface ClientInfo {
  id: string;
  connectedAt: Date;
  lastActivity: Date;
  subscriptions: Set<string>;
}

export class WebSocketService {
  private io: SocketServer;
  private clients: Map<string, ClientInfo>;
  private updateIntervals: Map<string, NodeJS.Timeout>;

  constructor(io: SocketServer) {
    this.io = io;
    this.clients = new Map();
    this.updateIntervals = new Map();
  }

  handleConnection(socket: Socket): void {
    const clientInfo: ClientInfo = {
      id: socket.id,
      connectedAt: new Date(),
      lastActivity: new Date(),
      subscriptions: new Set(),
    };
    this.clients.set(socket.id, clientInfo);

    socket.on('subscribe', (channel: string) => {
      clientInfo.subscriptions.add(channel);
      socket.join(channel);
      console.log(`Client ${socket.id} subscribed to ${channel}`);
    });

    socket.on('unsubscribe', (channel: string) => {
      clientInfo.subscriptions.delete(channel);
      socket.leave(channel);
    });

    socket.on('activity', () => {
      clientInfo.lastActivity = new Date();
    });
  }

  handleDisconnect(socket: Socket): void {
    const client = this.clients.get(socket.id);
    if (client) {
      client.subscriptions.forEach(channel => {
        socket.leave(channel);
      });
      this.clients.delete(socket.id);
    }
  }

  broadcast(channel: string, data: any): void {
    this.io.to(channel).emit(channel, data);
  }

  broadcastToAll(channel: string, data: any): void {
    this.io.emit(channel, data);
  }

  async broadcastSystemMetrics(): Promise<void> {
    try {
      const [cpu, memory, disk, network, osInfo] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.fsSize(),
        si.networkStats(),
        si.osInfo(),
      ]);

      const metrics = {
        timestamp: Date.now(),
        cpu: {
          currentLoad: cpu.currentLoad,
          cores: cpu.cpus,
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          speed: cpu.speed,
          temperature: cpu.temperature?.main || 0,
        },
        memory: {
          total: memory.total,
          free: memory.free,
          used: memory.used,
          available: memory.available,
          usagePercent: ((memory.used / memory.total) * 100).toFixed(2),
        },
        disk: disk.map(d => ({
          fs: d.fs,
          type: d.type,
          size: d.size,
          used: d.used,
          available: d.available,
          usePercent: d.use,
          mount: d.mount,
        })),
        network: {
          rx_bytes: network.reduce((acc, n) => acc + n.rx_bytes, 0),
          tx_bytes: network.reduce((acc, n) => acc + n.tx_bytes, 0),
          rx_sec: network.reduce((acc, n) => acc + n.rx_sec, 0),
          tx_sec: network.reduce((acc, n) => acc + n.tx_sec, 0),
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
          hostname: osInfo.hostname,
        },
        uptime: os.uptime(),
      };

      this.broadcastToAll('system:metrics', metrics);
    } catch (error) {
      console.error('Error broadcasting metrics:', error);
    }
  }

  getConnectedClientsCount(): number {
    return this.clients.size;
  }
}

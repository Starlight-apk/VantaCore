import { Server as SocketServer } from 'socket.io';
import os from 'os';
import si from 'systeminformation';
import fs from 'fs';
import path from 'path';

interface ProcessInfo {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  status: string;
}

export class SystemMonitorService {
  private io: SocketServer;
  private intervalId: NodeJS.Timeout | null = null;
  private readonly updateInterval: number = 2000;
  private readonly dataDir: string;

  constructor(io: SocketServer) {
    this.io = io;
    this.dataDir = path.join(process.cwd(), 'data', 'metrics');
    
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  start(): void {
    if (this.intervalId) return;

    console.log('System monitor started');
    this.intervalId = setInterval(() => {
      this.collectAndBroadcast();
    }, this.updateInterval);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('System monitor stopped');
    }
  }

  private async collectAndBroadcast(): Promise<void> {
    try {
      const metrics = await this.collectMetrics();
      this.io.emit('metrics:update', metrics);
      this.saveMetrics(metrics);
    } catch (error) {
      console.error('Error collecting metrics:', error);
    }
  }

  private async collectMetrics(): Promise<any> {
    const [
      cpuLoad,
      memory,
      disk,
      networkStats,
      networkInterfaces,
      battery,
      currentLoad,
      processes,
    ] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.networkInterfaces(),
      si.battery(),
      si.currentLoad(),
      si.processes(),
    ]);

    const temperature = await this.getCpuTemperature();

    return {
      timestamp: Date.now(),
      cpu: {
        load: {
          current: currentLoad.currentLoad,
          avg: os.loadavg(),
        },
        cores: cpuLoad.cores,
        manufacturer: cpuLoad.manufacturer,
        brand: cpuLoad.brand,
        speed: cpuLoad.speed,
        temperature,
        usage: currentLoad.cpus.map((cpu: any) => ({
          core: cpu.core,
          load: cpu.load,
        })),
      },
      memory: {
        total: memory.total,
        free: memory.free,
        used: memory.used,
        available: memory.available,
        active: memory.active,
        buffcache: memory.buffcache,
        usagePercent: parseFloat(((memory.used / memory.total) * 100).toFixed(2)),
      },
      disk: {
        partitions: disk.map(d => ({
          fs: d.fs,
          type: d.type,
          size: d.size,
          used: d.used,
          available: d.available,
          usePercent: parseFloat(d.use.toFixed(2)),
          mount: d.mount,
        })),
        io: await this.getDiskIO(),
      },
      network: {
        interfaces: networkInterfaces.map(ni => ({
          iface: ni.iface,
          ip4: ni.ip4,
          ip6: ni.ip6,
          mac: ni.mac,
          virtual: ni.virtual,
        })),
        stats: networkStats.map(ns => ({
          iface: ns.iface,
          rxBytes: ns.rx_bytes,
          txBytes: ns.tx_bytes,
          rxSec: ns.rx_sec,
          txSec: ns.tx_sec,
        })),
        total: {
          rxBytes: networkStats.reduce((acc, n) => acc + n.rx_bytes, 0),
          txBytes: networkStats.reduce((acc, n) => acc + n.tx_bytes, 0),
          rxSec: networkStats.reduce((acc, n) => acc + n.rx_sec, 0),
          txSec: networkStats.reduce((acc, n) => acc + n.tx_sec, 0),
        },
      },
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        charging: battery.acConnected,
        timeRemaining: battery.timeRemaining,
      },
      processes: {
        total: processes.all,
        running: processes.running,
        sleeping: processes.sleeping,
        unknown: processes.unknown,
        top: processes.list.slice(0, 10).map((p: any) => ({
          pid: p.pid,
          name: p.name,
          cpu: p.pcpu,
          memory: p.pmem,
          status: p.status,
        })),
      },
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: os.uptime(),
        release: os.release(),
        cpus: os.cpus(),
        totalmem: os.totalmem(),
        freemem: os.freemem(),
      },
    };
  }

  private async getCpuTemperature(): Promise<number> {
    try {
      const temp = await si.cpuTemperature();
      return temp.main || 0;
    } catch {
      return 0;
    }
  }

  private async getDiskIO(): Promise<any> {
    try {
      const diskIO = await si.diskIO();
      return {
        readPerSec: diskIO.readPerSec,
        writePerSec: diskIO.writePerSec,
        readBytes: diskIO.bytesRead,
        writeBytes: diskIO.bytesWritten,
      };
    } catch {
      return { readPerSec: 0, writePerSec: 0, readBytes: 0, writeBytes: 0 };
    }
  }

  private saveMetrics(metrics: any): void {
    try {
      const date = new Date();
      const filename = `metrics-${date.toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.dataDir, filename);

      let data: any[] = [];
      if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf-8');
        data = JSON.parse(content);
      }

      data.push(metrics);
      
      // Keep only last 1000 entries per file
      if (data.length > 1000) {
        data = data.slice(-1000);
      }

      fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error saving metrics:', error);
    }
  }

  getHistoricalMetrics(hours: number = 24): any[] {
    const now = new Date();
    const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    const metrics: any[] = [];

    const files = fs.readdirSync(this.dataDir)
      .filter(f => f.startsWith('metrics-'))
      .sort()
      .reverse()
      .slice(0, Math.ceil(hours / 24) + 1);

    for (const file of files) {
      try {
        const filepath = path.join(this.dataDir, file);
        const content = fs.readFileSync(filepath, 'utf-8');
        const data: any[] = JSON.parse(content);
        
        for (const metric of data) {
          const metricTime = new Date(metric.timestamp);
          if (metricTime >= startTime) {
            metrics.push(metric);
          }
        }
      } catch (error) {
        console.error(`Error reading ${file}:`, error);
      }
    }

    return metrics.reverse();
  }
}

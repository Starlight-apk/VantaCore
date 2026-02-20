import { Router } from 'express';
import si from 'systeminformation';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const router = Router();
const execAsync = promisify(exec);

router.get('/info', async (req, res) => {
  try {
    const [cpu, mem, disk, network, osInfo, battery, uptime] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.fsSize(),
      si.networkInterfaces(),
      si.osInfo(),
      si.battery(),
      os.uptime(),
    ]);

    res.json({
      cpu: {
        manufacturer: cpu.manufacturer,
        brand: cpu.brand,
        cores: cpu.cores,
        speed: cpu.speed,
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        available: mem.available,
      },
      disk: disk.map(d => ({
        fs: d.fs,
        size: d.size,
        used: d.used,
        available: d.available,
        usePercent: d.use,
        mount: d.mount,
      })),
      network: network.map(n => ({
        iface: n.iface,
        ip4: n.ip4,
        ip6: n.ip6,
        mac: n.mac,
      })),
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        kernel: osInfo.kernel,
        hostname: osInfo.hostname,
      },
      battery: {
        hasBattery: battery.hasBattery,
        percent: battery.percent,
        charging: battery.acConnected,
      },
      uptime,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get system info' });
  }
});

router.get('/metrics', async (req, res) => {
  try {
    const [currentLoad, mem, networkStats] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
    ]);

    res.json({
      cpu: {
        load: currentLoad.currentLoad,
        cpus: currentLoad.cpus,
      },
      memory: {
        total: mem.total,
        free: mem.free,
        used: mem.used,
        available: mem.available,
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2),
      },
      network: {
        rxBytes: networkStats.reduce((acc, n) => acc + n.rx_bytes, 0),
        txBytes: networkStats.reduce((acc, n) => acc + n.tx_bytes, 0),
        rxSec: networkStats.reduce((acc, n) => acc + n.rx_sec, 0),
        txSec: networkStats.reduce((acc, n) => acc + n.tx_sec, 0),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

router.get('/processes', async (req, res) => {
  try {
    const processes = await si.processes();
    res.json({
      total: processes.all,
      running: processes.running,
      list: processes.list.slice(0, 50).map(p => ({
        pid: p.pid,
        name: p.name,
        cpu: p.pcpu,
        memory: p.pmem,
        status: p.status,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get processes' });
  }
});

router.get('/logs', async (req, res) => {
  try {
    const { lines = 100 } = req.query;
    const numLines = parseInt(lines as string, 10);
    
    let logs = '';
    if (fs.existsSync('/var/log/syslog')) {
      const { stdout } = await execAsync(`tail -n ${numLines} /var/log/syslog`);
      logs = stdout;
    } else if (fs.existsSync('/var/log/messages')) {
      const { stdout } = await execAsync(`tail -n ${numLines} /var/log/messages`);
      logs = stdout;
    } else {
      logs = 'System logs not available';
    }

    res.json({ logs });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get logs' });
  }
});

router.post('/service/:action', async (req, res) => {
  try {
    const { action } = req.params;
    const { service } = req.body;

    if (!['start', 'stop', 'restart', 'status'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const { stdout, stderr } = await execAsync(`systemctl ${action} ${service}`);
    res.json({ output: stdout, error: stderr });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/services', async (req, res) => {
  try {
    const { stdout } = await execAsync('systemctl list-units --type=service --all --no-pager');
    const lines = stdout.split('\n').slice(3);
    const services = lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return {
        name: parts[0]?.replace('.service', '') || '',
        load: parts[1] || '',
        active: parts[2] || '',
        sub: parts[3] || '',
        description: parts.slice(4).join(' ') || '',
      };
    }).filter(s => s.name);

    res.json({ services });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { stdout } = await execAsync('cat /etc/passwd');
    const users = stdout.split('\n').filter(Boolean).map(line => {
      const [username, _, uid, gid, gecos, home, shell] = line.split(':');
      return { username, uid, gid, gecos, home, shell };
    });

    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

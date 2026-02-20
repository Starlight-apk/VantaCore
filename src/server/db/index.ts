import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  id: string;
  username: string;
  password: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string | null;
}

interface AppInstallation {
  id: string;
  appId: string;
  name: string;
  version: string;
  status: 'installing' | 'running' | 'stopped' | 'error';
  port: number;
  config: Record<string, any>;
  installedAt: string;
}

interface SystemConfig {
  id: string;
  hostname: string;
  timezone: string;
  dockerEnabled: boolean;
  autoStart: boolean;
  theme: 'light' | 'dark' | 'auto';
}

interface Database {
  users: User[];
  apps: AppInstallation[];
  config: SystemConfig[];
  logs: Array<{
    id: string;
    level: 'info' | 'warn' | 'error';
    message: string;
    timestamp: string;
  }>;
}

const dbPath = path.join(__dirname, '../../../data/db.json');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const adapter = new JSONFile<Database>(dbPath);
export const db = new Low<Database>(adapter, {
  users: [],
  apps: [],
  config: [],
  logs: [],
});

export async function initDatabase(): Promise<void> {
  await db.read();
  
  // Initialize default data if empty
  if (db.data.users.length === 0) {
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    db.data.users.push({
      id: '1',
      username: 'admin',
      password: hashedPassword,
      email: 'admin@vantacore.local',
      role: 'admin',
      createdAt: new Date().toISOString(),
      lastLogin: null,
    });
  }

  if (db.data.config.length === 0) {
    const os = await import('os');
    db.data.config.push({
      id: '1',
      hostname: os.hostname(),
      timezone: 'UTC',
      dockerEnabled: false,
      autoStart: true,
      theme: 'dark',
    });
  }

  await db.write();
  console.log('Database initialized');
}

export { User, AppInstallation, SystemConfig };

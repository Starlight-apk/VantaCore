// 共享类型定义

// 用户相关
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 系统相关
export interface SystemInfo {
  cpu: {
    manufacturer: string;
    brand: string;
    cores: number;
    speed: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    available: number;
  };
  disk: DiskInfo[];
  network: NetworkInfo[];
  os: OSInfo;
  battery: BatteryInfo;
  uptime: number;
}

export interface DiskInfo {
  fs: string;
  size: number;
  used: number;
  available: number;
  usePercent: number;
  mount: string;
}

export interface NetworkInfo {
  iface: string;
  ip4: string;
  ip6: string;
  mac: string;
}

export interface OSInfo {
  platform: string;
  distro: string;
  release: string;
  arch: string;
  kernel: string;
  hostname: string;
}

export interface BatteryInfo {
  hasBattery: boolean;
  percent: number;
  charging: boolean;
}

export interface Metrics {
  cpu: {
    load: number;
    cpus: Array<{ core: number; load: number }>;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    available: number;
    usagePercent: number;
  };
  network: {
    rxBytes: number;
    txBytes: number;
    rxSec: number;
    txSec: number;
  };
}

// 应用相关
export interface AppDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  category: string;
  image: string;
  port: number;
  docker: boolean;
  env?: Record<string, string>;
  volumes?: string[];
}

export interface InstalledApp {
  id: string;
  appId: string;
  name: string;
  version: string;
  status: 'installing' | 'running' | 'stopped' | 'error';
  port: number;
  config: Record<string, any>;
  installedAt: string;
}

// Docker 相关
export interface DockerInfo {
  enabled: boolean;
  info: {
    containers: number;
    containersRunning: number;
    containersPaused: number;
    containersStopped: number;
    images: number;
    driver: string;
    kernelVersion: string;
    operatingSystem: string;
    serverVersion: string;
  };
}

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  imageId: string;
  command: string;
  created: number;
  state: string;
  status: string;
  ports: Array<{
    PublicPort?: number;
    PrivatePort: number;
    Type: string;
  }>;
  labels: Record<string, string>;
}

export interface CreateContainerRequest {
  name?: string;
  image: string;
  cmd?: string[];
  Env?: string[];
  ExposedPorts?: Record<string, {}>;
  HostConfig?: {
    PortBindings?: Record<string, Array<{ HostPort: string }>>;
    Binds?: string[];
    Memory?: number;
    CpuShares?: number;
    RestartPolicy?: {
      Name: 'no' | 'always' | 'on-failure' | 'unless-stopped';
      MaximumRetryCount?: number;
    };
    NetworkMode?: string;
  };
}

// 文件相关
export interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string | null;
}

export interface FileListResponse {
  path: string;
  files: FileInfo[];
}

export interface FileReadResponse {
  path: string;
  content: string;
  size: number;
  modified: string;
}

// 终端相关
export interface TerminalSession {
  id: string;
  createdAt: string;
  lastActivity: string;
}

// 通用响应
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 设置相关
export interface SystemSettings {
  hostname: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  dockerEnabled: boolean;
  autoStart: boolean;
  notifications: boolean;
  emailAlerts: boolean;
  email: string;
}

// 通知相关
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 日志相关
export interface LogEntry {
  id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  source?: string;
}

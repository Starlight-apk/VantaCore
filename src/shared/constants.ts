// 常量定义

// API 端点
export const API_ENDPOINTS = {
  // 认证
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_ME: '/auth/me',
  AUTH_CHANGE_PASSWORD: '/auth/change-password',
  
  // 系统
  SYSTEM_INFO: '/system/info',
  SYSTEM_METRICS: '/system/metrics',
  SYSTEM_PROCESSES: '/system/processes',
  SYSTEM_LOGS: '/system/logs',
  SYSTEM_SERVICES: '/system/services',
  SYSTEM_USERS: '/system/users',
  
  // 应用商店
  APPSTORE_LIST: '/appstore/list',
  APPSTORE_DETAIL: '/appstore/detail',
  APPSTORE_INSTALLED: '/appstore/installed',
  APPSTORE_INSTALL: '/appstore/install',
  APPSTORE_UNINSTALL: '/appstore/uninstall',
  APPSTORE_CATEGORIES: '/appstore/categories',
  
  // Docker
  DOCKER_INFO: '/docker/info',
  DOCKER_CONTAINERS: '/docker/containers',
  DOCKER_IMAGES: '/docker/images',
  DOCKER_NETWORKS: '/docker/networks',
  DOCKER_VOLUMES: '/docker/volumes',
  
  // 文件
  FILES_LIST: '/files/list',
  FILES_READ: '/files/read',
  FILES_WRITE: '/files/write',
  FILES_DELETE: '/files/delete',
  FILES_MKDIR: '/files/mkdir',
  FILES_RENAME: '/files/rename',
  FILES_UPLOAD: '/files/upload',
  FILES_DOWNLOAD: '/files/download',
  
  // 终端
  TERMINAL_CREATE: '/terminal/create',
  TERMINAL_CLOSE: '/terminal/close',
  TERMINAL_RESIZE: '/terminal/resize',
  TERMINAL_SESSIONS: '/terminal/sessions',
} as const;

// 应用类别
export const APP_CATEGORIES = {
  WEB_SERVER: 'Web 服务器',
  DATABASE: '数据库',
  RUNTIME: '运行环境',
  CMS: 'CMS',
  TOOLS: '工具',
  MONITORING: '监控',
  SEARCH: '搜索',
  DEV_TOOLS: '开发工具',
  CLOUD_STORAGE: '云存储',
  DOWNLOAD: '下载',
  SMART_HOME: '智能家居',
} as const;

// Docker 状态
export const DOCKER_STATES = {
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPED: 'exited',
  CREATED: 'created',
  RESTARTING: 'restarting',
  DEAD: 'dead',
} as const;

// 文件类型图标映射
export const FILE_TYPE_ICONS = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
  video: ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv'],
  audio: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
  archive: ['zip', 'tar', 'gz', 'rar', '7z', 'bz2'],
  code: ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'go', 'rs', 'php', 'rb'],
  document: ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf', 'log'],
  pdf: ['pdf'],
  word: ['doc', 'docx'],
  excel: ['xls', 'xlsx'],
  powerpoint: ['ppt', 'pptx'],
} as const;

// 主题配置
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto',
} as const;

// 语言配置
export const LANGUAGES = {
  ZH_CN: 'zh-CN',
  ZH_TW: 'zh-TW',
  EN_US: 'en-US',
  JA_JP: 'ja-JP',
  KO_KR: 'ko-KR',
} as const;

// 时区配置
export const TIMEZONES = {
  UTC: 'UTC',
  ASIA_SHANGHAI: 'Asia/Shanghai',
  ASIA_HONG_KONG: 'Asia/Hong_Kong',
  ASIA_TOKYO: 'Asia/Tokyo',
  ASIA_SEOUL: 'Asia/Seoul',
  AMERICA_NEW_YORK: 'America/New_York',
  AMERICA_LOS_ANGELES: 'America/Los_Angeles',
  EUROPE_LONDON: 'Europe/London',
  EUROPE_PARIS: 'Europe/Paris',
} as const;

// 通知类型
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

// 日志级别
export const LOG_LEVELS = {
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
} as const;

// 默认配置
export const DEFAULT_CONFIG = {
  PORT: 8080,
  JWT_EXPIRES_IN: '7d',
  SESSION_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 天
  MAX_UPLOAD_SIZE: 50 * 1024 * 1024, // 50MB
  METRICS_UPDATE_INTERVAL: 2000, // 2 秒
  TERMINAL_INACTIVE_TIMEOUT: 30 * 60 * 1000, // 30 分钟
} as const;

// 图表配置
export const CHART_COLORS = [
  '#0ea5e9', // blue
  '#8b5cf6', // purple
  '#16a34a', // green
  '#f59e0b', // yellow
  '#ef4444', // red
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
] as const;

export const CHART_CONFIG = {
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  responsive: true,
  maintainAspectRatio: false,
} as const;

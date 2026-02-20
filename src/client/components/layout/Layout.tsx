import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Store,
  FolderOpen,
  Terminal as TerminalIcon,
  Container,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  Bell,
  User,
  ChevronDown,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void;
}

interface Metrics {
  cpu: { load: number };
  memory: { usagePercent: string };
  disk: any[];
  network: { rxSec: number; txSec: number };
}

const navItems = [
  { icon: LayoutDashboard, label: '概览', path: '/' },
  { icon: Store, label: '应用商店', path: '/apps' },
  { icon: FolderOpen, label: '文件管理', path: '/files' },
  { icon: TerminalIcon, label: '终端', path: '/terminal' },
  { icon: Container, label: 'Docker', path: '/docker' },
  { icon: SettingsIcon, label: '设置', path: '/settings' },
];

export default function Layout({ children, onLogout }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { data: metrics } = useQuery<Metrics>({
    queryKey: ['metrics'],
    queryFn: async () => {
      const { data } = await axios.get('/api/system/metrics');
      return data;
    },
    refetchInterval: 3000,
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen flex">
      {/* 侧边栏 */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700/50 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-700/50">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-xl neumorph-card flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-sky-400" />
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg gradient-text animate-fade-in">
                VantaCore
              </span>
            )}
          </div>
        </div>

        {/* 导航 */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-500/20 to-sky-500/10 text-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                } ${!sidebarOpen && 'justify-center'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <span className="animate-fade-in">{item.label}</span>
                )}
                {isActive && sidebarOpen && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* 系统状态 */}
        {sidebarOpen && (
          <div className="absolute bottom-24 left-4 right-4 space-y-3">
            <div className="neumorph-card py-3 px-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <Cpu className="w-3 h-3" />
                <span>CPU</span>
                <span className="ml-auto text-sky-400">
                  {metrics?.cpu?.load?.toFixed(1) || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-sky-400 rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.cpu?.load || 0}%` }}
                />
              </div>
            </div>

            <div className="neumorph-card py-3 px-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <HardDrive className="w-3 h-3" />
                <span>内存</span>
                <span className="ml-auto text-purple-400">
                  {metrics?.memory?.usagePercent || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${metrics?.memory?.usagePercent || 0}%` }}
                />
              </div>
            </div>

            <div className="neumorph-card py-3 px-4">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Wifi className="w-3 h-3" />
                <span>网络</span>
              </div>
              <div className="mt-2 text-xs">
                <div className="flex justify-between text-green-400">
                  <span>↓ {formatBytes(metrics?.network?.rxSec || 0)}</span>
                </div>
                <div className="flex justify-between text-red-400">
                  <span>↑ {formatBytes(metrics?.network?.txSec || 0)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 登出按钮 */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300 ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>退出登录</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* 顶部栏 */}
        <header className="h-20 glass flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="w-10 h-10 rounded-xl neumorph-btn flex items-center justify-center"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-4">
            {/* 通知 */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="w-10 h-10 rounded-xl neumorph-btn flex items-center justify-center relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </button>
            </div>

            {/* 用户菜单 */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl neumorph-btn"
              >
                <User className="w-5 h-5" />
                <span className="text-sm">Admin</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <div className="p-6">
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

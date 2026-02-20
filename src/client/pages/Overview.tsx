import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Server,
  Thermometer,
  Activity,
  Zap,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { io } from 'socket.io-client';

interface Metrics {
  cpu: {
    load: { current: number; avg: number[] };
    temperature: number;
    usage: Array<{ core: number; load: number }>;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    available: number;
    usagePercent: number;
  };
  disk: {
    partitions: Array<{
      fs: string;
      size: number;
      used: number;
      available: number;
      usePercent: number;
      mount: string;
    }>;
  };
  network: {
    total: {
      rxSec: number;
      txSec: number;
    };
  };
  processes: {
    total: number;
    running: number;
  };
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#16a34a', '#f59e0b', '#ef4444'];

export default function Overview() {
  const [metricsHistory, setMetricsHistory] = useState<any[]>([]);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    const socketInstance = io(window.location.origin);
    setSocket(socketInstance);

    socketInstance.on('metrics:update', (data: Metrics) => {
      setMetricsHistory((prev) => {
        const newHistory = [...prev, { ...data, time: new Date().toLocaleTimeString() }];
        return newHistory.slice(-30);
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const { data: systemInfo } = useQuery({
    queryKey: ['systemInfo'],
    queryFn: async () => {
      const { data } = await axios.get('/api/system/info');
      return data;
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color }: any) => (
    <div className="neumorph-card animate-scale-in">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">系统概览</h1>
        <p className="text-slate-400">实时监控服务器状态和性能指标</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Cpu}
          title="CPU 使用率"
          value={`${metricsHistory[metricsHistory.length - 1]?.cpu?.load?.current?.toFixed(1) || 0}%`}
          subtitle={`${systemInfo?.cpu?.brand || 'Unknown'} (${systemInfo?.cpu?.cores || 0} 核心)`}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          icon={HardDrive}
          title="内存使用率"
          value={`${metricsHistory[metricsHistory.length - 1]?.memory?.usagePercent?.toFixed(1) || 0}%`}
          subtitle={`${formatBytes(metricsHistory[metricsHistory.length - 1]?.memory?.used || 0)} / ${formatBytes(metricsHistory[metricsHistory.length - 1]?.memory?.total || 0)}`}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          icon={Wifi}
          title="网络流量"
          value={`${formatBytes(metricsHistory[metricsHistory.length - 1]?.network?.total?.rxSec || 0)}`}
          subtitle={`↑ ${formatBytes(metricsHistory[metricsHistory.length - 1]?.network?.total?.txSec || 0)}`}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <StatCard
          icon={Clock}
          title="运行时间"
          value={formatTime(systemInfo?.uptime || 0)}
          subtitle={systemInfo?.os?.hostname || 'Unknown'}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* 图表区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU 使用率图表 */}
        <div className="neumorph-card animate-fade-in delay-100">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">CPU 使用率趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metricsHistory}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
              <Area
                type="monotone"
                dataKey={(data) => data.cpu?.load?.current}
                stroke="#0ea5e9"
                strokeWidth={2}
                fill="url(#cpuGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 内存使用率图表 */}
        <div className="neumorph-card animate-fade-in delay-200">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">内存使用率趋势</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={metricsHistory}>
              <defs>
                <linearGradient id="memGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Area
                type="monotone"
                dataKey={(data) => data.memory?.usagePercent}
                stroke="#a855f7"
                strokeWidth={2}
                fill="url(#memGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 系统信息 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CPU 核心使用率 */}
        <div className="neumorph-card animate-fade-in delay-300">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">CPU 核心使用率</h3>
          </div>
          <div className="space-y-3">
            {metricsHistory[metricsHistory.length - 1]?.cpu?.usage?.slice(0, 8)?.map((core: any, index: number) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">核心 {core.core}</span>
                  <span>{core.load.toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                    style={{ width: `${core.load}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 磁盘使用率 */}
        <div className="neumorph-card animate-fade-in delay-400">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">磁盘使用率</h3>
          </div>
          <div className="space-y-4">
            {systemInfo?.disk?.map((disk: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">{disk.mount}</span>
                  <span className="text-slate-300">
                    {formatBytes(disk.used)} / {formatBytes(disk.size)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${disk.usePercent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 系统详情 */}
      <div className="neumorph-card animate-fade-in delay-500">
        <div className="flex items-center gap-2 mb-4">
          <Server className="w-5 h-5 text-orange-400" />
          <h3 className="font-semibold">系统信息</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">操作系统</p>
            <p className="font-medium">{systemInfo?.os?.distro || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">内核版本</p>
            <p className="font-medium">{systemInfo?.os?.kernel || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">架构</p>
            <p className="font-medium">{systemInfo?.os?.arch || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">CPU 温度</p>
            <p className="font-medium flex items-center gap-1">
              <Thermometer className="w-4 h-4" />
              {metricsHistory[metricsHistory.length - 1]?.cpu?.temperature?.toFixed(1) || 0}°C
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">进程总数</p>
            <p className="font-medium">{metricsHistory[metricsHistory.length - 1]?.processes?.total || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">运行中进程</p>
            <p className="font-medium">{metricsHistory[metricsHistory.length - 1]?.processes?.running || 0}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">总内存</p>
            <p className="font-medium">{formatBytes(systemInfo?.memory?.total || 0)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-slate-400 text-sm">可用内存</p>
            <p className="font-medium">{formatBytes(systemInfo?.memory?.available || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

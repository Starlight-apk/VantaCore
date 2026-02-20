import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Store,
  Search,
  Filter,
  Download,
  Trash2,
  Play,
  Square,
  Package,
  Layers,
  CheckCircle,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';

interface App {
  id: string;
  appId: string;
  name: string;
  description: string;
  version: string;
  author: string;
  icon: string;
  category: string;
  image: string;
  port: number;
  docker: boolean;
  status?: string;
}

export default function AppStore() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<App | null>(null);

  const queryClient = useQueryClient();

  const { data: appStoreData } = useQuery({
    queryKey: ['appStore'],
    queryFn: async () => {
      const { data } = await axios.get('/api/appstore/list');
      return data;
    },
  });

  const { data: installedApps } = useQuery({
    queryKey: ['installedApps'],
    queryFn: async () => {
      const { data } = await axios.get('/api/appstore/installed');
      return data.apps;
    },
    refetchInterval: 5000,
  });

  const installMutation = useMutation({
    mutationFn: async (appId: string) => {
      const { data } = await axios.post('/api/appstore/install', { appId });
      return data;
    },
    onSuccess: () => {
      toast.success('应用安装已启动');
      queryClient.invalidateQueries({ queryKey: ['installedApps'] });
      setSelectedApp(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '安装失败');
    },
  });

  const uninstallMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.post(`/api/appstore/uninstall/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('应用已卸载');
      queryClient.invalidateQueries({ queryKey: ['installedApps'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '卸载失败');
    },
  });

  const appActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const { data } = await axios.post(`/api/appstore/${id}/${action}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installedApps'] });
    },
  });

  const categories = ['all', ...(appStoreData?.categories || [])];

  const filteredApps = appStoreData?.apps?.filter((app: App) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getInstallStatus = (appId: string) => {
    return installedApps?.find((a: any) => a.appId === appId);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'installing':
        return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'stopped':
        return <Square className="w-4 h-4 text-slate-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">应用商店</h1>
        <p className="text-slate-400">一键部署常用应用和服务</p>
      </div>

      {/* 搜索和筛选 */}
      <div className="neumorph-card animate-fade-in delay-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="搜索应用..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neumorph-input pl-12"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
                    : 'neumorph-btn text-slate-400 hover:text-slate-200'
                }`}
              >
                {category === 'all' ? '全部' : category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 应用网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredApps?.map((app: App, index: number) => {
          const installStatus = getInstallStatus(app.id);
          return (
            <div
              key={app.id}
              className="neumorph-card group cursor-pointer animate-scale-in"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center">
                  <Package className="w-7 h-7 text-sky-400" />
                </div>
                {installStatus && (
                  <div className="flex items-center gap-1">
                    {getStatusIcon(installStatus.status)}
                    <span className={`text-xs ${
                      installStatus.status === 'running' ? 'text-green-400' :
                      installStatus.status === 'installing' ? 'text-yellow-400' :
                      'text-slate-400'
                    }`}>
                      {installStatus.status === 'running' ? '运行中' :
                       installStatus.status === 'installing' ? '安装中' :
                       installStatus.status === 'stopped' ? '已停止' : '错误'}
                    </span>
                  </div>
                )}
              </div>

              <h3 className="font-semibold text-lg mb-1 group-hover:text-sky-400 transition-colors">
                {app.name}
              </h3>
              <p className="text-slate-400 text-sm mb-3 line-clamp-2">
                {app.description}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-1 rounded-lg">
                  {app.category}
                </span>
                <span className="text-xs text-slate-500">v{app.version}</span>
              </div>

              {installStatus ? (
                <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700/50">
                  {installStatus.status === 'running' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        appActionMutation.mutate({ id: installStatus.id, action: 'stop' });
                      }}
                      className="flex-1 neumorph-btn text-yellow-400 text-sm py-2"
                    >
                      停止
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        appActionMutation.mutate({ id: installStatus.id, action: 'start' });
                      }}
                      className="flex-1 neumorph-btn text-green-400 text-sm py-2"
                    >
                      启动
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      uninstallMutation.mutate(installStatus.id);
                    }}
                    className="flex-1 neumorph-btn text-red-400 text-sm py-2"
                  >
                    卸载
                  </button>
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    installMutation.mutate(app.id);
                  }}
                  className="w-full neumorph-btn primary mt-4 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  安装
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* 应用详情模态框 */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="neumorph-card w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500/20 to-purple-500/20 flex items-center justify-center">
                  <Package className="w-8 h-8 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedApp.name}</h2>
                  <p className="text-slate-400">v{selectedApp.version} by {selectedApp.author}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="w-10 h-10 rounded-xl neumorph-btn flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 mb-6">{selectedApp.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="neumorph-card py-3 px-4">
                <p className="text-slate-400 text-sm">类别</p>
                <p className="font-medium">{selectedApp.category}</p>
              </div>
              <div className="neumorph-card py-3 px-4">
                <p className="text-slate-400 text-sm">端口</p>
                <p className="font-medium">{selectedApp.port}</p>
              </div>
              <div className="neumorph-card py-3 px-4">
                <p className="text-slate-400 text-sm">Docker</p>
                <p className="font-medium">{selectedApp.docker ? '是' : '否'}</p>
              </div>
              <div className="neumorph-card py-3 px-4">
                <p className="text-slate-400 text-sm">镜像</p>
                <p className="font-medium text-sm">{selectedApp.image}</p>
              </div>
            </div>

            {selectedApp.volumes && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  数据卷映射
                </h3>
                <div className="space-y-1">
                  {selectedApp.volumes.map((volume, index) => (
                    <p key={index} className="text-sm text-slate-400 font-mono bg-slate-800/50 px-3 py-2 rounded-lg">
                      {volume}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {getInstallStatus(selectedApp.id) ? (
                <>
                  <button className="flex-1 neumorph-btn primary">
                    管理应用
                  </button>
                  <button
                    onClick={() => uninstallMutation.mutate(getInstallStatus(selectedApp.id)?.id)}
                    className="neumorph-btn text-red-400"
                  >
                    卸载
                  </button>
                </>
              ) : (
                <button
                  onClick={() => installMutation.mutate(selectedApp.id)}
                  className="flex-1 neumorph-btn primary flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  立即安装
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Container,
  Plus,
  Play,
  Square,
  RotateCcw,
  Trash2,
  RefreshCw,
  Search,
  Server,
  HardDrive,
  Network,
  Settings,
  AlertCircle,
  CheckCircle,
  X,
  Terminal as TerminalIcon,
  Download,
} from 'lucide-react';

interface DockerContainer {
  id: string;
  name: string;
  image: string;
  state: string;
  status: string;
  ports: Array<{ PublicPort?: number; PrivatePort: number; Type: string }>;
  created: number;
}

interface DockerInfo {
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

export default function Docker() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedContainer, setSelectedContainer] = useState<DockerContainer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newContainer, setNewContainer] = useState({
    name: '',
    image: '',
    port: '',
  });

  const queryClient = useQueryClient();

  const { data: dockerInfo } = useQuery<DockerInfo>({
    queryKey: ['dockerInfo'],
    queryFn: async () => {
      const { data } = await axios.get('/api/docker/info');
      return data;
    },
    enabled: process.env.REACT_APP_DOCKER_ENABLED === 'true',
  });

  const { data: containersData } = useQuery({
    queryKey: ['containers'],
    queryFn: async () => {
      const { data } = await axios.get('/api/docker/containers');
      return data;
    },
    refetchInterval: 5000,
  });

  const containerActionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: string }) => {
      const { data } = await axios.post(`/api/docker/containers/${id}/${action}`);
      return data;
    },
    onSuccess: () => {
      toast.success('操作成功');
      queryClient.invalidateQueries({ queryKey: ['containers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '操作失败');
    },
  });

  const deleteContainerMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/docker/containers/${id}`);
      return data;
    },
    onSuccess: () => {
      toast.success('容器已删除');
      queryClient.invalidateQueries({ queryKey: ['containers'] });
      setSelectedContainer(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '删除失败');
    },
  });

  const createContainerMutation = useMutation({
    mutationFn: async (config: any) => {
      const { data } = await axios.post('/api/docker/containers', config);
      return data;
    },
    onSuccess: () => {
      toast.success('容器创建成功');
      queryClient.invalidateQueries({ queryKey: ['containers'] });
      setShowCreateModal(false);
      setNewContainer({ name: '', image: '', port: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '创建失败');
    },
  });

  const filteredContainers = containersData?.containers?.filter((c: DockerContainer) => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.image.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || c.state === filter;
    return matchesSearch && matchesFilter;
  });

  const getStateColor = (state: string) => {
    switch (state) {
      case 'running':
        return 'text-green-400 bg-green-500/10';
      case 'paused':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'exited':
      case 'stopped':
        return 'text-slate-400 bg-slate-500/10';
      default:
        return 'text-slate-400 bg-slate-500/10';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'running':
        return <CheckCircle className="w-4 h-4" />;
      case 'paused':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <X className="w-4 h-4" />;
    }
  };

  const handleCreate = () => {
    if (!newContainer.image) {
      toast.error('请输入镜像名称');
      return;
    }

    const config: any = {
      image: newContainer.image,
      name: newContainer.name || undefined,
    };

    if (newContainer.port) {
      const [hostPort, containerPort] = newContainer.port.split(':');
      config.HostConfig = {
        PortBindings: {
          [`${containerPort}/tcp`]: [{ HostPort: hostPort || containerPort }],
        },
      };
    }

    createContainerMutation.mutate(config);
  };

  // Docker 未启用状态
  if (!dockerInfo?.enabled) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <Container className="w-20 h-20 text-slate-600 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-2">Docker 未启用</h2>
          <p className="text-slate-400 mb-6">
            Docker 功能当前未启用。要使用 Docker 管理功能，请设置环境变量 DOCKER_ENABLED=true
          </p>
          <div className="neumorph-card text-left">
            <p className="text-sm text-slate-400 mb-2">启用方法：</p>
            <code className="block bg-slate-800/50 p-3 rounded-lg text-green-400 font-mono text-sm">
              export DOCKER_ENABLED=true
            </code>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Docker 管理</h1>
            <p className="text-slate-400">管理容器、镜像和网络</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="neumorph-btn primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            创建容器
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="neumorph-card animate-scale-in">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Container className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">总容器</p>
              <p className="text-2xl font-bold">{dockerInfo?.info?.containers || 0}</p>
            </div>
          </div>
        </div>
        <div className="neumorph-card animate-scale-in delay-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">运行中</p>
              <p className="text-2xl font-bold">{dockerInfo?.info?.containersRunning || 0}</p>
            </div>
          </div>
        </div>
        <div className="neumorph-card animate-scale-in delay-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Server className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">镜像</p>
              <p className="text-2xl font-bold">{dockerInfo?.info?.images || 0}</p>
            </div>
          </div>
        </div>
        <div className="neumorph-card animate-scale-in delay-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">版本</p>
              <p className="text-lg font-bold">{dockerInfo?.info?.serverVersion || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选和搜索 */}
      <div className="neumorph-card animate-fade-in delay-400">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['all', 'running', 'paused', 'exited'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white'
                    : 'neumorph-btn text-slate-400 hover:text-slate-200'
                }`}
              >
                {f === 'all' ? '全部' : f === 'running' ? '运行中' : f === 'paused' ? '已暂停' : '已停止'}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="搜索容器..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neumorph-input pl-12"
            />
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['containers'] })}
            className="neumorph-btn"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 容器列表 */}
      <div className="neumorph-card animate-fade-in delay-500 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">状态</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">名称</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">镜像</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm hidden md:table-cell">端口</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm hidden lg:table-cell">创建时间</th>
                <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredContainers?.map((container: DockerContainer, index: number) => (
                <tr
                  key={container.id}
                  className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors animate-scale-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => setSelectedContainer(container)}
                >
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStateColor(container.state)}`}>
                      {getStateIcon(container.state)}
                      {container.state === 'running' ? '运行中' : container.state === 'paused' ? '已暂停' : '已停止'}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium">{container.name || '-'}</td>
                  <td className="py-4 px-4 text-slate-400">{container.image}</td>
                  <td className="py-4 px-4 text-slate-400 text-sm hidden md:table-cell">
                    {container.ports?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {container.ports.map((port, i) => (
                          <span key={i} className="text-xs bg-slate-700/50 px-2 py-1 rounded">
                            {port.PublicPort || port.PrivatePort}/{port.Type}
                          </span>
                        ))}
                      </div>
                    ) : '-'}
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-sm hidden lg:table-cell">
                    {new Date(container.created * 1000).toLocaleDateString('zh-CN')}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {container.state === 'running' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            containerActionMutation.mutate({ id: container.id, action: 'stop' });
                          }}
                          className="p-2 neumorph-btn text-yellow-400 hover:bg-yellow-500/10"
                          title="停止"
                        >
                          <Square className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            containerActionMutation.mutate({ id: container.id, action: 'start' });
                          }}
                          className="p-2 neumorph-btn text-green-400 hover:bg-green-500/10"
                          title="启动"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          containerActionMutation.mutate({ id: container.id, action: 'restart' });
                        }}
                        className="p-2 neumorph-btn text-blue-400 hover:bg-blue-500/10"
                        title="重启"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteContainerMutation.mutate(container.id);
                        }}
                        className="p-2 neumorph-btn text-red-400 hover:bg-red-500/10"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!filteredContainers || filteredContainers.length === 0) && (
          <div className="text-center py-12">
            <Container className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">没有找到容器</p>
          </div>
        )}
      </div>

      {/* 创建容器模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="neumorph-card w-full max-w-lg mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">创建容器</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-10 h-10 rounded-xl neumorph-btn flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">容器名称（可选）</label>
                <input
                  type="text"
                  value={newContainer.name}
                  onChange={(e) => setNewContainer({ ...newContainer, name: e.target.value })}
                  placeholder="my-container"
                  className="neumorph-input"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">镜像名称 *</label>
                <input
                  type="text"
                  value={newContainer.image}
                  onChange={(e) => setNewContainer({ ...newContainer, image: e.target.value })}
                  placeholder="nginx:latest"
                  className="neumorph-input"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-2">端口映射（可选）</label>
                <input
                  type="text"
                  value={newContainer.port}
                  onChange={(e) => setNewContainer({ ...newContainer, port: e.target.value })}
                  placeholder="8080:80"
                  className="neumorph-input"
                />
                <p className="text-xs text-slate-500 mt-1">格式：主机端口：容器端口</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={handleCreate} className="flex-1 neumorph-btn primary">
                创建并启动
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 neumorph-btn"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  FolderOpen,
  Folder,
  File,
  ChevronRight,
  ArrowUp,
  Download,
  Trash2,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Eye,
  FileText,
  Image,
  Film,
  Music,
  Archive,
  Code,
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  modified: string | null;
}

export default function FileManager() {
  const [currentPath, setCurrentPath] = useState('/');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const queryClient = useQueryClient();

  const { data: filesData } = useQuery({
    queryKey: ['files', currentPath],
    queryFn: async () => {
      const { data } = await axios.get(`/api/files/list?path=${encodeURIComponent(currentPath)}`);
      return data;
    },
  });

  const getFileIcon = (file: FileItem) => {
    if (file.isDirectory) return <Folder className="w-5 h-5 text-yellow-400" />;
    
    const ext = file.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
      case 'svg':
        return <Image className="w-5 h-5 text-purple-400" />;
      case 'mp4':
      case 'avi':
      case 'mkv':
      case 'mov':
        return <Film className="w-5 h-5 text-blue-400" />;
      case 'mp3':
      case 'wav':
      case 'flac':
        return <Music className="w-5 h-5 text-green-400" />;
      case 'zip':
      case 'tar':
      case 'gz':
      case 'rar':
      case '7z':
        return <Archive className="w-5 h-5 text-orange-400" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
      case 'java':
      case 'cpp':
      case 'c':
      case 'h':
      case 'go':
      case 'rs':
      case 'php':
        return <Code className="w-5 h-5 text-cyan-400" />;
      case 'txt':
      case 'md':
      case 'json':
      case 'xml':
      case 'yaml':
      case 'yml':
      case 'toml':
      case 'ini':
      case 'conf':
      case 'log':
        return <FileText className="w-5 h-5 text-blue-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const navigateTo = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles([]);
  };

  const navigateUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    navigateTo('/' + parts.join('/') || '/');
  };

  const deleteMutation = useMutation({
    mutationFn: async (path: string) => {
      const { data } = await axios.delete(`/api/files/delete?path=${encodeURIComponent(path)}`);
      return data;
    },
    onSuccess: () => {
      toast.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setSelectedFiles([]);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '删除失败');
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async (path: string) => {
      const { data } = await axios.post('/api/files/mkdir', { path });
      return data;
    },
    onSuccess: () => {
      toast.success('文件夹创建成功');
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setShowNewFileModal(false);
      setNewFileName('');
      setIsCreatingFolder(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '创建失败');
    },
  });

  const handleCreate = () => {
    if (!newFileName.trim()) return;
    const newPath = currentPath === '/' ? `/${newFileName}` : `${currentPath}/${newFileName}`;
    if (isCreatingFolder) {
      createFolderMutation.mutate(newPath);
    }
  };

  const filteredFiles = filesData?.files?.filter((file: FileItem) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const breadcrumbs = currentPath.split('/').filter(Boolean);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">文件管理</h1>
        <p className="text-slate-400">浏览和管理服务器文件系统</p>
      </div>

      {/* 工具栏 */}
      <div className="neumorph-card animate-fade-in delay-100">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* 路径导航 */}
          <div className="flex items-center gap-2 flex-wrap flex-1">
            <button
              onClick={() => navigateTo('/')}
              className="p-2 neumorph-btn text-slate-400 hover:text-slate-200"
            >
              <FolderOpen className="w-5 h-5" />
            </button>
            {currentPath !== '/' && (
              <button
                onClick={navigateUp}
                className="p-2 neumorph-btn text-slate-400 hover:text-slate-200"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-1 flex-wrap">
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-slate-600" />
                  <button
                    onClick={() => navigateTo('/' + breadcrumbs.slice(0, index + 1).join('/'))}
                    className="px-3 py-1 neumorph-btn text-sm text-slate-300 hover:text-white"
                  >
                    {crumb}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neumorph-input pl-10 py-2 text-sm"
              />
            </div>
            <button
              onClick={() => { setIsCreatingFolder(true); setShowNewFileModal(true); }}
              className="neumorph-btn flex items-center gap-2"
            >
              <Folder className="w-4 h-4" />
              新建文件夹
            </button>
            <button
              onClick={() => { setIsCreatingFolder(false); setShowNewFileModal(true); }}
              className="neumorph-btn flex items-center gap-2"
            >
              <File className="w-4 h-4" />
              新建文件
            </button>
          </div>
        </div>
      </div>

      {/* 文件列表 */}
      <div className="neumorph-card animate-fade-in delay-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm">名称</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm hidden md:table-cell">大小</th>
                <th className="text-left py-4 px-4 text-slate-400 font-medium text-sm hidden lg:table-cell">修改时间</th>
                <th className="text-right py-4 px-4 text-slate-400 font-medium text-sm">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles?.map((file: FileItem, index: number) => (
                <tr
                  key={file.path}
                  className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer animate-scale-in ${
                    selectedFiles.includes(file.path) ? 'bg-sky-500/10' : ''
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                  onClick={() => {
                    if (file.isDirectory) {
                      navigateTo(file.path);
                    }
                  }}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.path)}
                        onChange={(e) => {
                          e.stopPropagation();
                          setSelectedFiles(prev =>
                            e.target.checked
                              ? [...prev, file.path]
                              : prev.filter(p => p !== file.path)
                          );
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-500 focus:ring-offset-0"
                      />
                      {getFileIcon(file)}
                      <span className="font-medium">{file.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-sm hidden md:table-cell">
                    {file.isDirectory ? '-' : formatBytes(file.size)}
                  </td>
                  <td className="py-4 px-4 text-slate-400 text-sm hidden lg:table-cell">
                    {formatDate(file.modified)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {!file.isDirectory && (
                        <>
                          <button
                            onClick={() => window.open(`/api/files/download?path=${encodeURIComponent(file.path)}`)}
                            className="p-2 neumorph-btn text-sky-400 hover:bg-sky-500/10"
                            title="下载"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 neumorph-btn text-green-400 hover:bg-green-500/10"
                            title="查看"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 neumorph-btn text-yellow-400 hover:bg-yellow-500/10"
                            title="编辑"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(file.path);
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

        {(!filteredFiles || filteredFiles.length === 0) && (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">此目录为空</p>
          </div>
        )}
      </div>

      {/* 新建文件/文件夹模态框 */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="neumorph-card w-full max-w-md mx-4">
            <h3 className="text-xl font-bold mb-4">
              {isCreatingFolder ? '新建文件夹' : '新建文件'}
            </h3>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="输入名称..."
              className="neumorph-input mb-4"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="flex gap-3">
              <button onClick={handleCreate} className="flex-1 neumorph-btn primary">
                创建
              </button>
              <button
                onClick={() => {
                  setShowNewFileModal(false);
                  setNewFileName('');
                }}
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

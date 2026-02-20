import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Database,
  Globe,
  Shield,
  Save,
  Moon,
  Sun,
  Monitor,
  Wifi,
  Server,
  Cpu,
  HardDrive,
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    hostname: '',
    timezone: 'UTC',
    theme: 'dark',
    language: 'zh-CN',
    dockerEnabled: false,
    autoStart: true,
    notifications: true,
    emailAlerts: false,
    email: '',
  });

  const queryClient = useQueryClient();

  const { data: systemInfo } = useQuery({
    queryKey: ['systemInfo'],
    queryFn: async () => {
      const { data } = await axios.get('/api/system/info');
      return data;
    },
  });

  const saveSettingsMutation = useMutation({
    mutationFn: async (newSettings: any) => {
      const { data } = await axios.post('/api/settings', newSettings);
      return data;
    },
    onSuccess: () => {
      toast.success('设置已保存');
      queryClient.invalidateQueries({ queryKey: ['systemInfo'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || '保存失败');
    },
  });

  const handleSave = () => {
    saveSettingsMutation.mutate(settings);
  };

  const tabs = [
    { id: 'general', label: '通用设置', icon: SettingsIcon },
    { id: 'account', label: '账户安全', icon: User },
    { id: 'notification', label: '通知提醒', icon: Bell },
    { id: 'system', label: '系统配置', icon: Server },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold mb-2">设置</h1>
        <p className="text-slate-400">配置系统参数和偏好设置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 侧边导航 */}
        <div className="lg:col-span-1">
          <div className="neumorph-card p-2 animate-scale-in">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-sky-500/20 to-sky-500/10 text-sky-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* 系统信息卡片 */}
          <div className="neumorph-card mt-6 animate-scale-in delay-100">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" />
              系统信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">主机名</span>
                <span className="font-medium">{systemInfo?.os?.hostname || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">操作系统</span>
                <span className="font-medium">{systemInfo?.os?.distro || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">架构</span>
                <span className="font-medium">{systemInfo?.os?.arch || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">运行时间</span>
                <span className="font-medium">
                  {systemInfo?.uptime ? `${Math.floor(systemInfo.uptime / 86400)}天` : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 设置内容 */}
        <div className="lg:col-span-3">
          {/* 通用设置 */}
          {activeTab === 'general' && (
            <div className="neumorph-card animate-fade-in">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-sky-400" />
                通用设置
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-slate-400 mb-2">主题模式</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'light' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Sun className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">浅色</span>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'dark' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Moon className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">深色</span>
                    </button>
                    <button
                      onClick={() => setSettings({ ...settings, theme: 'auto' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        settings.theme === 'auto'
                          ? 'border-sky-500 bg-sky-500/10'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <Monitor className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm">自动</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">语言</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                    className="neumorph-input"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="zh-TW">繁體中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-2">时区</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                    className="neumorph-input"
                  >
                    <option value="UTC">UTC</option>
                    <option value="Asia/Shanghai">Asia/Shanghai (北京时间)</option>
                    <option value="Asia/Hong_Kong">Asia/Hong_Kong</option>
                    <option value="Asia/Tokyo">Asia/Tokyo</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={handleSave} className="neumorph-btn primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存设置
                </button>
              </div>
            </div>
          )}

          {/* 账户安全 */}
          {activeTab === 'account' && (
            <div className="neumorph-card animate-fade-in">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-400" />
                账户安全
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">用户名</label>
                    <input
                      type="text"
                      defaultValue="admin"
                      className="neumorph-input"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-2">邮箱</label>
                    <input
                      type="email"
                      defaultValue="admin@vantacore.local"
                      className="neumorph-input"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="font-semibold mb-4">修改密码</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">当前密码</label>
                      <input
                        type="password"
                        className="neumorph-input"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">新密码</label>
                      <input
                        type="password"
                        className="neumorph-input"
                        placeholder="至少 6 位字符"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">确认新密码</label>
                      <input
                        type="password"
                        className="neumorph-input"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button className="neumorph-btn primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存更改
                </button>
              </div>
            </div>
          )}

          {/* 通知提醒 */}
          {activeTab === 'notification' && (
            <div className="neumorph-card animate-fade-in">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Bell className="w-5 h-5 text-green-400" />
                通知提醒
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 neumorph-card">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-sky-400" />
                    <div>
                      <p className="font-medium">系统通知</p>
                      <p className="text-sm text-slate-400">接收系统事件和更新通知</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications}
                      onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 neumorph-card">
                  <div className="flex items-center gap-3">
                    <Wifi className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="font-medium">邮件提醒</p>
                      <p className="text-sm text-slate-400">通过邮件接收重要通知</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailAlerts}
                      onChange={(e) => setSettings({ ...settings, emailAlerts: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                {settings.emailAlerts && (
                  <div className="p-4 neumorph-card">
                    <label className="block text-sm text-slate-400 mb-2">通知邮箱</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="neumorph-input"
                      placeholder="your@email.com"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={handleSave} className="neumorph-btn primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存设置
                </button>
              </div>
            </div>
          )}

          {/* 系统配置 */}
          {activeTab === 'system' && (
            <div className="neumorph-card animate-fade-in">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Server className="w-5 h-5 text-orange-400" />
                系统配置
              </h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 neumorph-card">
                  <div className="flex items-center gap-3">
                    <Container className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="font-medium">Docker 支持</p>
                      <p className="text-sm text-slate-400">启用 Docker 容器管理功能</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.dockerEnabled}
                      onChange={(e) => setSettings({ ...settings, dockerEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 neumorph-card">
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-green-400" />
                    <div>
                      <p className="font-medium">开机自启</p>
                      <p className="text-sm text-slate-400">系统启动时自动运行面板</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.autoStart}
                      onChange={(e) => setSettings({ ...settings, autoStart: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                  </label>
                </div>

                <div className="p-4 neumorph-card">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-sky-400" />
                    存储使用
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">系统盘</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">数据盘</span>
                        <span>28%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" style={{ width: '28%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button onClick={handleSave} className="neumorph-btn primary flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  保存设置
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Container({ className, children }: any) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

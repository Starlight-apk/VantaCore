import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Server, Lock, User, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (token: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const { data } = await axios.post(endpoint, formData);
      
      onLogin(data.token);
      toast.success(isRegister ? '注册成功！' : '欢迎回来！');
      navigate('/');
    } catch (error: any) {
      toast.error(error.response?.data?.error || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 rounded-2xl neumorph-card">
            <Server className="w-10 h-10 text-sky-400" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">VantaCore</h1>
          <p className="text-slate-400 mt-2">现代服务器管理面板</p>
        </div>

        {/* 登录表单 */}
        <div className="neumorph-card animate-slide-in-left">
          <h2 className="text-xl font-semibold mb-6 text-center">
            {isRegister ? '创建账户' : '欢迎回来'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-400 ml-2">用户名</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="请输入用户名"
                  className="neumorph-input pl-12"
                  required
                />
              </div>
            </div>

            {isRegister && (
              <div className="space-y-2">
                <label className="text-sm text-slate-400 ml-2">邮箱</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="请输入邮箱"
                  className="neumorph-input"
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-slate-400 ml-2">密码</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="请输入密码"
                  className="neumorph-input pl-12"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full neumorph-btn primary flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  {isRegister ? '注册' : '登录'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-sm text-sky-400 hover:text-sky-300 transition-colors"
            >
              {isRegister ? '已有账户？去登录' : '没有账户？去注册'}
            </button>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center mt-8 text-slate-500 text-sm animate-fade-in delay-200">
          <p>© 2024 VantaCore. All rights reserved.</p>
          <p className="mt-1">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

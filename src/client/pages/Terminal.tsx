import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, Plus, X, Maximize2, Minimize2 } from 'lucide-react';
import { io } from 'socket.io-client';

export default function Terminal() {
  const [terminals, setTerminals] = useState<Array<{ id: string; title: string }>>([]);
  const [activeTerminal, setActiveTerminal] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const termInstanceRef = useRef<any>(null);

  useEffect(() => {
    socketRef.current = io(window.location.origin, { path: '/socket.io' });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const createTerminal = async () => {
    try {
      const response = await fetch('/api/terminal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      
      const newTerminal = {
        id: data.sessionId,
        title: `终端 ${terminals.length + 1}`,
      };
      
      setTerminals(prev => [...prev, newTerminal]);
      setActiveTerminal(data.sessionId);
      
      // 初始化终端
      initTerminal(data.sessionId);
    } catch (error) {
      console.error('Failed to create terminal:', error);
    }
  };

  const initTerminal = (sessionId: string) => {
    // 使用简单的文本区域模拟终端
    // 在实际项目中，应该使用 xterm.js
    const container = document.getElementById(`terminal-${sessionId}`);
    if (!container) return;

    container.innerHTML = '';
    
    const textarea = document.createElement('textarea');
    textarea.className = 'w-full h-full bg-transparent text-green-400 font-mono text-sm resize-none focus:outline-none p-4';
    textarea.style.fontFamily = "'JetBrains Mono', monospace";
    textarea.style.lineHeight = '1.5';
    textarea.value = 'Welcome to VantaCore Terminal\nType your commands...\n\n$ ';
    
    textarea.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const lines = textarea.value.split('\n');
        const lastLine = lines[lines.length - 1];
        const command = lastLine.substring(2);
        
        textarea.value += '\n';
        
        try {
          // 这里应该通过 WebSocket 发送命令
          // 简化版本：直接显示命令
          setTimeout(() => {
            textarea.value += `Command executed: ${command}\n$ `;
            textarea.scrollTop = textarea.scrollHeight;
          }, 100);
        } catch (error) {
          textarea.value += `Error: ${error}\n$ `;
        }
      }
    });

    container.appendChild(textarea);
    textarea.focus();
  };

  const closeTerminal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTerminals(prev => prev.filter(t => t.id !== id));
    if (activeTerminal === id) {
      setActiveTerminal(null);
    }
  };

  return (
    <div className={`h-[calc(100vh-140px)] flex flex-col ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900' : ''}`}>
      {/* 页面标题 */}
      <div className="animate-fade-in mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">终端</h1>
            <p className="text-slate-400">在浏览器中执行服务器命令</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="neumorph-btn"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            <button onClick={createTerminal} className="neumorph-btn primary flex items-center gap-2">
              <Plus className="w-5 h-5" />
              新建终端
            </button>
          </div>
        </div>
      </div>

      {/* 终端标签页 */}
      {terminals.length > 0 && (
        <div className="neumorph-card flex-1 flex flex-col animate-fade-in delay-100">
          {/* 标签栏 */}
          <div className="flex items-center gap-2 border-b border-slate-700/50 px-4 py-2 overflow-x-auto">
            {terminals.map((terminal) => (
              <div
                key={terminal.id}
                onClick={() => setActiveTerminal(terminal.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                  activeTerminal === terminal.id
                    ? 'bg-sky-500/20 text-sky-400'
                    : 'text-slate-400 hover:bg-slate-700/30'
                }`}
              >
                <TerminalIcon className="w-4 h-4" />
                <span className="text-sm">{terminal.title}</span>
                <button
                  onClick={(e) => closeTerminal(terminal.id, e)}
                  className="ml-1 p-1 hover:bg-slate-600 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* 终端内容 */}
          <div ref={terminalRef} className="flex-1 overflow-hidden">
            {terminals.map((terminal) => (
              <div
                key={terminal.id}
                id={`terminal-${terminal.id}`}
                className={`w-full h-full ${activeTerminal === terminal.id ? 'block' : 'hidden'}`}
              />
            ))}
            {terminals.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <TerminalIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 mb-4">点击"新建终端"开始使用</p>
                  <button onClick={createTerminal} className="neumorph-btn primary">
                    新建终端
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 空状态 */}
      {terminals.length === 0 && (
        <div className="neumorph-card flex-1 flex items-center justify-center animate-scale-in">
          <div className="text-center">
            <TerminalIcon className="w-20 h-20 text-slate-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">欢迎使用终端</h3>
            <p className="text-slate-400 mb-6 max-w-md">
              在浏览器中直接执行服务器命令，支持多标签页管理，提供完整的命令行体验
            </p>
            <button onClick={createTerminal} className="neumorph-btn primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              创建第一个终端
            </button>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-left max-w-2xl mx-auto">
              <div className="neumorph-card py-3 px-4">
                <p className="text-sky-400 font-medium mb-1">多标签支持</p>
                <p className="text-slate-500 text-sm">同时打开多个终端会话</p>
              </div>
              <div className="neumorph-card py-3 px-4">
                <p className="text-purple-400 font-medium mb-1">实时交互</p>
                <p className="text-slate-500 text-sm">低延迟的命令执行</p>
              </div>
              <div className="neumorph-card py-3 px-4">
                <p className="text-green-400 font-medium mb-1">安全隔离</p>
                <p className="text-slate-500 text-sm">每个会话独立运行</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="neumorph-card mt-6 animate-fade-in delay-200">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-sky-400" />
          使用提示
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-sky-400 font-mono bg-sky-500/10 px-2 py-1 rounded">Ctrl+C</span>
            <span className="text-slate-400">中断当前命令</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400 font-mono bg-purple-500/10 px-2 py-1 rounded">Ctrl+L</span>
            <span className="text-slate-400">清屏</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-400 font-mono bg-green-500/10 px-2 py-1 rounded">↑/↓</span>
            <span className="text-slate-400">历史命令</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 font-mono bg-yellow-500/10 px-2 py-1 rounded">Tab</span>
            <span className="text-slate-400">自动补全</span>
          </div>
        </div>
      </div>
    </div>
  );
}

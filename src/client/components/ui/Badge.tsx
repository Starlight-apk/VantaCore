import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  const variantClasses = {
    default: 'bg-slate-500/20 text-slate-300',
    success: 'bg-green-500/20 text-green-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    error: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'running' | 'stopped' | 'paused' | 'error' | 'installing';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    running: { label: '运行中', variant: 'success' as const },
    stopped: { label: '已停止', variant: 'default' as const },
    paused: { label: '已暂停', variant: 'warning' as const },
    error: { label: '错误', variant: 'error' as const },
    installing: { label: '安装中', variant: 'info' as const },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}

import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export function Spinner({ size = 'md', color = 'text-sky-400' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={`${sizeClasses[size]} ${color} animate-spin`}>
      <svg className="w-full h-full" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          className="opacity-75"
        />
      </svg>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
}

export function LoadingOverlay({ isLoading, message = '加载中...' }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="neumorph-card py-6 px-8 text-center">
        <Spinner size="lg" />
        {message && <p className="mt-4 text-slate-300">{message}</p>}
      </div>
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl neumorph-card mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && <p className="text-slate-400 mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

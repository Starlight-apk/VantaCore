import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  color = 'from-sky-500 to-sky-400',
  size = 'md',
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">{value}</span>
          <span className="text-slate-400">{percentage.toFixed(1)}%</span>
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-700 overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showLabel?: boolean;
  label?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#0ea5e9',
  showLabel = true,
  label,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#334155"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      {showLabel && (
        <div className="absolute text-center">
          <span className="text-2xl font-bold">{percentage.toFixed(0)}%</span>
          {label && <p className="text-xs text-slate-400 mt-1">{label}</p>}
        </div>
      )}
    </div>
  );
}

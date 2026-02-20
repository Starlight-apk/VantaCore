import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, subtitle, action }: CardProps) {
  return (
    <div className={`neumorph-card ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="font-semibold text-lg">{title}</h3>}
            {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number;
  color?: string;
}

export function StatCard({ icon, title, value, subtitle, trend, color = 'bg-gradient-to-br from-blue-500 to-blue-600' }: StatCardProps) {
  return (
    <div className="neumorph-card">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend > 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-slate-400 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

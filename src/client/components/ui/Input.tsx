import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-slate-400 mb-2 ml-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`neumorph-input ${icon ? 'pl-12' : ''} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-400 text-sm mt-1 ml-2">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-slate-400 mb-2 ml-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`neumorph-input ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-sm mt-1 ml-2">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-slate-400 mb-2 ml-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={`neumorph-input ${error ? 'border-red-500' : ''} ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-red-400 text-sm mt-1 ml-2">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, disabled = false }: SwitchProps) {
  return (
    <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only peer"
      />
      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
      {label && <span className="ml-3 text-sm text-slate-300">{label}</span>}
    </label>
  );
}

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tactile' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold select-none transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2 rounded-xl gap-2',
    lg: 'text-base px-6 py-3 rounded-xl gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm active:translate-y-px',
    tactile: 'bg-blue-600 hover:bg-blue-500 text-white btn-tactile',
    secondary: 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:translate-y-px',
    outline: 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm active:translate-y-px',
    ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
    destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm active:translate-y-px',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
    </button>
  );
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'emerald' | 'blue' | 'slate' | 'amber' | 'rose' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'emerald',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantStyles = {
    emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    slate: 'bg-slate-100 text-slate-700 border border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border border-rose-200',
    outline: 'bg-white text-slate-600 border border-slate-200',
  };

  const dotColors = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-600',
    slate: 'bg-slate-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold uppercase tracking-wider rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`size-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'hero' | 'interactive';
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6',
    subtle: 'bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5',
    hero: 'bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8',
    interactive: 'bg-white border border-slate-200 hover:border-blue-400 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer p-5 sm:p-6',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

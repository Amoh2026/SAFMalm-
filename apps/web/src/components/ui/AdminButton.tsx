'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'destructive' | 'success' | 'warning' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface AdminButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-blue-900 hover:bg-blue-800 text-white border border-blue-900 shadow-sm',
  secondary: 'bg-white hover:bg-blue-50 text-blue-700 border border-blue-300 shadow-sm',
 destructive: 'bg-red-100 hover:bg-red-200 text-red-700 border border-red-300 shadow-sm',
  success: 'bg-green-600 hover:bg-green-700 text-white border border-green-700 shadow-sm',
  warning: 'bg-amber-500 hover:bg-amber-600 text-white border border-amber-600 shadow-sm',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-transparent',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export const AdminButton = forwardRef<HTMLButtonElement, AdminButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
        {children}
      </button>
    );
  }
);

AdminButton.displayName = 'AdminButton';
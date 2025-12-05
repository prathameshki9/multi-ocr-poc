import React from 'react';
import { cn } from '@/utils/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'outline';
};

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300',
  outline:
    'border border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-700',
};

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  children,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed',
      variantClasses[variant],
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;


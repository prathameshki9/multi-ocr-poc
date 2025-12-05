import React from 'react';
import { cn } from '@/utils/utils';

type CardProps = {
  title?: string;
  className?: string;
  children: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
};

export const Card: React.FC<CardProps> = ({
  title,
  className,
  headerClassName,
  contentClassName,
  children,
}) => (
  <div className={cn('flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm', className)}>
    {title && (
      <div
        className={cn(
          'border-b border-slate-200 px-5 py-4 text-sm font-semibold text-slate-800',
          headerClassName
        )}
      >
        {title}
      </div>
    )}
    <div className={cn('p-5', contentClassName)}>{children}</div>
  </div>
);

export default Card;


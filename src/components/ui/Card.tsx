import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  glow?: boolean;
}

export default function Card({ className, glass, glow, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border',
        glass
          ? 'bg-white/5 backdrop-blur-md border-white/10'
          : 'bg-gray-800/60 border-gray-700/50',
        glow && 'shadow-lg shadow-emerald-500/10',
        className
      )}
      {...props}
    />
  );
}

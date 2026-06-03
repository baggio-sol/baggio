import { cn } from '@/lib/utils';
import { HTMLAttributes } from 'react';

const glowStyles: Record<string, string> = {
  purple: '0 0 30px rgba(139,92,246,0.20)',
  blue: '0 0 30px rgba(59,130,246,0.20)',
  spice: '0 0 30px rgba(251,113,133,0.20)',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'purple' | 'blue' | 'spice';
}

export default function Card({ className, glow, style, ...props }: CardProps) {
  return (
    <div
      className={cn('rounded-2xl glass', className)}
      style={{
        ...(glow ? { boxShadow: glowStyles[glow] } : {}),
        ...style,
      }}
      {...props}
    />
  );
}

import { Team } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TeamFlagProps {
  team: Team | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  className?: string;
}

const sizes = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-4xl',
  xl: 'text-5xl',
};

const nameSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export default function TeamFlag({ team, size = 'md', showName = false, className }: TeamFlagProps) {
  if (!team) {
    return (
      <div className={cn('flex flex-col items-center gap-1', className)}>
        <div className={cn('flex items-center justify-center rounded-full bg-gray-700 border-2 border-dashed border-gray-600', {
          'w-10 h-10 text-lg': size === 'sm',
          'w-14 h-14 text-xl': size === 'md',
          'w-16 h-16 text-2xl': size === 'lg',
          'w-20 h-20 text-3xl': size === 'xl',
        })}>
          <span className="text-gray-500">?</span>
        </div>
        {showName && <span className={cn('text-gray-500 font-medium', nameSizes[size])}>TBD</span>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className={cn('flex items-center justify-center rounded-full border-2 overflow-hidden', {
        'w-10 h-10': size === 'sm',
        'w-14 h-14': size === 'md',
        'w-16 h-16': size === 'lg',
        'w-20 h-20': size === 'xl',
      })} style={{ borderColor: '#6b7280', background: 'rgba(107,114,128,0.13)' }}>
        <span className={sizes[size]}>{team.flag}</span>
      </div>
      {showName && (
        <span className={cn('font-semibold text-white text-center', nameSizes[size])}>
          {team.name}
        </span>
      )}
    </div>
  );
}

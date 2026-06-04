import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import Link from 'next/link';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

const sizeClasses = {
  sm: 'px-4 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-4 text-base',
};

const variantClasses = {
  primary: 'font-bold transition-opacity hover:opacity-90 active:scale-95',
  ghost: 'glass text-[#f5f3ff] font-bold hover:bg-white/10 transition-all active:scale-95',
  outline: 'border border-[rgba(255,255,255,0.20)] text-[#f5f3ff] font-bold hover:bg-white/10 transition-all active:scale-95',
};

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { background: '#ffffff', color: '#111827' },
  ghost: {},
  outline: {},
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', href, children, ...props }, ref) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-full font-semibold focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
      sizeClasses[size],
      variantClasses[variant],
      className
    );

    if (href) {
      return (
        <Link href={href} className={classes} style={variantStyles[variant]}>
          {children}
        </Link>
      );
    }

    return (
      <button
        ref={ref}
        className={classes}
        style={variantStyles[variant]}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

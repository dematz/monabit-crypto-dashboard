import { cn } from '@/lib/utils';

type CryptoIconProps = {
  src: string;
  symbol: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-base',
  lg: 'h-11 w-11 text-xl',
};

export function CryptoIcon({ src, symbol, size = 'md', className }: CryptoIconProps) {
  const isUrl = src.startsWith('http');

  if (isUrl) {
    return (
      <img
        src={src}
        alt={symbol}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={cn(
        'grid place-items-center rounded-full bg-accent font-semibold',
        sizeClasses[size],
        className,
      )}
    >
      {src}
    </div>
  );
}

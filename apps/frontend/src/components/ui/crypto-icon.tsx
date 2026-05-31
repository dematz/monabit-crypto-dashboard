import { useState } from 'react';
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
  const [imgError, setImgError] = useState(false);
  const isUrl = src.startsWith('http');

  if (isUrl && !imgError) {
    return (
      <img
        src={src}
        alt={symbol}
        onError={() => setImgError(true)}
        className={cn('rounded-full object-cover', sizeClasses[size], className)}
        loading="lazy"
      />
    );
  }

  const initials = symbol.slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        'grid place-items-center rounded-full bg-accent font-semibold',
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}

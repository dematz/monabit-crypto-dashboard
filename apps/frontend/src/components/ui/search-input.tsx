import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchInputProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  'aria-label'?: string;
  className?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  'aria-label': ariaLabel,
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        className="h-9 w-48 rounded-lg border border-border bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

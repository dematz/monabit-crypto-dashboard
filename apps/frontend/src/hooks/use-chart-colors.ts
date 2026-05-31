import { useAppStore } from '@/stores/app-store';

type ChartColors = {
  foreground: string;
  mutedForeground: string;
  border: string;
  popover: string;
  popoverForeground: string;
  success: string;
  danger: string;
};

export function useChartColors(): ChartColors {
  const theme = useAppStore((s) => s.theme);

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    return {
      foreground: 'oklch(0.97 0.005 250)',
      mutedForeground: 'oklch(0.68 0.02 260)',
      border: 'oklch(1 0 0 / 8%)',
      popover: 'oklch(0.22 0.025 265)',
      popoverForeground: 'oklch(0.97 0.005 250)',
      success: 'oklch(0.82 0.22 152)',
      danger: 'oklch(0.7 0.24 18)',
    };
  }

  return {
    foreground: 'oklch(0.18 0.02 260)',
    mutedForeground: 'oklch(0.5 0.02 260)',
    border: 'oklch(0.92 0.01 250)',
    popover: 'oklch(1 0 0)',
    popoverForeground: 'oklch(0.18 0.02 260)',
    success: 'oklch(0.72 0.2 155)',
    danger: 'oklch(0.65 0.24 22)',
  };
}

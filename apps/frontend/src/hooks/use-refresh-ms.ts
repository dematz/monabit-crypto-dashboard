import { useAppStore } from '@/stores/app-store';

export function useRefreshMs() {
  return useAppStore((s) => s.refreshInterval) * 1000;
}

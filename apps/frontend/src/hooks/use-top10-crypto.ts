import { useQuery } from '@tanstack/react-query';
import { fetchTop10 } from '@/services/crypto-api';
import { toDisplayAsset, type DisplayCryptoAsset } from '@/types';
import { useRefreshMs } from '@/hooks/use-refresh-ms';

export function useTop10Crypto() {
  const refreshMs = useRefreshMs();
  return useQuery({
    queryKey: ['top-crypto'],
    queryFn: async () => {
      const res = await fetchTop10();
      return res.data.map((a, i) => toDisplayAsset(a, i));
    },
    refetchInterval: refreshMs,
  });
}

export type { DisplayCryptoAsset };

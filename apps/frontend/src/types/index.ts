export type { Theme, Currency, SessionUser } from '@/stores/app-store';

export type DisplayCryptoAsset = {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  logo: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
};

export function toDisplayAsset(
  api: {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    total_volume: number;
    price_change_percentage_24h: number;
    image: string;
  },
  index: number,
): DisplayCryptoAsset {
  const seed = (n: number) => {
    const arr: number[] = [];
    let v = api.current_price;
    for (let i = 0; i < 40; i++) {
      v += (Math.sin(i * 0.6 + n) + Math.cos(i * 0.27 + n * 1.7)) * api.current_price * 0.008;
      arr.push(Number(v.toFixed(2)));
    }
    return arr;
  };

  return {
    id: api.id,
    rank: index + 1,
    name: api.name,
    symbol: api.symbol.toUpperCase(),
    logo: api.image || api.symbol.charAt(0).toUpperCase(),
    price: api.current_price,
    change24h: api.price_change_percentage_24h,
    marketCap: api.market_cap,
    volume24h: api.total_volume,
    sparkline: seed(index),
  };
}

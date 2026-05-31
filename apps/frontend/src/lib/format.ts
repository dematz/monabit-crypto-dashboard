export const formatCurrency = (value: number, currency: 'USD' | 'EUR' = 'USD') => {
  const symbol = currency === 'USD' ? '$' : '€';
  const locale = currency === 'USD' ? 'en-US' : 'de-DE';
  if (value === 0) return `${symbol}0.00`;
  if (value >= 1) {
    return `${symbol}${value.toLocaleString(locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${symbol}${value.toLocaleString(locale, {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  })}`;
};

export const formatCompact = (value: number, currency: 'USD' | 'EUR' = 'USD') => {
  const symbol = currency === 'USD' ? '$' : '€';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  if (abs >= 1e12) return `${sign}${symbol}${(abs / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `${sign}${symbol}${(abs / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `${sign}${symbol}${(abs / 1e6).toFixed(2)}M`;
  if (abs >= 1e3) return `${sign}${symbol}${(abs / 1e3).toFixed(2)}K`;
  return `${sign}${symbol}${abs.toFixed(2)}`;
};

export const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;

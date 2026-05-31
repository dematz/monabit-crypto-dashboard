export function generateSparkline(changePercent: number, points = 20): number[] {
  const slope = changePercent / 100;
  const noise = 0.05;
  const baseline = 1;
  const result: number[] = [];
  for (let i = 0; i < points; i++) {
    const t = i / (points - 1);
    const trend = baseline + slope * t;
    const jitter = Math.sin(i * 2.5) * noise + Math.cos(i * 1.3) * noise * 0.6;
    result.push(trend + jitter);
  }
  return result;
}

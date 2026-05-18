export function formatPrice(price: number): string {
  return `${price.toLocaleString("ko-KR")}원`;
}

export function formatPriceWithSymbol(price: number): string {
  return `₩${price.toLocaleString("ko-KR")}`;
}

export function formatChangeRate(rate: number): string {
  // 0.00%일 때는 부호 없이 표시
  if (rate === 0 || Math.abs(rate) < 0.01) {
    return "0.00%";
  }
  const sign = rate > 0 ? "+" : "";
  return `${sign}${rate.toFixed(2)}%`;
}

export function formatTradingValue(value: number): string {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  if (safeValue <= 0) {
    return "-";
  }
  if (safeValue >= 1_0000_0000_0000) {
    const jo = safeValue / 1_0000_0000_0000;
    return `${jo >= 10 ? jo.toFixed(0) : jo.toFixed(1)}조`;
  }
  if (safeValue >= 1_0000_0000) {
    return `${Math.round(safeValue / 1_0000_0000).toLocaleString("ko-KR")}억`;
  }
  if (safeValue >= 1_0000) {
    return `${Math.round(safeValue / 1_0000).toLocaleString("ko-KR")}만`;
  }
  return safeValue.toLocaleString("ko-KR");
}

export function formatVolume(volume: number): string {
  if (!Number.isFinite(volume) || volume <= 0) {
    return "-";
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(1)}M`;
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`;
  }
  return volume.toString();
}

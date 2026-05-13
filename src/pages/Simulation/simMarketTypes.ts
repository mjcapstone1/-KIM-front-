export interface SimStock {
  id: string;
  name: string;
  code: string;
  volume: number;
  price: number;
  changeRate: number;
}

export const formatWon = (value: number) => `${value.toLocaleString("ko-KR")}원`;

export const formatVolume = (volume: number) => {
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return String(volume);
};

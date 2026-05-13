import type { StockId } from "@/api/market";
import { assetApiClient } from "@/api/asset/client";

export interface TopHoldingStock {
  stockId: StockId;
  name: string;
  totalAmount: number;
}

export interface TopHoldingStockListResponse {
  totalElements: number;
  items: TopHoldingStock[];
}

export async function fetchTopHoldingStocks(): Promise<TopHoldingStock[]> {
  const res = await assetApiClient.get<TopHoldingStockListResponse | TopHoldingStock[]>("/assets/top-100");
  if (Array.isArray(res.data)) {
    return res.data;
  }
  return res.data.items ?? [];
}

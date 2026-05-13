import { tradeApiClient } from "@/api/trade/client";
import type { StockId } from "@/api/market";

// --- Types ---

export type TradeType = "NORMAL" | "RESERVED" | "CANCELLED";
export type TransactionType = "BUY" | "SELL";
export type TradeId = string;

export interface TransactionRequest {
  stockId: StockId;
  amount: number;
  price: number;
  portfolioId: number;
  tradeType: "NORMAL" | "RESERVED";
  transactionType: TransactionType;
}

export interface TradeResponse {
  tradeId: TradeId;
  orderId?: TradeId;
  stockId: StockId;
  amount: number;
  price: number;
  portfolioId?: number;
  userId?: string;
  tradeType: TradeType;
  transactionType: TransactionType;
  quantity?: number;
  type?: "buy" | "sell";
  priceType?: "market" | "limit" | "scheduled";
  total?: number;
  totalKrw?: number;
  status?: string;
  kind?: "auto" | "manual";
  autoCondition?: string | null;
  triggerPrice?: number | null;
  stockName?: string;
  createdAt?: string | null;
}

export interface TradeHistoryResponse {
  tradeId: TradeId;
  stockId: StockId;
  stockName?: string;
  amount: number;
  price: number;
  portfolioId?: number;
  transactionType: TransactionType;
  tradeType: TradeType;
  createdAt: string;
}

// --- API ---

export const tradeApi = {
  /** 신규 거래 주문 생성: POST /api/trade/trades */
  createTrade: async (request: TransactionRequest): Promise<TradeResponse> => {
    const res = await tradeApiClient.post<TradeResponse>("/trades", request);
    return res.data;
  },

  /** 거래 상태 조회: GET /api/trade/trades/{tradeId} */
  getTradeStatus: async (tradeId: TradeId): Promise<TradeResponse> => {
    const res = await tradeApiClient.get<TradeResponse>(`/trades/${tradeId}`);
    return res.data;
  },

  /** 거래 취소: DELETE /api/trade/trades/{tradeId} */
  cancelTrade: async (tradeId: TradeId): Promise<TradeResponse> => {
    const res = await tradeApiClient.delete<TradeResponse>(`/trades/${tradeId}`);
    return res.data;
  },

  /** 예약 종목 ID 목록 조회: GET /api/trade/trades/reserved/stock-ids */
  getReservedStockIds: async (): Promise<StockId[]> => {
    const res = await tradeApiClient.get<StockId[]>("/trades/reserved/stock-ids");
    return Array.isArray(res.data) ? res.data : [];
  },

  /** 거래 기록 조회 (월별, 최신순): GET /api/trade/trades/history */
  getTradeHistory: async (year: number, month: number): Promise<TradeHistoryResponse[]> => {
    const res = await tradeApiClient.get<TradeHistoryResponse[]>("/trades/history", {
      params: { year, month },
    });
    return res.data;
  },
};

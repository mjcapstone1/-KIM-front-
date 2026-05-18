import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { TransactionRequest } from "@/api/trade";
import type { StockId } from "@/api/market";
import { useStockHolding, useWalletBalance } from "@/hooks/usePortfolioQueries";
import { useCreateTrade } from "@/hooks/useTradeQueries";
import { cn } from "@/utils/cn";
import { getOrderStatusMeta } from "@/utils/orderStatus";

interface OrderPanelProps {
  currentPrice: number;
  stockId: StockId;
  stockName: string;
  currency?: "USD" | "KRW";
  onTradeSuccess?: () => void;
}

type OrderMode = "지정가" | "시장가" | "예약 주문";
type TradeType = "buy" | "sell";

const formatMoney = (value: number) => `₩${Math.max(0, Math.round(value)).toLocaleString("ko-KR")}`;
const formatSignedMoney = (value: number) => `${value >= 0 ? "+" : "-"}₩${Math.abs(Math.round(value)).toLocaleString("ko-KR")}`;
const formatAskBidVolume = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}K` : `${value}`;
const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const OrderPanel = ({ currentPrice, stockId, onTradeSuccess }: OrderPanelProps) => {
  const safeCurrentPrice = currentPrice > 0 ? currentPrice : 74200;
  const [tradeType, setTradeType] = useState<TradeType>("buy");
  const [orderMode, setOrderMode] = useState<OrderMode>("지정가");
  const [price, setPrice] = useState(safeCurrentPrice);
  const [quantity, setQuantity] = useState(1);
  const [orderStatus, setOrderStatus] = useState<{ type: "success" | "info" | "error"; message: string } | null>(null);
  const createTrade = useCreateTrade();
  const walletQuery = useWalletBalance();
  const holdingQuery = useStockHolding(stockId);
  const balance = toNumber(
    walletQuery.data?.withdrawableBalance ?? walletQuery.data?.balance,
    0,
  );
  const holdingQuantity = toNumber(holdingQuery.data?.quantity ?? holdingQuery.data?.amount, 0);
  const avgPrice = toNumber(holdingQuery.data?.avgPrice, 0);
  const holdingValue = toNumber(holdingQuery.data?.currentValue, safeCurrentPrice * holdingQuantity);
  const investedAmount = avgPrice * holdingQuantity;
  const profitLoss = holdingQuantity > 0 ? holdingValue - investedAmount : 0;
  const profitRate = investedAmount > 0 ? (profitLoss / investedAmount) * 100 : 0;

  useEffect(() => {
    if (safeCurrentPrice > 0) {
      const timer = window.setTimeout(() => setPrice(safeCurrentPrice), 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [safeCurrentPrice]);

  useEffect(() => {
    if (!orderStatus) return;
    const timer = window.setTimeout(() => setOrderStatus(null), 3000);
    return () => window.clearTimeout(timer);
  }, [orderStatus]);

  const stockHash = useMemo(() => String(stockId).split("").reduce((sum, char) => sum + char.charCodeAt(0), 0), [stockId]);

  const askRows = useMemo(() => (
    Array.from({ length: 5 }, (_, index) => ({
      price: Math.round(safeCurrentPrice * (1 + (5 - index) * 0.001)),
      volume: 1100 + ((index * 791 + stockHash * 137) % 4500),
    }))
  ), [safeCurrentPrice, stockHash]);

  const bidRows = useMemo(() => (
    Array.from({ length: 5 }, (_, index) => ({
      price: Math.round(safeCurrentPrice * (1 - (index + 1) * 0.001)),
      volume: 580 + ((index * 631 + stockHash * 193) % 4500),
    }))
  ), [safeCurrentPrice, stockHash]);

  const totalAmount = price * quantity;

  const changePrice = (delta: number) => {
    setPrice((prev) => Math.max(0, prev + delta));
  };

  const changeQuantity = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const setQuantityByPercent = (percent: number) => {
    const baseAmount = tradeType === "buy"
      ? balance / Math.max(price, 1)
      : holdingQuantity;
    const maxQuantity = Math.floor((baseAmount * percent) / 100);
    setQuantity(Math.max(1, maxQuantity));
  };

  const resetOrder = () => {
    setOrderMode("지정가");
    setPrice(safeCurrentPrice);
    setQuantity(1);
  };

  const handleOrder = async () => {
    if (!String(stockId).trim() || price <= 0 || quantity <= 0) {
      setOrderStatus({ type: "error", message: "주문 정보를 확인해주세요." });
      return;
    }

    if (tradeType === "buy" && totalAmount > balance) {
      setOrderStatus({ type: "error", message: "잔액이 부족합니다." });
      return;
    }

    if (tradeType === "sell" && quantity > holdingQuantity) {
      setOrderStatus({ type: "error", message: "보유 수량이 부족합니다." });
      return;
    }

    const request: TransactionRequest = {
      stockId,
      amount: quantity,
      quantity,
      price,
      portfolioId: 1,
      tradeType: orderMode === "예약 주문" ? "RESERVED" : "NORMAL",
      transactionType: tradeType === "buy" ? "BUY" : "SELL",
      priceType: orderMode === "시장가" ? "market" : orderMode === "예약 주문" ? "scheduled" : "limit",
      type: tradeType,
    };

    try {
      const order = await createTrade.mutateAsync(request);
      const meta = getOrderStatusMeta(order);
      setOrderStatus({
        type: meta.level === "pending" ? "info" : meta.level === "failed" ? "error" : "success",
        message: meta.description,
      });
      await Promise.allSettled([walletQuery.refetch(), holdingQuery.refetch()]);
      onTradeSuccess?.();
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "주문에 실패했습니다."
        : error instanceof Error
          ? error.message
          : "주문에 실패했습니다.";
      setOrderStatus({ type: "error", message });
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTradeType("buy")}
          className={cn(
            "flex-1 rounded-lg py-3 text-sm font-medium transition-colors",
            tradeType === "buy" ? "bg-[#FF0000] text-[#1D1E20]" : "bg-gray-100 text-[#909193] hover:bg-gray-200",
          )}
        >
          매수
        </button>
        <button
          type="button"
          onClick={() => setTradeType("sell")}
          className={cn(
            "flex-1 rounded-lg py-3 text-sm font-medium transition-colors",
            tradeType === "sell" ? "bg-[#001AFF] text-white" : "bg-gray-100 text-[#909193] hover:bg-gray-200",
          )}
        >
          매도
        </button>
      </div>

      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium text-[#444441]">호가</h3>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <div className="border-b border-gray-200">
            {askRows.map((row) => (
              <button key={row.price} type="button" onClick={() => setPrice(row.price)} className="flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-blue-100">
                <span className="flex-1 text-left text-[#909193]">{formatAskBidVolume(row.volume)}</span>
                <span className="flex-1 text-center font-medium text-[#1F3B70]">{row.price.toLocaleString("ko-KR")}</span>
                <span className="flex-1" />
              </button>
            ))}
          </div>
          <div className="bg-[#1F3B70] px-3 py-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A5B5D5]">현재가</span>
              <span className={cn("font-bold", tradeType === "buy" ? "text-[#FF0000]" : "text-[#42D6BA]")}>
                {safeCurrentPrice.toLocaleString("ko-KR")}
              </span>
            </div>
          </div>
          <div>
            {bidRows.map((row) => (
              <button key={row.price} type="button" onClick={() => setPrice(row.price)} className="flex w-full items-center justify-between px-3 py-1.5 text-xs transition-colors hover:bg-red-100">
                <span className="flex-1" />
                <span className="flex-1 text-center font-medium text-[#FF0000]">{row.price.toLocaleString("ko-KR")}</span>
                <span className="flex-1 text-right text-[#909193]">{formatAskBidVolume(row.volume)}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4 flex gap-2 text-xs">
        {(["지정가", "시장가", "예약 주문"] as OrderMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setOrderMode(mode);
              if (mode === "시장가") setPrice(safeCurrentPrice);
            }}
            className={cn(
              "rounded px-3 py-1.5 font-medium transition-colors",
              orderMode === mode ? "bg-[#42D6BA] text-[#1D1E20]" : "bg-gray-100 text-[#444441] hover:bg-gray-200",
            )}
          >
            {mode}
          </button>
        ))}
      </div>

      <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[#909193]">보유 잔액</span>
          <span className="font-bold text-[#1D1E20]">{walletQuery.isLoading ? "조회중..." : formatMoney(balance)}</span>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-[#444441]">주문가격</label>
          <div className="relative flex items-center">
            <button type="button" onClick={() => changePrice(-100)} disabled={orderMode === "시장가"} className="absolute left-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-[#1F3B70] text-[#1D1E20] transition-colors disabled:opacity-40">
              -
            </button>
            <input
              type="number"
              value={price}
              disabled={orderMode === "시장가"}
              onChange={(event) => setPrice(Number(event.target.value))}
              className="w-full rounded-lg border border-gray-200 bg-white px-12 py-3 text-center text-[#1D1E20] focus:border-[#42D6BA] focus:outline-none focus:ring-2 focus:ring-[#C7F3EB] disabled:bg-gray-50"
            />
            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[#909193]">원</span>
            <button type="button" onClick={() => changePrice(100)} disabled={orderMode === "시장가"} className="absolute right-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-[#42D6BA] text-[#1D1E20] transition-colors hover:bg-[#3AB8A8] disabled:opacity-40">
              +
            </button>
          </div>
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setPrice(safeCurrentPrice)} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] transition-colors hover:bg-gray-200">현재가</button>
            <button type="button" onClick={() => setPrice(Math.round(safeCurrentPrice * 1.01))} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] transition-colors hover:bg-gray-200">+1%</button>
            <button type="button" onClick={() => setPrice(Math.round(safeCurrentPrice * 0.99))} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] transition-colors hover:bg-gray-200">-1%</button>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-[#444441]">수량</label>
          <div className="relative flex items-center">
            <button type="button" onClick={() => changeQuantity(-1)} className="absolute left-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-[#42D6BA] text-[#1D1E20] transition-colors hover:bg-[#3AB8A8]">-</button>
            <input
              type="number"
              min="1"
              step="1"
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Number(event.target.value)))}
              className="w-full rounded-lg border border-gray-200 bg-white px-12 py-3 text-center text-[#1D1E20] focus:border-[#42D6BA] focus:outline-none focus:ring-2 focus:ring-[#C7F3EB]"
            />
            <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[#909193]">주</span>
            <button type="button" onClick={() => changeQuantity(1)} className="absolute right-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-[#42D6BA] text-[#1D1E20] transition-colors hover:bg-[#3AB8A8]">+</button>
          </div>
          <div className="mb-4 mt-4 grid grid-cols-4 gap-2">
            {[10, 25, 50, 100].map((percent) => (
              <button key={percent} type="button" onClick={() => setQuantityByPercent(percent)} className="rounded-lg border border-gray-200 bg-gray-100 py-2 text-[11px] font-medium text-[#444441] transition-all hover:bg-[#42D6BA] hover:text-[#1D1E20]">
                {percent === 100 ? "최대" : `${percent}%`}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {[10, 50, 100].map((amount) => (
              <button key={amount} type="button" onClick={() => setQuantity(amount)} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] transition-colors hover:bg-gray-200">
                {amount}주
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#909193]">주문 총액</span>
            <span className="text-lg font-bold text-[#1D1E20]">{formatMoney(totalAmount)}</span>
          </div>
        </div>

        {orderStatus && (
          <div
            className={cn(
              "rounded-lg p-3 text-center text-sm",
              orderStatus.type === "success" && "bg-green-100 text-green-700",
              orderStatus.type === "info" && "bg-amber-100 text-amber-800",
              orderStatus.type === "error" && "bg-red-100 text-red-700",
            )}
          >
            {orderStatus.message}
          </div>
        )}

        <button type="button" onClick={resetOrder} className="w-full rounded-lg bg-gray-100 py-2 text-sm text-[#909193] transition-colors hover:bg-gray-200">
          초기화
        </button>
        <button
          type="button"
          onClick={handleOrder}
          disabled={createTrade.isPending}
          className={cn(
            "w-full rounded-lg py-4 font-medium text-[#1D1E20] transition-colors disabled:opacity-50",
            tradeType === "buy" ? "bg-[#FF0000] hover:bg-[#FF0000]" : "bg-[#001AFF] text-white hover:bg-[#001AFF]",
          )}
        >
          {createTrade.isPending ? "주문 처리중..." : `${tradeType === "buy" ? "매수" : "매도"} 주문`}
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-4">
        <h3 className="mb-3 text-sm font-medium text-[#1D1E20]">보유 현황</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#444441]">보유 잔액</span>
            <span className="font-bold text-[#1D1E20]">{walletQuery.isLoading ? "조회중..." : formatMoney(balance)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#444441]">보유 수량</span>
            <span className="font-bold text-[#1D1E20]">{holdingQuery.isLoading ? "조회중..." : `${holdingQuantity.toLocaleString("ko-KR")}주`}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#BDBDBD]">평균 매수가</span>
            <span className="text-[#1D1E20]">{holdingQuantity > 0 ? formatMoney(avgPrice) : "-"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#BDBDBD]">평가 손익</span>
            <span className={cn("font-medium", profitLoss >= 0 ? "text-[#00A63E]" : "text-[#001AFF]")}>
              {holdingQuantity > 0 ? formatSignedMoney(profitLoss) : "-"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#BDBDBD]">수익률</span>
            <span className={cn("font-medium", profitRate >= 0 ? "text-[#00A63E]" : "text-[#001AFF]")}>
              {holdingQuantity > 0 ? `${profitRate >= 0 ? "+" : ""}${profitRate.toFixed(2)}%` : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPanel;

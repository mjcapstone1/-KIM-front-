import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import type { PortfolioAsset } from "@/api/asset";
import type { TradeResponse, TransactionRequest } from "@/api/trade";
import { useCancelTrade, useCreateTrade, useTradeHistory } from "@/hooks/useTradeQueries";
import { formatVolume, formatWon, type SimStock } from "../simMarketTypes";
import OrderStatusNotice from "./OrderStatusNotice";

type Tab = "favorites" | "holdings" | "scheduled" | "portfolio";

interface PortfolioTabsPanelProps {
  stocks: SimStock[];
  holdings: PortfolioAsset[];
  isHoldingsLoading?: boolean;
  favorites: Set<string>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectStock: (stock: SimStock) => void;
  onToggleFavorite: (stockId: string) => void;
}

type HoldingStock = SimStock & {
  quantity: number;
  avgPrice: number;
  totalValue: number;
  profitLoss: number;
};

const tabs: Array<{ key: Tab; label: string }> = [
  { key: "favorites", label: "관심 종목" },
  { key: "holdings", label: "보유 종목" },
  { key: "scheduled", label: "예약 주문" },
  { key: "portfolio", label: "포트폴리오" },
];

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getOrderId = (order: TradeResponse) => String(order.orderId ?? order.tradeId);

const getOrderSide = (order: TradeResponse): "buy" | "sell" => {
  if (order.type === "sell" || order.transactionType === "SELL") return "sell";
  return "buy";
};

const isScheduledLikeOrder = (order: TradeResponse) => {
  const status = String(order.status ?? "").toLowerCase();
  return order.tradeType === "RESERVED"
    || order.priceType === "scheduled"
    || order.priceType === "limit"
    || order.kind === "auto"
    || status === "pending"
    || status === "failed"
    || status === "canceled"
    || status === "cancelled";
};

const getOrderConditionLabel = (order: TradeResponse) => {
  const condition = String(order.autoCondition ?? "").toLowerCase();
  if (condition === "above" || condition === "gte" || condition === "up") return "지정가 이상";
  if (condition === "below" || condition === "lte" || condition === "down") return "지정가 이하";
  if (order.priceType === "limit") return getOrderSide(order) === "buy" ? "지정가 이하" : "지정가 이상";
  if (order.priceType === "scheduled") return "예약 조건";
  return "주문 조건";
};

const formatOrderDate = (value?: string | null) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const toHoldingStock = (asset: PortfolioAsset, stocks: SimStock[]): HoldingStock => {
  const ids = [asset.id, asset.stockId, asset.code].map((value) => String(value ?? "").trim());
  const matchedStock = stocks.find((stock) => ids.includes(stock.id) || ids.includes(stock.code));
  const quantity = toNumber(asset.quantity ?? asset.amount, 0);
  const currentPrice = toNumber(asset.currentPrice, matchedStock?.price ?? 0);
  const avgPrice = toNumber(asset.avgPrice, quantity > 0 ? asset.totalPrice / quantity : 0);
  const totalValue = toNumber(asset.currentValue, currentPrice * quantity);
  const invested = avgPrice * quantity;

  return {
    id: String(asset.stockId ?? asset.id),
    name: asset.name,
    code: asset.code ?? matchedStock?.code ?? String(asset.stockId ?? asset.id),
    volume: matchedStock?.volume ?? 0,
    price: currentPrice,
    changeRate: matchedStock?.changeRate ?? 0,
    quantity,
    avgPrice,
    totalValue,
    profitLoss: totalValue - invested,
  };
};

const StockRow = ({
  stock,
  favorite,
  onSelectStock,
  onToggleFavorite,
}: {
  stock: SimStock;
  favorite: boolean;
  onSelectStock: (stock: SimStock) => void;
  onToggleFavorite: (stockId: string) => void;
}) => {
  const isUp = stock.changeRate >= 0;

  return (
    <button
      type="button"
      onClick={() => onSelectStock(stock)}
      className="group w-full px-6 py-4 text-left transition-colors hover:bg-[#C7F3EB]/20"
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-4">
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => {
              event.stopPropagation();
              onToggleFavorite(stock.id);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                event.stopPropagation();
                onToggleFavorite(stock.id);
              }
            }}
            className={`transition-transform hover:scale-110 ${favorite ? "text-[#FFD166]" : "text-gray-300 hover:text-[#FFD166]"}`}
            aria-label={`${stock.name} 관심 종목 ${favorite ? "해제" : "추가"}`}
          >
            ★
          </span>
          <div className="flex-1">
            <div className="font-bold text-[#1D1E20] transition-colors group-hover:text-[#1F3B70]">{stock.name}</div>
            <div className="text-sm text-[#A5A6A9]">{stock.code}</div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="font-bold text-[#1D1E20]">{formatWon(stock.price)}</div>
            <div className="text-xs text-[#A5A6A9]">거래량 {formatVolume(stock.volume)}</div>
          </div>
          <div className={`flex min-w-[100px] items-center justify-center rounded-lg px-3 py-2 font-medium ${
            isUp ? "bg-[#D6F3E1] text-[#00A63E]" : "bg-[#FFC2C2] text-[#FF0000]"
          }`}>
            {isUp ? "+" : ""}
            {stock.changeRate.toFixed(2)}%
          </div>
        </div>
      </div>
    </button>
  );
};

const PortfolioTabsPanel = ({
  stocks,
  holdings: portfolioHoldings,
  isHoldingsLoading = false,
  favorites,
  searchQuery,
  onSearchChange,
  onSelectStock,
  onToggleFavorite,
}: PortfolioTabsPanelProps) => {
  const [activeTab, setActiveTab] = useState<Tab>("favorites");
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState({
    stockId: stocks[0]?.id ?? "1",
    type: "buy" as "buy" | "sell",
    condition: "below" as "above" | "below",
    price: "",
    quantity: "1",
  });
  const [scheduleStatus, setScheduleStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const today = useMemo(() => new Date(), []);
  const ordersQuery = useTradeHistory(today.getFullYear(), today.getMonth() + 1);
  const createTrade = useCreateTrade();
  const cancelTrade = useCancelTrade();

  const filteredStocks = stocks.filter((stock) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return stock.name.toLowerCase().includes(query) || stock.code.toLowerCase().includes(query);
  });
  const favoriteStocks = stocks.filter((stock) => favorites.has(stock.id));
  const holdings = portfolioHoldings
    .map((asset) => toHoldingStock(asset, stocks))
    .filter((holding) => holding.quantity > 0);
  const totalHoldingValue = holdings.reduce((sum, stock) => sum + stock.totalValue, 0);
  const totalProfitLoss = holdings.reduce((sum, stock) => sum + stock.profitLoss, 0);
  const totalProfitLossRate = totalHoldingValue > 0
    ? (totalProfitLoss / (totalHoldingValue - totalProfitLoss)) * 100
    : 0;
  const scheduledOrders = (ordersQuery.data ?? []).filter(isScheduledLikeOrder);

  useEffect(() => {
    if (!stocks.length) return;
    setScheduleDraft((prev) => {
      if (stocks.some((stock) => stock.id === prev.stockId)) return prev;
      return { ...prev, stockId: stocks[0].id };
    });
  }, [stocks]);

  const addScheduledOrder = async () => {
    const stock = stocks.find((item) => item.id === scheduleDraft.stockId) ?? stocks[0];
    if (!stock) return;
    const price = Number(scheduleDraft.price) || stock.price;
    const quantity = Number(scheduleDraft.quantity) || 1;
    if (price <= 0 || quantity <= 0) {
      setScheduleStatus({ type: "error", message: "예약 가격과 수량을 확인해주세요." });
      return;
    }

    const request: TransactionRequest = {
      stockId: stock.id,
      amount: quantity,
      quantity,
      price,
      portfolioId: 1,
      tradeType: "RESERVED",
      transactionType: scheduleDraft.type === "buy" ? "BUY" : "SELL",
      priceType: "scheduled",
      type: scheduleDraft.type,
      autoCondition: scheduleDraft.condition,
      triggerPrice: price,
    };

    try {
      await createTrade.mutateAsync(request);
      setScheduleStatus({ type: "success", message: "예약 주문이 등록되었습니다. 조건에 도달하면 먼저 접수된 주문부터 체결됩니다." });
      await ordersQuery.refetch();
      setIsScheduleOpen(false);
    } catch (error) {
      setScheduleStatus({ type: "error", message: getErrorMessage(error, "예약 주문 등록에 실패했습니다.") });
    }
  };

  const cancelScheduledOrder = async (order: TradeResponse) => {
    try {
      await cancelTrade.mutateAsync(getOrderId(order));
      setScheduleStatus({ type: "success", message: "예약 주문이 취소되었습니다." });
      await ordersQuery.refetch();
    } catch (error) {
      setScheduleStatus({ type: "error", message: getErrorMessage(error, "예약 주문 취소에 실패했습니다.") });
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-1 items-center justify-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-[#42D6BA] bg-white text-[#1D1E20]"
                  : "text-[#909193] hover:bg-gray-50 hover:text-[#1D1E20]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === "favorites" && (
        <>
          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-medium text-[#1D1E20]">관심 종목</h2>
                <div className="flex items-center gap-2 text-sm text-[#909193]">
                  <span className="text-[#FFD166]">★</span>
                  <span>{favorites.size}개 즐겨찾기</span>
                </div>
              </div>
              <input
                type="text"
                placeholder="종목명 또는 코드 검색"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-[#1D1E20] outline-none transition-all placeholder:text-[#A5A6A9] focus:border-[#42D6BA] focus:ring-2 focus:ring-[#C7F3EB]"
              />
            </div>
            <div className="max-h-[600px] divide-y divide-gray-100 overflow-y-auto">
              {favoriteStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  favorite={favorites.has(stock.id)}
                  onSelectStock={onSelectStock}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
              {favoriteStocks.length === 0 && (
                <div className="px-6 py-16 text-center text-sm text-[#909193]">즐겨찾기한 종목이 없습니다.</div>
              )}
            </div>
          </section>

          <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
              <h2 className="text-xl font-bold text-[#1D1E20]">전체 종목</h2>
            </div>
            <div className="max-h-[600px] divide-y divide-gray-100 overflow-y-auto">
              {filteredStocks.map((stock) => (
                <StockRow
                  key={stock.id}
                  stock={stock}
                  favorite={favorites.has(stock.id)}
                  onSelectStock={onSelectStock}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
              {filteredStocks.length === 0 && (
                <div className="px-6 py-16 text-center text-sm text-[#909193]">검색 결과가 없습니다.</div>
              )}
            </div>
          </section>
        </>
      )}

      {activeTab === "holdings" && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <h2 className="mb-4 text-xl font-bold text-[#1D1E20]">보유 종목</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="mb-1 text-xs text-[#909193]">총 평가액</div>
                <div className="text-xl font-bold text-[#1D1E20]">{formatWon(totalHoldingValue)}</div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="mb-1 text-xs text-[#909193]">총 손익</div>
                <div className={`text-xl font-bold ${totalProfitLoss >= 0 ? "text-[#00A63E]" : "text-[#FF0000]"}`}>
                  {totalProfitLoss >= 0 ? "+" : ""}{formatWon(totalProfitLoss)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-100 bg-white p-4">
                <div className="mb-1 text-xs text-[#909193]">수익률</div>
                <div className={`text-xl font-bold ${totalProfitLossRate >= 0 ? "text-[#00A63E]" : "text-[#FF0000]"}`}>
                  {totalProfitLossRate >= 0 ? "+" : ""}{totalProfitLossRate.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
          <div className="max-h-[600px] divide-y divide-gray-100 overflow-y-auto">
            {isHoldingsLoading && (
              <div className="px-6 py-16 text-center text-sm text-[#909193]">보유 종목을 불러오는 중입니다.</div>
            )}
            {holdings.map((holding) => (
              <button
                key={holding.id}
                type="button"
                onClick={() => onSelectStock(holding)}
                className="group w-full px-6 py-4 text-left transition-colors hover:bg-[#C7F3EB]/20"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-[#1D1E20] group-hover:text-[#1F3B70]">{holding.name}</div>
                    <div className="text-sm text-[#A5A6A9]">{holding.code} · {holding.quantity}주 보유</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#1D1E20]">{formatWon(holding.price)}</div>
                    <div className="text-xs text-[#A5A6A9]">평단가 {formatWon(holding.avgPrice)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#909193]">평가액 {formatWon(holding.totalValue)}</div>
                  <div className={`text-sm font-medium ${holding.profitLoss >= 0 ? "text-[#00A63E]" : "text-[#FF0000]"}`}>
                    {holding.profitLoss >= 0 ? "+" : ""}{formatWon(holding.profitLoss)} ({(holding.avgPrice * holding.quantity > 0 ? (holding.profitLoss / (holding.avgPrice * holding.quantity)) * 100 : 0).toFixed(2)}%)
                  </div>
                </div>
              </button>
            ))}
            {!isHoldingsLoading && holdings.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-[#909193]">아직 보유한 종목이 없습니다.</div>
            )}
          </div>
        </section>
      )}

      {activeTab === "scheduled" && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#1D1E20]">예약 주문</h2>
                <p className="mt-1 text-sm text-[#909193]">
                  대기, 체결, 취소, 실패 사유를 백엔드 주문 상태 그대로 풀어서 보여줍니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setScheduleDraft({ stockId: stocks[0]?.id ?? "1", type: "buy", condition: "below", price: "", quantity: "1" });
                  setScheduleStatus(null);
                  setIsScheduleOpen(true);
                }}
                className="rounded-lg bg-[#42D6BA] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#3AB8A8]"
              >
                예약 주문 추가
              </button>
            </div>
            {scheduleStatus && (
              <div className={`mt-4 rounded-xl px-4 py-3 text-sm ${
                scheduleStatus.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}>
                {scheduleStatus.message}
              </div>
            )}
          </div>
          <div className="max-h-[600px] divide-y divide-gray-100 overflow-y-auto">
            {scheduledOrders.map((order) => (
              <div key={getOrderId(order)} className="px-6 py-4 transition-colors hover:bg-gray-50">
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <div className="font-bold text-[#1D1E20]">{order.stockName ?? order.stockId}</div>
                      <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                        getOrderSide(order) === "buy" ? "bg-[#FFC2C2] text-[#FF0000]" : "bg-[#DFE2FF] text-[#001AFF]"
                      }`}>
                        {getOrderSide(order) === "buy" ? "매수" : "매도"}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-[#696969]">
                        {order.priceType === "scheduled" ? "예약" : order.priceType === "limit" ? "지정가" : "주문"}
                      </span>
                    </div>
                    <div className="text-sm text-[#909193]">
                      {getOrderConditionLabel(order)} {formatWon(toNumber(order.triggerPrice ?? order.price, 0))} 도달 시
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-[#1D1E20]">{toNumber(order.quantity ?? order.amount, 0).toLocaleString("ko-KR")}주</div>
                    <div className="text-xs text-[#A5A6A9]">{formatOrderDate(order.createdAt)}</div>
                  </div>
                </div>
                <OrderStatusNotice order={order} className="mb-3" />
                <div className="flex items-center justify-between">
                  <div className="text-sm text-[#909193]">
                    주문금액 {formatWon(toNumber(order.totalKrw ?? order.total, 0))}
                  </div>
                  {String(order.status ?? "").toLowerCase() === "pending" ? (
                    <button
                      type="button"
                      onClick={() => void cancelScheduledOrder(order)}
                      disabled={cancelTrade.isPending}
                      className="text-sm font-medium text-red-600 hover:text-[#FF0000] disabled:opacity-50"
                    >
                      취소
                    </button>
                  ) : (
                    <span className="text-xs text-[#A5A6A9]">
                      {formatOrderDate(order.completedAt ?? order.canceledAt ?? order.failedAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {ordersQuery.isLoading && (
              <div className="px-6 py-16 text-center text-sm text-[#909193]">예약 주문을 불러오는 중입니다.</div>
            )}
            {!ordersQuery.isLoading && scheduledOrders.length === 0 && (
              <div className="px-6 py-16 text-center text-sm text-[#909193]">
                아직 예약 주문이 없습니다. 종목 상세에서 예약 주문을 넣으면 여기에서 상태와 실패 사유를 확인할 수 있습니다.
              </div>
            )}
          </div>
        </section>
      )}

      {activeTab === "portfolio" && (
        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-xl font-bold text-[#1D1E20]">포트폴리오 분석</h2>
          <div className="mb-8 grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-purple-50 p-6">
              <h3 className="mb-4 font-bold text-[#1D1E20]">종목별 비중</h3>
              <div className="space-y-3">
                {holdings.map((holding) => {
                  const percentage = totalHoldingValue > 0 ? (holding.totalValue / totalHoldingValue) * 100 : 0;
                  return (
                    <div key={holding.id}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-700">{holding.name}</span>
                        <span className="font-medium text-[#1D1E20]">{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
                {holdings.length === 0 && (
                  <div className="text-sm text-[#909193]">보유 종목이 생기면 비중이 표시됩니다.</div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
              <h3 className="mb-4 font-bold text-[#1D1E20]">수익률 분석</h3>
              <div className="space-y-3">
                {holdings.map((holding) => {
                  const invested = holding.avgPrice * holding.quantity;
                  const profitRate = invested > 0 ? (holding.profitLoss / invested) * 100 : 0;
                  return (
                    <div key={holding.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{holding.name}</span>
                      <span className={`text-sm font-medium ${profitRate >= 0 ? "text-[#00A63E]" : "text-[#FF0000]"}`}>
                        {profitRate >= 0 ? "+" : ""}{profitRate.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
                {holdings.length === 0 && (
                  <div className="text-sm text-[#909193]">보유 종목이 생기면 수익률이 표시됩니다.</div>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-1 text-xs text-[#909193]">보유 종목 수</div>
              <div className="text-2xl font-bold text-[#1D1E20]">{holdings.length}</div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-1 text-xs text-[#909193]">총 투자금</div>
              <div className="text-2xl font-bold text-[#1D1E20]">{formatWon(totalHoldingValue - totalProfitLoss)}</div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-1 text-xs text-[#909193]">평가 금액</div>
              <div className="text-2xl font-bold text-[#1D1E20]">{formatWon(totalHoldingValue)}</div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-1 text-xs text-[#909193]">실현 손익</div>
              <div className="text-2xl font-bold text-[#00A63E]">0원</div>
            </div>
          </div>
        </section>
      )}

      {isScheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1D1E20]">예약 주문 추가</h3>
              <button type="button" onClick={() => setIsScheduleOpen(false)} className="rounded-lg p-1 text-[#A5A6A9] hover:bg-gray-100">
                닫기
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-[#909193]">종목</label>
                <select
                  value={scheduleDraft.stockId}
                  onChange={(event) => setScheduleDraft((prev) => ({ ...prev, stockId: event.target.value }))}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#42D6BA]"
                >
                  {stocks.map((stock) => (
                    <option key={stock.id} value={stock.id}>{stock.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleDraft((prev) => ({ ...prev, type: "buy" }))}
                  className={`rounded-xl py-3 text-sm font-bold ${scheduleDraft.type === "buy" ? "bg-[#FFC2C2] text-[#FF0000]" : "bg-gray-100 text-[#909193]"}`}
                >
                  매수
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleDraft((prev) => ({ ...prev, type: "sell" }))}
                  className={`rounded-xl py-3 text-sm font-bold ${scheduleDraft.type === "sell" ? "bg-[#DFE2FF] text-[#001AFF]" : "bg-gray-100 text-[#909193]"}`}
                >
                  매도
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScheduleDraft((prev) => ({ ...prev, condition: "below" }))}
                  className={`rounded-xl py-3 text-sm font-bold ${scheduleDraft.condition === "below" ? "bg-[#C7F3EB] text-[#1F3B70]" : "bg-gray-100 text-[#909193]"}`}
                >
                  지정가 이하
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleDraft((prev) => ({ ...prev, condition: "above" }))}
                  className={`rounded-xl py-3 text-sm font-bold ${scheduleDraft.condition === "above" ? "bg-[#C7F3EB] text-[#1F3B70]" : "bg-gray-100 text-[#909193]"}`}
                >
                  지정가 이상
                </button>
              </div>
              <input
                type="number"
                value={scheduleDraft.price}
                onChange={(event) => setScheduleDraft((prev) => ({ ...prev, price: event.target.value }))}
                placeholder="예약 가격"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#42D6BA]"
              />
              <input
                type="number"
                value={scheduleDraft.quantity}
                onChange={(event) => setScheduleDraft((prev) => ({ ...prev, quantity: event.target.value }))}
                placeholder="수량"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#42D6BA]"
              />
              {scheduleStatus && (
                <div className={`rounded-xl px-4 py-3 text-sm ${
                  scheduleStatus.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                }`}>
                  {scheduleStatus.message}
                </div>
              )}
              <button
                type="button"
                onClick={() => void addScheduledOrder()}
                disabled={createTrade.isPending}
                className="w-full rounded-xl bg-[#42D6BA] py-3 font-bold text-white hover:bg-[#3AB8A8] disabled:opacity-50"
              >
                {createTrade.isPending ? "예약 주문 등록중..." : "예약 주문 추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PortfolioTabsPanel;

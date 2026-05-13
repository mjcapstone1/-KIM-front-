import { useEffect, useMemo, useState } from "react";
import { fetchCandles, type CandleWithVolume } from "@/api/market";
import { formatVolume, formatWon, type SimStock } from "../simMarketTypes";

interface StockTradeDetailProps {
  stock: SimStock;
  onBack: () => void;
}

type OrderType = "buy" | "sell";
type OrderMode = "limit" | "market" | "scheduled";

const StockTradeDetail = ({ stock, onBack }: StockTradeDetailProps) => {
  const [orderType, setOrderType] = useState<OrderType>("buy");
  const [orderMode, setOrderMode] = useState<OrderMode>("limit");
  const [orderPrice, setOrderPrice] = useState(String(stock.price));
  const [orderQuantity, setOrderQuantity] = useState("1");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [candles, setCandles] = useState<CandleWithVolume[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const orderBook = useMemo(() => ({
    asks: [] as Array<{ price: number; volume: number }>,
    bids: [] as Array<{ price: number; volume: number }>,
  }), []);

  useEffect(() => {
    let cancelled = false;
    setIsChartLoading(true);
    fetchCandles(stock.id, "일봉")
      .then((data) => {
        if (!cancelled) setCandles(data);
      })
      .catch(() => {
        if (!cancelled) setCandles([]);
      })
      .finally(() => {
        if (!cancelled) setIsChartLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stock.id]);

  const maxHigh = candles.length > 0 ? Math.max(...candles.map((point) => point.high)) : stock.price;
  const minLow = candles.length > 0 ? Math.min(...candles.map((point) => point.low)) : stock.price;
  const chartRange = Math.max(maxHigh - minLow, 1);
  const parsedPrice = orderMode === "market" ? stock.price : Number(orderPrice) || stock.price;
  const parsedQuantity = Number(orderQuantity) || 0;
  const orderTotal = parsedPrice * parsedQuantity;
  const isUp = stock.changeRate >= 0;

  const setQuantityByPercent = (percent: number) => {
    const available = orderType === "buy" ? 50_000_000 : stock.id === "1" ? 10 * stock.price : 3 * stock.price;
    const quantity = Math.max(1, Math.floor((available * percent) / stock.price));
    setOrderQuantity(String(quantity));
  };

  return (
    <div className="min-h-screen bg-white">
      <button type="button" onClick={onBack} className="mb-4 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#696969] hover:bg-gray-50">
        투자 시뮬레이터로 돌아가기
      </button>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_30%]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm text-[#909193]">{stock.code}</p>
                <h1 className="text-3xl font-bold text-[#1D1E20]">{stock.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-[#1D1E20]">{formatWon(stock.price)}</p>
                <p className={`font-bold ${isUp ? "text-[#FF0000]" : "text-[#001AFF]"}`}>
                  {isUp ? "+" : ""}
                  {stock.changeRate.toFixed(2)}% · 거래량 {formatVolume(stock.volume)}
                </p>
              </div>
            </div>

            <div className="mb-4 flex gap-2">
              {["1분", "5분", "일", "주", "월"].map((item, index) => (
                <button
                  key={item}
                  type="button"
                  className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                    index === 2 ? "border-[#1F3B70] bg-[#1F3B70] text-white" : "border-gray-200 text-[#909193] hover:border-[#42D6BA]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="flex h-[340px] items-end gap-1 rounded-2xl border border-gray-100 bg-gradient-to-b from-[#F8FFFD] to-white p-5">
              {isChartLoading ? (
                <div className="flex w-full items-center justify-center text-sm text-[#909193]">차트 데이터를 불러오는 중입니다.</div>
              ) : candles.length === 0 ? (
                <div className="flex w-full items-center justify-center text-sm text-[#909193]">실제 차트 데이터가 없습니다.</div>
              ) : candles.map((point) => {
                const top = ((maxHigh - point.high) / chartRange) * 100;
                const bottom = ((point.low - minLow) / chartRange) * 100;
                const bodyTop = ((maxHigh - Math.max(point.open, point.close)) / chartRange) * 100;
                const bodyBottom = ((Math.min(point.open, point.close) - minLow) / chartRange) * 100;
                const candleUp = point.close >= point.open;
                return (
                  <div key={String(point.time)} className="relative h-full flex-1">
                    <div
                      className="absolute left-1/2 w-px -translate-x-1/2 bg-gray-400"
                      style={{ top: `${top}%`, bottom: `${bottom}%` }}
                    />
                    <div
                      className={`absolute left-1/2 w-full max-w-[12px] -translate-x-1/2 rounded-sm ${candleUp ? "bg-[#FF0000]" : "bg-[#001AFF]"}`}
                      style={{ top: `${bodyTop}%`, bottom: `${bodyBottom}%`, minHeight: 4 }}
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-6">
            <h2 className="mb-4 text-lg font-bold text-[#1D1E20]">호가</h2>
            <div className="grid grid-cols-3 border-b border-gray-100 py-2 text-center text-xs font-bold text-[#909193]">
              <span>매도잔량</span>
              <span>가격</span>
              <span>매수잔량</span>
            </div>
            <div>
              {orderBook.asks.length === 0 && orderBook.bids.length === 0 && (
                <div className="py-8 text-center text-sm text-[#909193]">실시간 호가 데이터가 없습니다.</div>
              )}
              {orderBook.asks.map((ask) => (
                <button
                  key={`ask-${ask.price}`}
                  type="button"
                  onClick={() => {
                    setOrderMode("limit");
                    setOrderPrice(String(ask.price));
                  }}
                  className="grid w-full grid-cols-3 bg-red-50/50 py-2 text-sm hover:bg-red-100"
                >
                  <span className="text-right text-[#909193]">{ask.volume.toLocaleString("ko-KR")}</span>
                  <span className="text-center font-bold text-[#FF0000]">{formatWon(ask.price)}</span>
                  <span />
                </button>
              ))}
              {orderBook.bids.map((bid) => (
                <button
                  key={`bid-${bid.price}`}
                  type="button"
                  onClick={() => {
                    setOrderMode("limit");
                    setOrderPrice(String(bid.price));
                  }}
                  className="grid w-full grid-cols-3 bg-blue-50/50 py-2 text-sm hover:bg-blue-100"
                >
                  <span />
                  <span className="text-center font-bold text-[#001AFF]">{formatWon(bid.price)}</span>
                  <span className="text-left text-[#909193]">{bid.volume.toLocaleString("ko-KR")}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="border-l border-gray-100 bg-white p-4">
          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setOrderType("buy")}
              className={`rounded-lg py-3 text-sm font-medium transition-colors ${orderType === "buy" ? "bg-[#FF0000] text-[#1D1E20]" : "bg-gray-100 text-[#909193] hover:bg-gray-200"}`}
            >
              매수
            </button>
            <button
              type="button"
              onClick={() => setOrderType("sell")}
              className={`rounded-lg py-3 text-sm font-medium transition-colors ${orderType === "sell" ? "bg-[#001AFF] text-[#1D1E20]" : "bg-gray-100 text-[#909193] hover:bg-gray-200"}`}
            >
              매도
            </button>
          </div>

          <div className="mb-4 flex gap-2 text-xs">
            {[
              { key: "limit" as const, label: "지정가" },
              { key: "market" as const, label: "시장가" },
              { key: "scheduled" as const, label: "예약 주문" },
            ].map((mode) => (
              <button
                key={mode.key}
                type="button"
                onClick={() => setOrderMode(mode.key)}
                className={`rounded px-3 py-1.5 font-medium transition-colors ${
                  orderMode === mode.key ? "bg-[#42D6BA] text-[#1D1E20]" : "bg-gray-100 text-[#444441] hover:bg-gray-200"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div className="mb-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#909193]">보유 잔액</span>
              <span className="font-bold text-[#1D1E20]">{formatWon(50000000)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#444441]">주문가격</label>
              <div className="relative flex items-center">
                <button
                  type="button"
                  disabled={orderMode === "market"}
                  onClick={() => setOrderPrice(String(Math.max(0, (Number(orderPrice) || stock.price) - 100)))}
                  className={`absolute left-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-[#1F3B70] text-[#1D1E20] transition-colors ${orderMode === "market" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  -
                </button>
                <input
                  type="number"
                  value={orderMode === "market" ? stock.price : orderPrice}
                  onChange={(event) => setOrderPrice(event.target.value)}
                  disabled={orderMode === "market"}
                  className={`w-full rounded-lg border border-gray-200 bg-white px-12 py-3 text-center text-[#1D1E20] outline-none focus:border-[#42D6BA] focus:ring-2 focus:ring-[#C7F3EB] ${orderMode === "market" ? "cursor-not-allowed bg-gray-100 opacity-50" : ""}`}
                />
                <span className="absolute right-12 top-1/2 -translate-y-1/2 text-[#909193]">원</span>
                <button
                  type="button"
                  disabled={orderMode === "market"}
                  onClick={() => setOrderPrice(String((Number(orderPrice) || stock.price) + 100))}
                  className={`absolute right-3 z-10 flex h-7 w-7 items-center justify-center rounded bg-[#42D6BA] text-[#1D1E20] transition-colors hover:bg-[#3AB8A8] ${orderMode === "market" ? "cursor-not-allowed opacity-50" : ""}`}
                >
                  +
                </button>
              </div>
              {orderMode !== "market" && (
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={() => setOrderPrice(String(stock.price))} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] hover:bg-gray-200">
                    현재가
                  </button>
                  <button type="button" onClick={() => setOrderPrice(String(Math.round(stock.price * 1.01)))} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] hover:bg-gray-200">
                    +1%
                  </button>
                  <button type="button" onClick={() => setOrderPrice(String(Math.round(stock.price * 0.99)))} className="rounded bg-gray-100 px-3 py-1 text-xs font-medium text-[#444441] hover:bg-gray-200">
                    -1%
                  </button>
                </div>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#444441]">주문수량</label>
              <input
                type="number"
                value={orderQuantity}
                onChange={(event) => setOrderQuantity(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-center text-[#1D1E20] outline-none focus:border-[#42D6BA] focus:ring-2 focus:ring-[#C7F3EB]"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.1, 0.25, 0.5, 1].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => setQuantityByPercent(percent)}
                  className="rounded-lg border border-gray-200 py-2 text-xs font-bold text-[#696969] hover:border-[#42D6BA]"
                >
                  {percent === 1 ? "최대" : `${percent * 100}%`}
                </button>
              ))}
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between text-sm text-[#696969]">
                <span>주문 총액</span>
                <span className="font-bold text-[#1D1E20]">{formatWon(orderTotal)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-[#696969]">
                <span>주문 가능 금액</span>
                <span className="font-bold text-[#1D1E20]">50,000,000원</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className={`w-full rounded-2xl py-4 font-bold text-[#1D1E20] shadow-lg ${
                orderType === "buy" ? "bg-[#FF0000] hover:bg-red-600" : "bg-[#42D6BA] hover:bg-[#3AB8A8]"
              }`}
            >
              {orderMode === "scheduled" ? "예약 주문" : `${orderType === "buy" ? "매수" : "매도"} 주문`}
            </button>
          </div>
        </aside>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-[#1D1E20]">주문 확인</h3>
            <div className="space-y-2 rounded-xl bg-gray-50 p-4 text-sm">
              <p className="flex justify-between"><span>종목</span><b>{stock.name}</b></p>
              <p className="flex justify-between"><span>유형</span><b>{orderType === "buy" ? "매수" : "매도"}</b></p>
              <p className="flex justify-between"><span>가격</span><b>{formatWon(parsedPrice)}</b></p>
              <p className="flex justify-between"><span>수량</span><b>{parsedQuantity}주</b></p>
              <p className="flex justify-between"><span>총액</span><b>{formatWon(orderTotal)}</b></p>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={() => setShowConfirm(false)} className="flex-1 rounded-xl bg-gray-100 py-3 font-bold text-[#696969]">
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setShowSuccess(true);
                }}
                className="flex-1 rounded-xl bg-[#1F3B70] py-3 font-bold text-white"
              >
                주문 체결
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <h3 className="mb-2 text-xl font-bold text-[#1D1E20]">주문이 완료되었습니다</h3>
            <p className="mb-5 text-sm text-[#696969]">성공적으로 주문이 접수되었습니다.</p>
            <button type="button" onClick={() => setShowSuccess(false)} className="w-full rounded-xl bg-[#42D6BA] py-3 font-bold text-white">
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTradeDetail;

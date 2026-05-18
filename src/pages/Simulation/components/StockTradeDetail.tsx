import { useEffect, useMemo, useState } from "react";
import { fetchCandles, type CandleWithVolume } from "@/api/market";
import { formatVolume, formatWon, type SimStock } from "../simMarketTypes";
import OrderPanel from "./OrderPanel";

interface StockTradeDetailProps {
  stock: SimStock;
  onBack: () => void;
  onTradeSuccess?: () => void;
}

const StockTradeDetail = ({ stock, onBack, onTradeSuccess }: StockTradeDetailProps) => {
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
  const isUp = stock.changeRate >= 0;

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
          <OrderPanel
            currentPrice={stock.price}
            stockId={stock.id}
            stockName={stock.name}
            currency="KRW"
            onTradeSuccess={onTradeSuccess}
          />
        </aside>
      </div>
    </div>
  );
};

export default StockTradeDetail;

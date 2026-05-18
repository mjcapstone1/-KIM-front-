import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DateTime } from "luxon";
import StockChart, { type ChartPeriod } from "./components/StockChart";
import OrderPanel from "./components/OrderPanel";
import { fetchCandles, fetchClosingPrices, fetchStockDetail, normalizeCandleData, toKstDateTime, toNumericStockId, type CandleWithVolume } from "@/api/market";
import { useMarketStore, useQuote } from "@/store/useMarketStore";
import { useMarketStatus } from "@/hooks/useMarketQueries";
import { cn } from "@/utils/cn";
import { formatVolume, type SimStock } from "./simMarketTypes";

const ArrowLeftIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m12 19-7-7 7-7" />
    <path d="M19 12H5" />
  </svg>
);

const ChevronDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendingDownIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

function parseKstDateTime(dateTime: string): number {
  if (!dateTime) return NaN;

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(dateTime);
  const parsed = hasTimezone
    ? DateTime.fromISO(dateTime, { setZone: true })
    : DateTime.fromISO(dateTime, { zone: "Asia/Seoul" });

  return parsed.isValid ? parsed.toMillis() : NaN;
}

const chartPeriods: ChartPeriod[] = ["분봉", "일봉", "주봉", "월봉", "년봉"];

const StockDetailPage = () => {
  const navigate = useNavigate();
  const { stockId } = useParams<{ stockId: string }>();
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>("일봉");
  const [chartData, setChartData] = useState<CandleWithVolume[]>([]);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const allChartDataRef = useRef<CandleWithVolume[]>([]);

  const resolvedStockId = stockId ?? "1";
  const stockIdNum = toNumericStockId(resolvedStockId);
  const [selectedStock, setSelectedStock] = useState<SimStock | null>(null);
  const { subscribe, unsubscribe } = useMarketStore();
  const quote = useQuote(stockIdNum ?? -1);
  const { isMarketOpen } = useMarketStatus();
  const [closingPrice, setClosingPrice] = useState<{
    close: number;
    prevDayChangePct: number;
    volume: number;
  } | null>(null);

  useEffect(() => {
    if (!resolvedStockId) return;

    let cancelled = false;
    fetchStockDetail(resolvedStockId)
      .then((detail) => {
        if (cancelled) return;
        setSelectedStock({
          id: String(detail.stockId),
          name: detail.name || "종목",
          code: detail.symbol,
          price: detail.close,
          changeRate: detail.prevDayChangePct,
          volume: detail.volume,
        });
      })
      .catch(() => {
        if (!cancelled) setSelectedStock(null);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedStockId]);

  useEffect(() => {
    if (!stockIdNum || !isMarketOpen) return;
    subscribe([stockIdNum]);
    return () => {
      unsubscribe([stockIdNum]);
    };
  }, [stockIdNum, isMarketOpen, subscribe, unsubscribe]);

  useEffect(() => {
    if (!resolvedStockId) return;

    let cancelled = false;
    fetchClosingPrices([resolvedStockId])
      .then((prices) => {
        if (cancelled) return;
        const latest = prices[0];
        setClosingPrice(latest
          ? {
              close: latest.close,
              prevDayChangePct: latest.prevDayChangePct,
              volume: latest.volume,
            }
          : null);
      })
      .catch(() => {
        if (!cancelled) setClosingPrice(null);
      });

    return () => {
      cancelled = true;
    };
  }, [resolvedStockId]);

  const basePriceData = quote ?? closingPrice;
  const currentPrice = basePriceData?.close ?? selectedStock?.price ?? 0;
  const changeRate = basePriceData?.prevDayChangePct ?? selectedStock?.changeRate ?? 0;
  const displayVolume = basePriceData?.volume != null ? formatVolume(basePriceData.volume) : formatVolume(selectedStock?.volume ?? 0);
  const isPositive = changeRate >= 0;

  useEffect(() => {
    if (!isMarketOpen || chartPeriod !== "분봉" || !quote || !Number.isFinite(quote.close) || quote.close <= 0) {
      return;
    }

    const quoteTime = parseKstDateTime(quote.at);
    if (!Number.isFinite(quoteTime)) return;

    const minuteTime = Math.floor(quoteTime / 60_000) * 60;

    setChartData((prev) => {
      if (prev.length === 0) {
        const initial = {
          time: minuteTime as CandleWithVolume["time"],
          open: quote.close,
          high: quote.close,
          low: quote.close,
          close: quote.close,
          volume: Number.isFinite(quote.volume) ? quote.volume : 0,
        };
        allChartDataRef.current = [initial];
        return [initial];
      }

      const next = [...prev];
      const last = next[next.length - 1];
      if (typeof last.time !== "number") return prev;

      if (last.time === minuteTime) {
        next[next.length - 1] = {
          ...last,
          high: Math.max(last.high, quote.close),
          low: Math.min(last.low, quote.close),
          close: quote.close,
          volume: Number.isFinite(quote.volume) ? Math.max(last.volume, quote.volume) : last.volume,
        };
      } else if (last.time < minuteTime) {
        next.push({
          time: minuteTime as CandleWithVolume["time"],
          open: last.close,
          high: Math.max(last.close, quote.close),
          low: Math.min(last.close, quote.close),
          close: quote.close,
          volume: Number.isFinite(quote.volume) ? quote.volume : 0,
        });
      } else {
        return prev;
      }

      const normalized = normalizeCandleData(next);
      allChartDataRef.current = normalized;
      return normalized;
    });
  }, [quote, isMarketOpen, chartPeriod]);

  const loadCandles = useCallback(async () => {
    if (!resolvedStockId) return;
    setIsChartLoading(true);
    try {
      const data = await fetchCandles(resolvedStockId, chartPeriod);
      const normalized = normalizeCandleData(data);
      allChartDataRef.current = normalized;
      setChartData(normalized);
    } catch {
      allChartDataRef.current = [];
      setChartData([]);
    } finally {
      setIsChartLoading(false);
    }
  }, [resolvedStockId, chartPeriod]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCandles();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadCandles]);

  const handleLoadMore = useCallback(async (endTime: string) => {
    if (!resolvedStockId) return;

    try {
      const startDate = new Date(parseKstDateTime(endTime));
      switch (chartPeriod) {
        case "분봉":
          startDate.setDate(startDate.getDate() - 3);
          break;
        case "일봉":
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        case "주봉":
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        case "월봉":
          startDate.setFullYear(startDate.getFullYear() - 3);
          break;
        case "년봉":
          startDate.setFullYear(startDate.getFullYear() - 10);
          break;
      }

      const olderData = await fetchCandles(resolvedStockId, chartPeriod, {
        startTime: toKstDateTime(startDate),
        endTime,
      });
      if (olderData.length > 0) {
        const normalized = normalizeCandleData([...olderData, ...allChartDataRef.current]);
        allChartDataRef.current = normalized;
        setChartData(normalized);
      }
    } catch {
      // 추가 로딩 실패는 화면 유지
    }
  }, [resolvedStockId, chartPeriod]);

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 bg-white">
      <div className="w-[70%] overflow-y-auto border-r border-gray-100 bg-white">
        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white p-4">
          <button
            type="button"
            onClick={() => navigate("/simulation")}
            className="mb-4 flex items-center gap-1.5 text-sm text-[#909193] transition-colors hover:text-[#1D1E20]"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>목록으로</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[#1D1E20]">{selectedStock?.name ?? "종목"}</h1>
                <span className="text-sm font-medium text-[#A5A6A9]">{selectedStock?.code ?? ""}</span>
              </div>
              <div className="text-sm text-[#909193]">거래량: {displayVolume}</div>
            </div>
            <div className="text-right">
              <div className="mb-1 text-3xl font-bold text-[#1D1E20]">₩{currentPrice.toLocaleString("ko-KR")}</div>
              <div className={cn("flex items-center justify-end gap-1 font-medium", isPositive ? "text-[#00A63E]" : "text-[#001AFF]")}>
                {isPositive ? <TrendingUpIcon className="h-4 w-4" /> : <TrendingDownIcon className="h-4 w-4" />}
                <span>{isPositive ? "+" : ""}{changeRate.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky top-[130px] z-10 border-b border-gray-100 bg-white px-4 py-2">
          <div className="relative flex gap-2">
            {chartPeriods.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => setChartPeriod(period)}
                className={cn(
                  "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  chartPeriod === period
                    ? "bg-[#42D6BA] text-[#1D1E20]"
                    : "bg-gray-100 text-[#444441] hover:bg-gray-200",
                )}
              >
                {period}
                {period === "분봉" && <ChevronDownIcon className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="relative min-h-[550px] rounded-2xl border border-gray-100 bg-white p-4">
            {isChartLoading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/70">
                <span className="text-sm text-gray-400">차트 로딩중...</span>
              </div>
            )}
            {!isChartLoading && chartData.length === 0 ? (
              <div className="flex h-[500px] items-center justify-center text-sm text-gray-400">
                해당 기간의 차트 데이터가 없습니다.
              </div>
            ) : (
              <StockChart data={chartData} period={chartPeriod} onLoadMore={handleLoadMore} />
            )}
          </div>
        </div>
      </div>

      <div className="w-[30%] overflow-y-auto border-l border-gray-100 bg-white">
        <OrderPanel
          currentPrice={currentPrice}
          stockId={resolvedStockId}
          stockName={selectedStock?.name ?? "종목"}
          currency="KRW"
        />
      </div>
    </div>
  );
};

export default StockDetailPage;

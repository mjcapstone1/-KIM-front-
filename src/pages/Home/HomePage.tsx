import React, { useState, useMemo, useEffect, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TradingVolumeRank,
  TradingVolumeRankSkeleton,
  RelatedNews,
  Chip,
} from "@/components";
import { cn } from "@/utils/cn";
import { formatPrice, formatChangeRate, formatTradingValue } from "@/utils/formatStock";
import { newsApi, type NaverEconomyNewsItem } from "@/api/news";
import {
  useTopByValue,
  useTopByVolume,
  useTopRising,
  useTopFalling,
  useTopHoldingTop10WithPrices,
  useIndustryThemes,
  useDailySparklines,
  useMarketStatus,
} from "@/hooks/useMarketQueries";
import type { StockWithPrice } from "@/api/market";
import { toNumericStockId } from "@/api/market";
import { useMarketStore, useQuote } from "@/store/useMarketStore";
import MiniSparkline from "@/components/TradingVolumeRank/MiniSparkline";
import IndexHeaderItem from "./components/IndexHeaderItem";
import ThemeHeaderCard from "./components/ThemeHeaderCard";
import ThemeStockChart, { ThemeStockChartSkeleton } from "./components/ThemeStockChart";
import ThemeListDropdown from "./components/ThemeListDropdown";

const MOCK_FALLBACK = [
  { rank: 1, name: "삼성전자", ticker: "005930", price: "74,200원", change: "+0.45%", vol: "720억" },
  { rank: 2, name: "SK하이닉스", ticker: "000660", price: "186,500원", change: "+2.67%", vol: "650억" },
  { rank: 3, name: "LG에너지솔루션", ticker: "373220", price: "412,000원", change: "-1.45%", vol: "460억" },
  { rank: 4, name: "NAVER", ticker: "035420", price: "178,000원", change: "+1.23%", vol: "580억" },
  { rank: 5, name: "카카오", ticker: "035720", price: "45,600원", change: "-0.34%", vol: "520억" },
  { rank: 6, name: "현대차", ticker: "005380", price: "234,500원", change: "+0.78%", vol: "430억" },
  { rank: 7, name: "셀트리온", ticker: "068270", price: "178,900원", change: "+1.12%", vol: "410억" },
  { rank: 8, name: "KB금융", ticker: "105560", price: "82,300원", change: "+0.56%", vol: "380억" },
  { rank: 9, name: "포스코홀딩스", ticker: "005490", price: "298,000원", change: "-0.89%", vol: "350억" },
  { rank: 10, name: "삼성SDI", ticker: "006400", price: "385,000원", change: "+1.34%", vol: "320억" },
];

type FilterType = "거래대금" | "거래량" | "급상승" | "급하락";

const ECONOMY_NEWS_PAGE_SIZE = 20;

function formatRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return "날짜 없음";
  const targetTime = new Date(dateStr).getTime();
  if (Number.isNaN(targetTime)) return "날짜 없음";

  const diff = Date.now() - targetTime;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
}

// 실시간 가격 업데이트를 위한 래퍼 컴포넌트
interface RealTimeStockRowProps {
  stock: StockWithPrice;
  rank: number;
  isSelected: boolean;
  isMarketOpen: boolean;
  onSelect: () => void;
  sparklineValues?: number[];
}

const RealTimeStockRow = memo(({ stock, rank, isSelected, isMarketOpen, onSelect, sparklineValues }: RealTimeStockRowProps) => {
  const realtimeStockId = toNumericStockId(stock.stockId) ?? -1;
  const quote = useQuote(realtimeStockId);
  const prevChangePctRef = useRef<number | null>(null);
  const [changeFlashToken, setChangeFlashToken] = useState(0);

  useEffect(() => {
    if (!isMarketOpen || !quote) {
      prevChangePctRef.current = null;
      return;
    }

    const prevChangePct = prevChangePctRef.current;
    if (prevChangePct != null && prevChangePct !== quote.prevDayChangePct) {
      setChangeFlashToken((token) => token + 1);
    }
    prevChangePctRef.current = quote.prevDayChangePct;
  }, [isMarketOpen, quote]);

  // 장 열림: 실시간 데이터 우선, 장 닫힘: 종가 API 데이터만 사용
  const price =
    isMarketOpen
      ? (
          quote?.close ??
          stock.close ??
          (stock as any).currentPrice ??
          0
        )
      : (
          stock.close ??
          (stock as any).currentPrice ??
          0
        );

  const changePct =
    isMarketOpen
      ? (
          quote?.prevDayChangePct ??
          stock.prevDayChangePct ??
          (stock as any).changeRate ??
          0
        )
      : (
          stock.prevDayChangePct ??
          (stock as any).changeRate ??
          0
        );

  const value =
    isMarketOpen
      ? (
          quote?.value ??
          stock.value ??
          (stock as any).tradingValue ??
          0
        )
      : (
          stock.value ??
          (stock as any).tradingValue ??
          0
        );

  return (
    <TradingVolumeRank
      rank={rank}
      stockName={stock.name}
      ticker={stock.symbol}
      currentPrice={formatPrice(price)}
      changeRate={formatChangeRate(changePct)}
      tradingVolume={formatTradingValue(value)}
      changeFlashToken={changeFlashToken}
      chart={
        sparklineValues && sparklineValues.length >= 2
          ? <MiniSparkline values={sparklineValues} color={changePct >= 0 ? "#FF0000" : "#001AFF"} />
          : undefined
      }
      onClick={onSelect}
      className={`border-none ${isSelected ? "bg-gray-50" : ""}`}
    />
  );
});

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"popular" | "personal">("popular");
  const [activeFilter, setActiveFilter] = useState<FilterType>("거래대금");
  const [selectedStock, setSelectedStock] = useState({
    name: "삼성전자",
    ticker: "005930",
    price: "74,200원",
    change: "+0.45%",
  });

  // 테마 섹션 상태
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>(undefined);
  const [showThemeList, setShowThemeList] = useState(false);

  // 오늘의 테마 AI 분석
  const [themeAnalysis, setThemeAnalysis] = useState<string>("");

  // 관련 뉴스
  const [latestNews, setLatestNews] = useState<NaverEconomyNewsItem[]>([]);
  const [latestNewsLoading, setLatestNewsLoading] = useState(false);
  const [latestNewsLoadingMore, setLatestNewsLoadingMore] = useState(false);
  const [economyNewsNextStart, setEconomyNewsNextStart] = useState(1);
  const [economyNewsHasMore, setEconomyNewsHasMore] = useState(true);
  const relatedNewsScrollRef = useRef<HTMLDivElement | null>(null);
  const relatedNewsSentinelRef = useRef<HTMLDivElement | null>(null);

  const loadEconomyNews = useCallback(async (start = 1, replace = false) => {
    if (replace) {
      setLatestNewsLoading(true);
    } else {
      setLatestNewsLoadingMore(true);
    }

    try {
      const data = await newsApi.getEconomyNews(start, ECONOMY_NEWS_PAGE_SIZE);
      setLatestNews((prev) => {
        if (replace) return data.items;
        const existingIds = new Set(prev.map((item) => item.id));
        return [
          ...prev,
          ...data.items.filter((item) => !existingIds.has(item.id)),
        ];
      });
      setEconomyNewsNextStart(data.nextStart);
      setEconomyNewsHasMore(data.hasMore);
    } catch {
      if (replace) {
        setLatestNews([]);
      }
      setEconomyNewsHasMore(false);
    } finally {
      if (replace) {
        setLatestNewsLoading(false);
      } else {
        setLatestNewsLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadEconomyNews(1, true);
  }, [loadEconomyNews]);

  useEffect(() => {
    const sentinel = relatedNewsSentinelRef.current;
    const root = relatedNewsScrollRef.current;
    if (!sentinel || !root || !economyNewsHasMore || latestNewsLoading || latestNewsLoadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadEconomyNews(economyNewsNextStart, false);
        }
      },
      { root, rootMargin: "80px", threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [
    economyNewsHasMore,
    economyNewsNextStart,
    latestNewsLoading,
    latestNewsLoadingMore,
    loadEconomyNews,
  ]);

  const openNews = useCallback((url: string) => {
    if (!url) return;
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (popup) {
      popup.opener = null;
    }
  }, []);

  // 좌측 리스트 쿼리
  const { isMarketOpen } = useMarketStatus();
  const topByValue = useTopByValue(isMarketOpen);
  const topByVolume = useTopByVolume(isMarketOpen);
  const topRising = useTopRising(isMarketOpen);
  const topFalling = useTopFalling(isMarketOpen);
  const topHoldingTop10 = useTopHoldingTop10WithPrices(isMarketOpen);

  const queryMap: Record<FilterType, typeof topByValue> = {
    "거래대금": topByValue,
    "거래량": topByVolume,
    "급상승": topRising,
    "급하락": topFalling,
  };

  const activeQuery = activeTab === "personal" ? topHoldingTop10 : queryMap[activeFilter];
  const isLoading = activeQuery.isLoading;
  const isError = activeQuery.isError;
  const stockData = activeQuery.data;
  const showMockFallback =
    activeTab === "popular" &&
    (isError || (!isLoading && (!stockData || stockData.length === 0)));
  const showPersonalEmpty =
    activeTab === "personal" &&
    !isLoading &&
    !isError &&
    (!stockData || stockData.length === 0);
  const showPersonalError = activeTab === "personal" && isError;

  const sparklineStockIds = useMemo(() => {
    if (!isLoading && !isError && stockData && stockData.length > 0) {
      return Array.from(
        new Set(
          stockData
            .map((stock) => toNumericStockId(stock.stockId))
            .filter((stockId): stockId is number => stockId != null)
        )
      );
    }

    if (showMockFallback) {
      return Array.from(
        new Set(
          MOCK_FALLBACK
            .map((stock) => Number(stock.ticker))
            .filter((stockId) => Number.isFinite(stockId))
        )
      );
    }

    return [];
  }, [isLoading, isError, stockData, showMockFallback]);

  const { dataByStockId: dailySparklineByStockId } = useDailySparklines(sparklineStockIds);

  const { subscribe, unsubscribe } = useMarketStore();

  // 장 열림 시에만 화면에 표시되는 종목들 웹소켓 구독
  useEffect(() => {
    if (!isMarketOpen || !stockData || stockData.length === 0) return;
    const stockIds = stockData
      .map((stock) => toNumericStockId(stock.stockId))
      .filter((stockId): stockId is number => stockId != null);
    if (stockIds.length === 0) return;
    subscribe(stockIds);
    return () => {
      unsubscribe(stockIds);
    };
  }, [stockData, isMarketOpen, subscribe, unsubscribe]);

  // 우측 산업 테마 섹션 데이터
  const industryThemesQuery = useIndustryThemes();
  const industryThemes = industryThemesQuery.data ?? [];

  // 첫 산업 테마 자동 선택
  useEffect(() => {
    if (industryThemes.length > 0 && selectedThemeId == null) {
      setSelectedThemeId(industryThemes[0].id);
      return;
    }

    if (
      selectedThemeId != null &&
      industryThemes.length > 0 &&
      !industryThemes.some((theme) => theme.id === selectedThemeId)
    ) {
      setSelectedThemeId(industryThemes[0].id);
    }
  }, [industryThemes, selectedThemeId]);

  const selectedTheme = useMemo(
    () => industryThemes.find((theme) => theme.id === selectedThemeId) ?? industryThemes[0] ?? null,
    [industryThemes, selectedThemeId],
  );

  useEffect(() => {
    setThemeAnalysis(selectedTheme?.summary ?? "");
  }, [selectedTheme]);

  const topByValueStock = useMemo(() => {
    if (!selectedTheme || !selectedTheme.topStockId) return null;
    return {
      stockId: selectedTheme.topStockId,
      name: selectedTheme.topStockName || selectedTheme.topStock,
    };
  }, [selectedTheme]);

  const topStockNames = useMemo(
    () => selectedTheme?.stockNames.slice(0, 3) ?? [],
    [selectedTheme],
  );

  return (
    <div className="bg-white font-noto">

      {/* 1. 종합 지수 섹션 (KOSPI + KOSDAQ) */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-[rgba(148,163,184,0.06)] via-white/90 to-transparent bg-[length:100%_55%] bg-no-repeat">
        <div className="w-full px-4 py-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-24">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
            <IndexHeaderItem indexType="KOSPI" />
            <IndexHeaderItem indexType="KOSDAQ" />
          </div>
        </div>
      </section>

      <main className="max-w-full mx-auto flex min-h-[calc(100vh-160px)]">
        {/* 2. 실시간 거래 대금 리스트 (좌측) */}
        <section className="w-[600px] border-r border-gray-200 flex flex-col shrink-0">
          <div className="flex flex-col gap-4 px-10 py-5">
            <h2 className="text-[20px] font-medium text-black">실시간 거래 대금</h2>

            {/* 탭 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("popular")}
                className={`px-4 py-2 rounded-[8px] text-[14px] transition-colors ${activeTab === "popular" ? "bg-[#42d6ba] text-white" : "bg-gray-100 text-gray-400"}`}
              >
                인기 종목
              </button>
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-4 py-2 rounded-[8px] text-[14px] transition-colors ${activeTab === "personal" ? "bg-[#42d6ba] text-white" : "bg-gray-100 text-gray-400"}`}
              >
                개인 소유 TOP 10
              </button>
            </div>

            {/* 필터 버튼 */}
            {activeTab === "popular" && (
              <div className="flex gap-2">
                {(["거래대금", "거래량", "급상승", "급하락"] as FilterType[]).map((filter) => (
                  <Chip
                    key={filter}
                    label={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-3 py-1 rounded-full text-Caption_L_Light border transition-colors",
                      activeFilter === filter
                        ? "bg-sub-blue text-white border-sub-blue"
                        : "bg-white text-gray-400 border-gray-200"
                    )}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 종목 리스트 테이블 헤더 (TradingVolumeRank 너비에 맞춰 조정) */}
          <div className="flex border-y text-Body_M_Light border-gray-200 py-2 text-sm text-black">
            <span className="w-[87px] text-center">순위</span>
            <span className="w-[120px]">종목명</span>
            <span className="w-[62px] text-right">현재가</span>
            <span className="w-[120px] text-right px-5">등락률</span>
            <span className="w-[104px] text-right">거래대금</span>
            <span className="w-[78px] text-center">차트</span>
          </div>

          {/* 리스트 아이템 */}
          <div className="flex flex-col">
            {isLoading && (
              <>
                {Array.from({ length: 10 }).map((_, i) => (
                  <TradingVolumeRankSkeleton key={i} className="border-none" />
                ))}
              </>
            )}
            {showMockFallback &&
              MOCK_FALLBACK.map((stock) => {
                const mockStockId = Number(stock.ticker);
                return (
                  <TradingVolumeRank
                    key={stock.ticker}
                    rank={stock.rank}
                    stockName={stock.name}
                    ticker={stock.ticker}
                    currentPrice={stock.price}
                    changeRate={stock.change}
                    tradingVolume={stock.vol}
                    chart={
                      Number.isNaN(mockStockId) || (dailySparklineByStockId.get(mockStockId)?.length ?? 0) < 2
                        ? undefined
                        : (
                          <MiniSparkline
                            values={dailySparklineByStockId.get(mockStockId) ?? []}
                            color={stock.change.startsWith("+") ? "#FF0000" : "#001AFF"}
                          />
                        )
                    }
                    onClick={() => {
                      setSelectedStock({
                        name: stock.name,
                        ticker: stock.ticker,
                        price: stock.price,
                        change: stock.change
                      });
                      navigate(Number.isNaN(mockStockId)
                        ? "/simulation"
                        : `/simulation/${mockStockId}`,
                      {
                        state: {
                          stockName: stock.name,
                          stockCode: stock.ticker,
                        },
                      });
                    }}
                    className={`border-none ${selectedStock.ticker === stock.ticker ? "bg-gray-50" : ""}`}
                  />
                );
              })
            }
            {showPersonalError && (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">
                개인 소유 TOP 10 데이터를 불러오지 못했습니다.
              </p>
            )}
            {showPersonalEmpty && (
              <p className="px-6 py-8 text-sm text-gray-400 text-center">
                개인 소유 종목 데이터가 없습니다.
              </p>
            )}
            {!isLoading && !isError && stockData && stockData.length > 0 && stockData.map((stock: StockWithPrice, index: number) => {
              const tickerText = stock.symbol || "-";
              const selectedKey = stock.symbol || String(stock.stockId);
              const sparklineStockId = toNumericStockId(stock.stockId);

              return (
                <RealTimeStockRow
                  key={stock.stockId}
                  stock={{ ...stock, symbol: tickerText }}
                  rank={index + 1}
                  isSelected={selectedStock.ticker === selectedKey}
                  isMarketOpen={isMarketOpen}
                  sparklineValues={sparklineStockId == null ? undefined : dailySparklineByStockId.get(sparklineStockId)}
                  onSelect={() => {
                    setSelectedStock({
                      name: stock.name,
                      ticker: selectedKey,
                      price: formatPrice(stock.close),
                      change: formatChangeRate(stock.prevDayChangePct)
                    });
                    navigate(`/simulation/${stock.stockId}`, {
                      state: {
                        stockName: stock.name,
                        stockCode: tickerText,
                      },
                    });
                  }}
                />
              );
            })}
          </div>
        </section>

        {/* 3. 테마 섹션 (우측) */}
        <section className="flex-1 p-8 flex flex-col gap-10 overflow-y-auto">
          {/* 테마 헤더 카드 */}
          <ThemeHeaderCard
            categoryName={selectedTheme?.name ?? (industryThemesQuery.isLoading ? "산업 테마 로딩중..." : "산업 테마")}
            changeRate={selectedTheme?.changeRate ?? 0}
            topStockNames={topStockNames}
            topByValueName={topByValueStock?.name ?? ""}
            showThemeList={showThemeList}
            onToggleThemeList={() => setShowThemeList((v) => !v)}
          />

          {/* 테마 리스트 (열림) OR 에어리어 차트 (닫힘) */}
          {showThemeList ? (
            industryThemes.length > 0 && (
              <ThemeListDropdown
                themes={industryThemes}
                selectedThemeId={selectedTheme?.id ?? ""}
                onSelectTheme={(id) => {
                  setSelectedThemeId(id);
                  setShowThemeList(false);
                }}
              />
            )
          ) : topByValueStock && selectedTheme ? (
            <ThemeStockChart
              themeId={selectedTheme.id}
              themeName={selectedTheme.name}
              stockId={topByValueStock.stockId}
              stockName={topByValueStock.name}
            />
          ) : (
            <ThemeStockChartSkeleton />
          )}

          {/* AI 분석 섹션 */}
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 items-start">
              <div className="bg-[#42d6ba] size-[50px] flex justify-center items-center p-4 rounded-lg shrink-0">
                <span className="text-white text-[20px] font-medium">AI</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[14px] text-gray-400">오늘의 테마 분석</span>
                <p className="text-[16px] font-medium text-black">
                  {themeAnalysis
                    ? themeAnalysis
                    : selectedTheme
                      ? `${selectedTheme.name} 테마 등락률 ${selectedTheme.changeRate >= 0 ? "+" : ""}${selectedTheme.changeRate.toFixed(2)}%. ${topStockNames.slice(0, 2).join(", ")} 등 주요 종목 주목`
                      : "테마 분석 데이터를 불러오는 중입니다..."}
                </p>
              </div>
            </div>
          </div>

          {/* 관련 뉴스 섹션 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[18px] font-bold text-black">경제뉴스</h3>
            <div ref={relatedNewsScrollRef} className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1">
              {latestNewsLoading ? (
                <p className="text-sm text-gray-400 py-4">뉴스를 불러오는 중...</p>
              ) : latestNews.length > 0 ? (
                <>
                  {latestNews.map((news) => {
                    const timeLabel = `${news.provider} · ${formatRelativeTime(news.publishedAt)}`;
                    return (
                      <RelatedNews
                        key={news.id}
                        sourceAndTime={timeLabel}
                        title={news.title}
                        onClick={() => openNews(news.url)}
                        className="border-gray-200 text-black transition-colors hover:border-[#42d6ba] hover:bg-[#f8fffd]"
                      />
                    );
                  })}
                  <div ref={relatedNewsSentinelRef} className="h-2 shrink-0" />
                  {latestNewsLoadingMore && (
                    <p className="text-sm text-gray-400 py-3 text-center">경제 뉴스를 더 불러오는 중...</p>
                  )}
                  {!economyNewsHasMore && (
                    <p className="text-xs text-gray-300 py-2 text-center">마지막 뉴스입니다.</p>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-400 py-4">표시할 뉴스가 없습니다.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;

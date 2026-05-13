import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLearningCompleted, type InvestmentType } from "@/pages/AILearning/learningData";
import PortfolioTabsPanel from "./components/PortfolioTabsPanel";
import SimulatorGateModal from "./components/SimulatorGateModal";
import StockTradeDetail from "./components/StockTradeDetail";
import { formatWon, type SimStock } from "./simMarketTypes";
import { useMarketStatus, useTopByVolumeWithPrices } from "@/hooks/useMarketQueries";
import type { StockWithPrice } from "@/api/market";

const readInvestmentType = (): InvestmentType | null => {
  const value = localStorage.getItem("investmentType");
  return value === "stable" || value === "balanced" || value === "aggressive" || value === "daytrader"
    ? value
    : null;
};

const toSimStock = (stock: StockWithPrice): SimStock => ({
  id: String(stock.stockId),
  name: stock.name,
  code: stock.symbol,
  volume: stock.volume,
  price: stock.close,
  changeRate: stock.prevDayChangePct,
});

const SimulationPage = () => {
  const navigate = useNavigate();
  const [investmentType] = useState<InvestmentType | null>(() => readInvestmentType());
  const [showGate, setShowGate] = useState(() => !isLearningCompleted(readInvestmentType()));
  const [selectedStock, setSelectedStock] = useState<SimStock | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(() => new Set());
  const { isMarketOpen } = useMarketStatus();
  const stocksQuery = useTopByVolumeWithPrices(isMarketOpen);

  const canUseSimulator = useMemo(() => isLearningCompleted(investmentType), [investmentType]);
  const stocks = useMemo(() => (stocksQuery.data ?? []).map(toSimStock), [stocksQuery.data]);

  const toggleFavorite = (stockId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(stockId)) {
        next.delete(stockId);
      } else {
        next.add(stockId);
      }
      return next;
    });
  };

  if (!canUseSimulator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-[#C7F3EB]/30 px-6 py-12">
        <div className="mx-auto max-w-4xl rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600">
            잠금
          </div>
          <h1 className="mb-3 text-3xl font-bold text-[#1D1E20]">투자 시뮬레이터가 잠겨 있습니다</h1>
          <p className="mb-8 text-[#696969]">
            발표용 index.html 기준에 따라 투자 성향별 5단계 학습을 완료해야 가상 투자 기능을 사용할 수 있습니다.
          </p>
          <button
            type="button"
            onClick={() => navigate("/ai-learning")}
            className="rounded-xl bg-gradient-to-r from-[#1F3B70] to-[#42D6BA] px-8 py-4 font-bold text-white shadow-lg hover:shadow-xl"
          >
            AI 학습으로 이동
          </button>
        </div>
        {showGate && (
          <SimulatorGateModal
            onClose={() => setShowGate(false)}
            onGoLearning={() => navigate("/ai-learning")}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-7xl">
        {selectedStock ? (
          <StockTradeDetail stock={selectedStock} onBack={() => setSelectedStock(null)} />
        ) : (
          <>
            <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-colors hover:border-[#42D6BA]">
                <p className="mb-2 text-sm text-[#909193]">보유 자산</p>
                <p className="mb-1 text-3xl font-bold text-[#1D1E20]">₩{formatWon(10000000)}</p>
                <p className="text-sm font-bold text-[#00A63E]">+5.2% (₩{formatWon(500000)})</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-colors hover:border-[#42D6BA]">
                <p className="mb-2 text-sm text-[#909193]">현금</p>
                <p className="mb-1 text-3xl font-bold text-[#1D1E20]">₩{formatWon(3500000)}</p>
                <p className="text-sm text-[#909193]">투자 가능 금액</p>
              </div>
              <div className="rounded-2xl border border-gray-100 bg-white p-6 transition-colors hover:border-[#42D6BA]">
                <p className="mb-2 text-sm text-[#909193]">수익률</p>
                <p className="mb-1 text-3xl font-bold text-[#00A63E]">+12.5%</p>
                <p className="text-sm text-[#909193]">전체 수익률</p>
              </div>
            </section>

            {stocksQuery.isLoading && (
              <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 text-sm text-[#909193]">
                백엔드에서 종목 가격을 불러오는 중입니다.
              </div>
            )}
            {!stocksQuery.isLoading && stocks.length === 0 && (
              <div className="mb-4 rounded-xl border border-gray-100 bg-white p-4 text-sm text-[#909193]">
                표시할 실데이터가 없습니다. 백엔드 KIS 키와 가격 저장 상태를 확인하세요.
              </div>
            )}
            <PortfolioTabsPanel
              stocks={stocks}
              favorites={favorites}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectStock={setSelectedStock}
              onToggleFavorite={toggleFavorite}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SimulationPage;

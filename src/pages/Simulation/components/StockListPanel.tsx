import { formatVolume, formatWon, type SimStock } from "../simMarketTypes";

interface StockListPanelProps {
  stocks: SimStock[];
  favorites: Set<string>;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectStock: (stock: SimStock) => void;
  onToggleFavorite: (stockId: string) => void;
}

const StockListPanel = ({
  stocks,
  favorites,
  searchQuery,
  onSearchChange,
  onSelectStock,
  onToggleFavorite,
}: StockListPanelProps) => {
  const filteredStocks = stocks.filter((stock) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return stock.name.toLowerCase().includes(query) || stock.code.includes(query);
  });

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#1D1E20]">주식 검색</h2>
            <p className="text-xs text-[#909193]">백엔드 실데이터 종목 리스트</p>
          </div>
          <span className="rounded-full bg-[#C7F3EB] px-3 py-1 text-xs font-bold text-[#1F3B70]">국내</span>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="주식 이름 또는 코드 입력"
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all placeholder:text-[#A5A6A9] focus:border-[#42D6BA] focus:bg-white focus:ring-2 focus:ring-[#C7F3EB]"
        />
      </div>

      <div className="max-h-[720px] divide-y divide-gray-100 overflow-y-auto">
        {filteredStocks.map((stock) => {
          const isUp = stock.changeRate >= 0;
          return (
            <button
              key={stock.id}
              type="button"
              onClick={() => onSelectStock(stock)}
              className="group w-full px-6 py-4 text-left transition-colors hover:bg-[#F8FFFD]"
            >
              <div className="flex items-center gap-4">
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
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg ${
                    favorites.has(stock.id) ? "border-amber-300 bg-amber-50 text-amber-500" : "border-gray-200 text-gray-300"
                  }`}
                >
                  ★
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#1D1E20] transition-colors group-hover:text-[#3AB8A8]">{stock.name}</p>
                  <p className="text-xs text-[#909193]">{stock.code}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#1D1E20]">{formatWon(stock.price)}</p>
                  <p className="text-xs text-[#909193]">거래량 {formatVolume(stock.volume)}</p>
                </div>
                <div className={`min-w-[86px] rounded-lg px-3 py-2 text-center text-sm font-bold ${
                  isUp ? "bg-red-50 text-[#FF0000]" : "bg-blue-50 text-[#001AFF]"
                }`}>
                  {isUp ? "+" : ""}
                  {stock.changeRate.toFixed(2)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default StockListPanel;

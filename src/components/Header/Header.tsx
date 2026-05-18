import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api/auth";
import { searchAll, type SearchLearningResult, type SearchStockResult } from "@/api/search";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/utils/cn";

export interface HeaderProps {
  activeMenu?: string;
  menus?: string[];
  onMenuClick?: (menu: string) => void;
  onProfileClick?: () => void;
  className?: string;
}

const DEFAULT_MENUS = [
  "홈",
  "투자 시뮬레이터",
  "AI 학습",
  "챌린지",
];

const SearchIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ArrowUpIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4 text-[#42D6BA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m6 15 6-6 6 6" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  activeMenu = "홈",
  menus = DEFAULT_MENUS,
  onMenuClick,
  className,
}) => {
  const navigate = useNavigate();
  const tokens = useAuthStore((state) => state.tokens);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [matchedStocks, setMatchedStocks] = useState<SearchStockResult[]>([]);
  const [matchedLearning, setMatchedLearning] = useState<SearchLearningResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [hasSearchError, setHasSearchError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  const normalizedQuery = query.trim();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isSearchOpen || normalizedQuery.length === 0) {
      setMatchedStocks([]);
      setMatchedLearning([]);
      setIsSearchLoading(false);
      setHasSearchError(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsSearchLoading(true);
      setHasSearchError(false);
      try {
        const result = await searchAll(normalizedQuery, 6);
        if (cancelled) return;
        setMatchedStocks(result.stocks);
        setMatchedLearning(result.learning);
      } catch {
        if (cancelled) return;
        setMatchedStocks([]);
        setMatchedLearning([]);
        setHasSearchError(true);
      } finally {
        if (!cancelled) {
          setIsSearchLoading(false);
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isSearchOpen, normalizedQuery]);

  const closeSearch = () => {
    setQuery("");
    setIsSearchOpen(false);
  };

  const handleStockSelect = (stock: SearchStockResult) => {
    const stockId = stock.stockId ?? stock.id;
    const stockIdText = String(stockId ?? "").trim();
    closeSearch();

    if (stockIdText) {
      navigate(`/simulation/${stockIdText}`, {
        state: {
          stockName: stock.name ?? "",
          stockCode: stock.code ?? "",
        },
      });
      return;
    }

    onMenuClick?.("투자 시뮬레이터");
  };

  const handleLearningSelect = (item: SearchLearningResult) => {
    closeSearch();
    navigate("/ai-learning", {
      state: {
        learningId: item.id,
        query: item.title ?? normalizedQuery,
      },
    });
  };

  const hasSearchResult = matchedStocks.length > 0 || matchedLearning.length > 0;

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } catch {
      // 서버 세션 정리에 실패해도 프론트 토큰은 반드시 제거해서 사용자를 로그아웃시킵니다.
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 flex h-20 w-full items-center justify-between border-b border-gray-200 bg-white px-8",
        className
      )}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onMenuClick?.("홈")}
          className="flex shrink-0 items-center gap-2.5"
          aria-label="홈으로 이동"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#42D6BA] text-sm font-bold text-white shadow-sm">
            F
          </div>
          <span className="text-2xl font-bold text-[#1D1E20]">FinVest</span>
        </button>

        <nav className="ml-10 flex items-center gap-8">
          {menus.map((menu) => (
            <button
              key={menu}
              type="button"
              onClick={() => onMenuClick?.(menu)}
              className={cn(
                "whitespace-nowrap border-b-2 py-2 text-[15px] font-medium transition-colors",
                activeMenu === menu
                  ? "border-[#42D6BA] text-[#1D1E20]"
                  : "border-transparent text-[#BDBDBD] hover:text-[#1D1E20]"
              )}
            >
              {menu}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        <div className="relative" ref={searchRef}>
          <div className="flex items-center gap-2 rounded-xl border border-transparent bg-gray-100 px-4 py-2.5 transition-all focus-within:border-[#42D6BA] focus-within:bg-white">
            <span className="text-[#909193]">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="종목명, 학습 콘텐츠 검색"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-48 bg-transparent text-sm text-[#1D1E20] outline-none placeholder:text-[#A5A6A9]"
            />
          </div>

          {isSearchOpen && normalizedQuery && (
            <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              {isSearchLoading && (
                <div className="border-b border-gray-100 px-5 py-3 text-sm text-[#909193]">검색 중...</div>
              )}

              {matchedStocks.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-bold uppercase text-[#909193]">주식 종목</div>
                  {matchedStocks.map((stock) => (
                    <button
                      key={String(stock.stockId ?? stock.id ?? stock.code ?? stock.name)}
                      type="button"
                      onClick={() => handleStockSelect(stock)}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[#C7F3EB]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#42D6BA] text-sm font-bold text-white">
                          {(stock.name ?? "?")[0]}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-[#1D1E20]">{stock.name ?? "이름 없는 종목"}</div>
                          <div className="text-xs text-[#909193]">{stock.code ?? stock.marketSegment ?? "종목 코드 없음"}</div>
                        </div>
                      </div>
                      <ArrowUpIcon />
                    </button>
                  ))}
                </div>
              )}

              {matchedLearning.length > 0 && (
                <div className="border-t border-gray-100 p-2">
                  <div className="px-3 py-2 text-xs font-bold uppercase text-[#909193]">AI 학습</div>
                  {matchedLearning.map((item) => (
                    <button
                      key={String(item.id ?? item.title)}
                      type="button"
                      onClick={() => handleLearningSelect(item)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#C7F3EB]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C7F3EB] text-sm font-bold text-[#3AB8A8]">
                        AI
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-[#1D1E20]">{item.title ?? "학습 콘텐츠"}</div>
                        <div className="text-xs text-[#3AB8A8]">{item.category ?? item.contentType ?? "AI 학습"}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isSearchLoading && hasSearchError && (
                <div className="p-6 text-center text-sm text-[#909193]">검색 중 문제가 발생했습니다.</div>
              )}

              {!isSearchLoading && !hasSearchError && !hasSearchResult && (
                <div className="p-6 text-center text-sm text-[#909193]">검색 결과가 없습니다.</div>
              )}
            </div>
          )}
        </div>

        {tokens && (
          <button
            type="button"
            onClick={() => void handleLogout()}
            disabled={isLoggingOut}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-[#696969] transition-all hover:border-[#42D6BA] hover:bg-[#C7F3EB]/40 hover:text-[#1D1E20] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="로그아웃"
          >
            {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;

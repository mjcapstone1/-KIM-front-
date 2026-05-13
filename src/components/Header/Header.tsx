import React, { useEffect, useRef, useState } from "react";
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

const SEARCH_DATA = {
  stocks: [
    { name: "삼성전자", code: "005930" },
    { name: "SK하이닉스", code: "000660" },
    { name: "NAVER", code: "035420" },
    { name: "카카오", code: "035720" },
    { name: "LG에너지솔루션", code: "373220" },
  ],
  learning: [
    { id: "1", title: "복리의 마법 이해하기", category: "기초" },
    { id: "2", title: "재무제표 읽는 법", category: "중급" },
    { id: "3", title: "ETF 투자 가이드", category: "기초" },
    { id: "4", title: "캔들스틱 차트 분석", category: "기술적 분석" },
  ],
};

const SearchIcon = () => (
  <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const BellIcon = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const matchedStocks = query
    ? SEARCH_DATA.stocks.filter((stock) => stock.name.includes(query) || stock.code.includes(query))
    : [];
  const matchedLearning = query
    ? SEARCH_DATA.learning.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))
    : [];

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

          {isSearchOpen && query && (
            <div className="absolute left-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              {matchedStocks.length > 0 && (
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-bold uppercase text-[#909193]">주식 종목</div>
                  {matchedStocks.map((stock) => (
                    <button
                      key={stock.code}
                      type="button"
                      onClick={() => {
                        onMenuClick?.("투자 시뮬레이터");
                        setQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[#C7F3EB]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#42D6BA] text-sm font-bold text-white">
                          {stock.name[0]}
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium text-[#1D1E20]">{stock.name}</div>
                          <div className="text-xs text-[#909193]">{stock.code}</div>
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
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onMenuClick?.("AI 학습");
                        setQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-[#C7F3EB]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C7F3EB] text-sm font-bold text-[#3AB8A8]">
                        AI
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-[#1D1E20]">{item.title}</div>
                        <div className="text-xs text-[#3AB8A8]">{item.category}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matchedStocks.length === 0 && matchedLearning.length === 0 && (
                <div className="p-6 text-center text-sm text-[#909193]">검색 결과가 없습니다.</div>
              )}
            </div>
          )}
        </div>

        <button type="button" className="rounded-xl p-2.5 transition-colors hover:bg-gray-100" aria-label="알림">
          <span className="relative block text-[#909193]">
            <BellIcon />
            <span className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#FF0000]" />
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;

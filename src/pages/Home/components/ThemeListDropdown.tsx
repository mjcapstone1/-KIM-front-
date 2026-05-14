import { useMemo } from "react";
import { cn } from "@/utils/cn";
import type { HomeThemeItem } from "@/api/market";
import LineChartIcon from "@/assets/svgs/LineChartIcon";

const THEME_NAME_COLORS = [
  "#6C5CE7", // 보라
  "#E17055", // 코랄
  "#0984E3", // 파랑
  "#F39C12", // 오렌지
  "#E84393", // 핑크
  "#00B894", // 민트
  "#D63031", // 레드
  "#2D98DA", // 스카이블루
  "#8854D0", // 진보라
  "#20BF6B", // 초록
  "#FA8231", // 주황
  "#3867D6", // 남색
];

function getThemeColor(themeId: string): string {
  const seed = themeId
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return THEME_NAME_COLORS[seed % THEME_NAME_COLORS.length];
}

interface ThemeListDropdownProps {
  themes: HomeThemeItem[];
  selectedThemeId: string;
  onSelectTheme: (id: string) => void;
}

const ThemeListDropdown = ({
  themes,
  selectedThemeId,
  onSelectTheme,
}: ThemeListDropdownProps) => {
  const sorted = useMemo(() => {
    return [...themes].sort((a, b) => b.changeRate - a.changeRate);
  }, [themes]);

  return (
    <div className="flex flex-col gap-4 border border-gray-200 rounded-lg p-4 bg-white">
      <div className="grid grid-cols-2 gap-3 h-[250px] overflow-y-auto">
        {sorted.map((cat, idx) => {
          const rate = cat.changeRate;
          const isPositive = rate >= 0;
          const isSelected = cat.id === selectedThemeId;
          const topStock = cat.topStockName || cat.topStock;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectTheme(cat.id)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg text-left transition-colors border",
                isSelected
                  ? "border-[#42d6ba] bg-[#E8FAF6]"
                  : "border-gray-100 hover:border-gray-300",
                idx % 2 === 0 && !isSelected && "bg-[#C7F3EB]/30"
              )}
            >
              <div className="bg-[#42d6ba]/20 p-1.5 rounded shrink-0">
                <LineChartIcon
                  className="size-4"
                  color={isPositive ? "#FF0000" : "#001AFF"}
                  direction={isPositive ? "up" : "down"}
                />
              </div>
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span
                    className="text-[13px] font-medium truncate"
                    style={{ color: cat.color || getThemeColor(cat.id) }}
                  >
                    {cat.name}
                  </span>
                  {topStock && (
                    <span className="text-[11px] text-gray-400 truncate">
                      {topStock}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[12px] font-medium shrink-0 ml-2",
                    isPositive ? "text-etc-red" : "text-etc-blue"
                  )}
                >
                  {isPositive ? "+" : ""}{rate.toFixed(2)}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeListDropdown;

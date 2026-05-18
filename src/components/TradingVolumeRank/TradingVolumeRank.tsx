import { cn } from "@/utils/cn";
import ChangeRateIcon from "@/assets/svgs/ChangeRateIcon";
import LineChartIcon from "@/assets/svgs/LineChartIcon";

// Tailwind etc 색상 값 (tailwind.config.js와 동일)
const COLORS = {
  "etc-red": "#FF0000",
  "etc-blue": "#001AFF",
} as const;

const RANK_GRID_CLASS = "grid-cols-[44px_minmax(150px,1fr)_108px_118px_132px_100px]";

export interface TradingVolumeRankProps {
  /** 순위 */
  rank: number;
  /** 종목명 */
  stockName: string;
  /** 티커 (예: "TSLA") */
  ticker: string;
  /** 현재가 */
  currentPrice: string;
  /** 등락률 (예: "+5.67%" 또는 "-2.34%") */
  changeRate: string;
  /** 거래대금 (예: "980억") */
  tradingVolume: string;
  /** 차트 컴포넌트 또는 이미지 (지정하지 않으면 등락률에 따라 자동 생성) */
  chart?: React.ReactNode;
  /** 추가 스타일 */
  className?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 등락률 업데이트 플래시 토큰 */
  changeFlashToken?: number;
}

export const TradingVolumeRank = ({
  rank,
  stockName,
  ticker,
  currentPrice,
  changeRate,
  tradingVolume,
  chart,
  className,
  onClick,
  changeFlashToken,
}: TradingVolumeRankProps) => {
  // 등락률의 부호 확인 (양수면 빨간색, 음수면 파란색)
  const isPositive = changeRate.startsWith("+");
  const changeColor = isPositive ? "text-etc-red" : "text-etc-blue";
  const iconColor = isPositive ? COLORS["etc-red"] : COLORS["etc-blue"];
  const iconDirection = isPositive ? "up" : "down";
  const flashColorClass = isPositive ? "bg-etc-red/20" : "bg-etc-blue/20";

  return (
    <div
      className={cn(
        `grid ${RANK_GRID_CLASS} items-center gap-3 w-full px-6 py-[14px] border-b border-gray-200 border-solid`,
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`${rank}위: ${stockName} (${ticker}) - ${currentPrice}, ${changeRate}, ${tradingVolume}`}
    >
      {/* 순위 */}
      <div className="flex items-center justify-center">
        <p className="text-Body_M_Light text-black text-center w-full">
          {rank}
        </p>
      </div>

      {/* 종목명 */}
      <div className="flex min-w-0 flex-col items-start">
        <p className="text-Body_M_Light text-black w-full truncate">
          {stockName}
        </p>
        {/* #747474 => 300으로 되어있어서 인라인 style로 */}
        <p className="text-Caption_M_Light w-full truncate" style={{ color: "#747474" }}>
          {ticker}
        </p>
      </div>

      {/* 현재가 */}
      <div className="flex items-center justify-end">
        <p className="text-Body_M_Light text-black text-right w-full whitespace-nowrap">
          {currentPrice}
        </p>
      </div>

      {/* 등락률 */}
      <div className="flex items-center justify-end">
        <div className="relative inline-flex items-start gap-[4px] rounded-md px-1 py-[1px]">
          {changeFlashToken != null && changeFlashToken > 0 && (
            <div
              key={`change-${changeFlashToken}`}
              className={cn(
                "pointer-events-none absolute inset-0 rounded-md animate-[tv-rank-flash_900ms_ease-out_forwards]",
                flashColorClass,
              )}
            />
          )}
          <ChangeRateIcon
            className="relative z-10 h-[26px] w-6 shrink-0"
            color={iconColor}
            direction={iconDirection}
            ariaLabel="등락률 차트"
          />
          <p className={cn("relative z-10 text-Body_M_Light text-right whitespace-nowrap", changeColor)}>
            {changeRate}
          </p>
        </div>
      </div>

      {/* 거래대금 */}
      <div className="flex items-center justify-end">
        <p className="text-Body_M_Light text-black text-right whitespace-nowrap">
          {tradingVolume}
        </p>
      </div>

      {/* 차트 */}
      <div className="h-[44px] w-[100px] justify-self-end overflow-hidden py-[8px]">
        {chart || (
          <LineChartIcon
            color={iconColor}
            direction={iconDirection}
            className="w-full h-full"
            ariaLabel="거래대금 차트"
          />
        )}
      </div>
    </div>
  );
};

// 스켈레톤 컴포넌트
export const TradingVolumeRankSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        `grid ${RANK_GRID_CLASS} items-center gap-3 w-full px-6 py-[14px] border-b border-gray-200 border-solid animate-pulse`,
        className
      )}
    >
      {/* 순위 */}
      <div className="flex items-center justify-center">
        <div className="h-4 w-6 bg-gray-200 rounded" />
      </div>

      {/* 종목명 */}
      <div className="flex min-w-0 flex-col items-start gap-1">
        <div className="h-4 w-16 bg-gray-200 rounded" />
        <div className="h-3 w-12 bg-gray-100 rounded" />
      </div>

      {/* 현재가 */}
      <div className="flex items-center justify-end">
        <div className="h-4 w-14 bg-gray-200 rounded" />
      </div>

      {/* 등락률 */}
      <div className="flex gap-[4px] items-center justify-end">
        <div className="h-6 w-6 bg-gray-200 rounded" />
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>

      {/* 거래대금 */}
      <div className="flex items-center justify-end">
        <div className="h-4 w-12 bg-gray-200 rounded" />
      </div>

      {/* 차트 */}
      <div className="h-[44px] w-[100px] justify-self-end py-[8px]">
        <div className="w-full h-full bg-gray-200 rounded" />
      </div>
    </div>
  );
};

export default TradingVolumeRank;

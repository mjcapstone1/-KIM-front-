import React from "react";
import { cn } from "@/utils/cn";
import { formatReturnRate } from "@/utils/formatReturnRate";
import type { SquadContributionItem } from "@/api/gamification";

export interface SquadMVPProps {
  items: SquadContributionItem[];
  onViewAll?: () => void;
  className?: string;
}

const INITIAL_DISPLAY_COUNT = 3;

export const SquadMVP: React.FC<SquadMVPProps> = ({ items, onViewAll, className }) => {
  const sorted = [...items].sort((a, b) => b.returnRate - a.returnRate);
  const displayItems = sorted.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className={cn("bg-white rounded-lg p-6 shadow-sm border border-gray-200", className)}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <h3 className="text-Subtitle_M_Medium text-black font-bold">우리 학교 MVP</h3>
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-Body_S_Light text-main-1 font-medium hover:underline"
          >
            소속원 전체 보기
          </button>
        )}
      </div>
      <p className="text-Caption_L_Light text-gray-400 mb-6">이번 주 수익률 랭킹</p>

      <div className="flex flex-col gap-3">
        {displayItems.map((item, index) => {
          const rank = index + 1;
          return (
          <div
            key={item.nickname}
            className="flex items-center justify-between p-3 rounded-lg border border-transparent hover:bg-gray-50 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-Body_M_Light text-black w-8 text-center font-medium">
                {rank <= 3
                  ? rank === 1
                    ? "🥇"
                    : rank === 2
                    ? "🥈"
                    : "🥉"
                  : `#${rank}`}
              </span>
              <div className="size-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                {item.nickname.substring(0, 1)}
              </div>
              <span className="text-Body_M_Light text-black font-medium">
                {item.nickname}
              </span>
            </div>
            <span className="text-Body_M_Light text-main-1 font-bold">
              {formatReturnRate(item.returnRate)}
            </span>
          </div>
          );
        })}
      </div>
    </div>
  );
};

export default SquadMVP;

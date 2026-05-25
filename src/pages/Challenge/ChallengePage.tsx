import { useEffect, useMemo, useState } from "react";
import { assetRankingApi, type RankingPeriod, type UserProfitRankingItem } from "@/api/asset";
import { useAuthStore } from "@/store/useAuthStore";
import { formatChangeRate, formatPrice } from "@/utils/formatStock";

type PeriodType = "daily" | "weekly" | "monthly";

const periodMap: Record<PeriodType, RankingPeriod> = {
  daily: "DAILY",
  weekly: "WEEKLY",
  monthly: "MONTHLY",
};

const periodLabels: Record<PeriodType, string> = {
  daily: "일간",
  weekly: "주간",
  monthly: "월간",
};

function displayName(item: UserProfitRankingItem): string {
  if (item.nickname?.trim()) {
    return item.nickname;
  }

  return item.userId.length > 10 ? `${item.userId.slice(0, 10)}...` : item.userId;
}

function rankBadgeClass(rank: number): string {
  if (rank === 1) return "bg-yellow-100 text-yellow-700 border-yellow-300";
  if (rank === 2) return "bg-slate-100 text-slate-700 border-slate-300";
  if (rank === 3) return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-white text-gray-500 border-gray-200";
}

export default function ChallengePage() {
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<PeriodType>("weekly");
  const [rankingData, setRankingData] = useState<UserProfitRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    assetRankingApi
      .getUserProfitRanking(periodMap[period], 0, 100)
      .then((data) => {
        if (cancelled) return;
        setRankingData(data.items ?? []);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("수익률 랭킹 API 오류:", err);
        setError("수익률 랭킹을 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [period, reloadKey]);

  const sortedRankings = useMemo(
    () => [...rankingData].sort((a, b) => a.rank - b.rank),
    [rankingData],
  );

  const myRanking = useMemo(() => {
    if (!user?.userId) return null;
    return sortedRankings.find((item) => item.userId === user.userId) ?? null;
  }, [sortedRankings, user?.userId]);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-100">
      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-8 py-10 2xl:px-0">
        <section className="rounded-[32px] bg-gradient-to-br from-[#1F3B73] via-[#328E9D] to-[#5ED9B8] px-8 py-10 text-white shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-lg font-semibold text-white/75">Squad Challenge</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">유저별 수익률 랭킹</h1>
              <p className="mt-4 text-xl font-medium text-white/85">
                스쿼드 점수나 XP 없이, 계정별 주식 수익률이 높은 순서대로 보여줍니다.
              </p>
            </div>

            <div className="grid min-w-[260px] gap-3 rounded-3xl bg-white/15 p-5 backdrop-blur">
              <span className="text-sm font-semibold text-white/70">내 현재 순위</span>
              {myRanking ? (
                <>
                  <strong className="text-3xl font-black">{myRanking.rank}위</strong>
                  <span className="text-lg font-bold">{formatChangeRate(myRanking.returnRate)}</span>
                  <span className="text-sm text-white/75">평가 손익 {formatPrice(myRanking.profitLoss)}</span>
                </>
              ) : (
                <>
                  <strong className="text-2xl font-black">랭킹 집계 전</strong>
                  <span className="text-sm text-white/75">거래 기록이 생기면 여기에 표시됩니다.</span>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 border-b border-gray-100 pb-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-gray-900">수익률 순위</h2>
              <p className="mt-2 text-base font-medium text-gray-500">
                {periodLabels[period]} 기준 수익률 내림차순으로 정렬됩니다.
              </p>
            </div>

            <div className="flex w-full gap-2 rounded-2xl bg-gray-100 p-1 lg:w-auto">
              {(Object.keys(periodLabels) as PeriodType[]).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`flex-1 rounded-xl px-5 py-3 text-base font-bold transition lg:flex-none ${
                    period === key
                      ? "bg-main-1 text-white shadow-sm"
                      : "text-gray-500 hover:bg-white hover:text-gray-900"
                  }`}
                  aria-pressed={period === key}
                >
                  {periodLabels[key]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-3 py-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl bg-gray-100" />
              ))}
            </div>
          ) : error ? (
            <div className="my-8 rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center">
              <p className="text-lg font-bold text-red-600">{error}</p>
              <button
                type="button"
                onClick={() => setReloadKey((current) => current + 1)}
                className="mt-4 rounded-xl bg-red-500 px-5 py-2 text-sm font-bold text-white"
              >
                다시 불러오기
              </button>
            </div>
          ) : sortedRankings.length === 0 ? (
            <div className="my-8 rounded-2xl border border-gray-100 bg-gray-50 px-6 py-14 text-center">
              <p className="text-xl font-black text-gray-800">아직 랭킹 데이터가 없습니다.</p>
              <p className="mt-2 text-base font-medium text-gray-500">
                유저들의 거래와 수익률 스냅샷이 쌓이면 순위가 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sortedRankings.map((item) => {
                const isMine = user?.userId === item.userId;
                const isPositive = item.returnRate >= 0;

                return (
                  <article
                    key={`${item.rank}-${item.userId}`}
                    className={`grid grid-cols-[64px_1fr] items-center gap-4 py-5 md:grid-cols-[80px_1fr_160px_180px] ${
                      isMine ? "rounded-2xl bg-main-1/10 px-4" : "px-4"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-lg font-black ${rankBadgeClass(
                        item.rank,
                      )}`}
                    >
                      {item.rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-xl font-black text-gray-900">{displayName(item)}</h3>
                        {isMine ? (
                          <span className="rounded-full bg-main-1 px-3 py-1 text-xs font-bold text-white">나</span>
                        ) : null}
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-gray-400">{item.userId}</p>
                    </div>

                    <div className="col-start-2 md:col-start-auto">
                      <p className="text-sm font-bold text-gray-400">수익률</p>
                      <p className={`mt-1 text-2xl font-black ${isPositive ? "text-red-500" : "text-blue-600"}`}>
                        {formatChangeRate(item.returnRate)}
                      </p>
                    </div>

                    <div className="col-start-2 md:col-start-auto md:text-right">
                      <p className="text-sm font-bold text-gray-400">평가 손익</p>
                      <p className={`mt-1 text-xl font-black ${isPositive ? "text-red-500" : "text-blue-600"}`}>
                        {formatPrice(item.profitLoss)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

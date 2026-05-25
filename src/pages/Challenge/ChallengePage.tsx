import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import {
  SquadWeeklyBattle,
  SquadRanking,
  SquadMVP,
  SquadInfoPanel,
} from "@/components";
import { SquadRankingModal } from "@/components/SquadRankingModal";
import {
  gamificationApi,
  type SquadRankingItem,
  type SquadContributionItem,
  type MySquadInfo,
  type SquadItem,
} from "@/api/gamification";

const SkeletonBlock = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 ${className}`}>
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-5 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="space-y-3 mt-4">
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const SquadFallbackCard = ({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-8 text-center">
    <p className="text-Body_M_Medium text-black mb-2">{title}</p>
    <p className="text-sm text-gray-400 mb-4">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

const isNotFoundError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;
  const maybeAxiosError = error as AxiosError;
  return maybeAxiosError.response?.status === 404;
};

type SchoolActionMode = "join" | "create";

const ChallengePage = () => {
  const [squadRanking, setSquadRanking] = useState<SquadRankingItem[]>([]);
  const [squadList, setSquadList] = useState<SquadItem[]>([]);
  const [squadSearchKeyword, setSquadSearchKeyword] = useState("");
  const [schoolActionMode, setSchoolActionMode] = useState<SchoolActionMode>("join");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolRegion, setNewSchoolRegion] = useState("");
  const [squadContributions, setSquadContributions] = useState<SquadContributionItem[]>([]);
  const [mySquadInfo, setMySquadInfo] = useState<MySquadInfo | null>(null);
  const [hasMySquad, setHasMySquad] = useState<boolean | null>(null);
  const [squadTabError, setSquadTabError] = useState<string | null>(null);
  const [squadRankingError, setSquadRankingError] = useState<string | null>(null);
  const [squadContributionError, setSquadContributionError] = useState<string | null>(null);
  const [joiningSquadId, setJoiningSquadId] = useState<number | string | null>(null);
  const [squadJoinError, setSquadJoinError] = useState<string | null>(null);
  const [creatingSquad, setCreatingSquad] = useState(false);
  const [squadCreateError, setSquadCreateError] = useState<string | null>(null);
  const [squadLoading, setSquadLoading] = useState(false);
  const [squadLoaded, setSquadLoaded] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);

  const refetchSquadData = () => {
    setSquadLoaded(false);
    setSquadLoading(false);
    setSquadTabError(null);
    setSquadRankingError(null);
    setSquadContributionError(null);
    setSquadCreateError(null);
    setSquadJoinError(null);
  };

  useEffect(() => {
    if (squadLoaded) return;

    let cancelled = false;

    const fetchSquadData = async () => {
      setSquadLoading(true);
      setSquadTabError(null);
      setSquadRankingError(null);
      setSquadContributionError(null);

      const [mySquadResult, rankingResult, squadListResult, contributionsResult] = await Promise.allSettled([
        gamificationApi.getMySquad(),
        gamificationApi.getSquadRanking(),
        gamificationApi.getSquads(),
        gamificationApi.getMySquadContributions(),
      ]);

      if (cancelled) return;

      if (mySquadResult.status === "fulfilled") {
        setMySquadInfo(mySquadResult.value);
        setHasMySquad(mySquadResult.value != null);
      } else {
        setMySquadInfo(null);
        setHasMySquad(false);
        if (!isNotFoundError(mySquadResult.reason)) {
          setSquadTabError("스쿼드 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.");
        }
      }

      if (rankingResult.status === "fulfilled") {
        setSquadRanking(rankingResult.value);
      } else {
        setSquadRanking([]);
        setSquadRankingError("스쿼드 랭킹을 불러오지 못했어요.");
      }

      if (squadListResult.status === "fulfilled") {
        if (squadListResult.value.length > 0) {
          setSquadList(squadListResult.value);
        } else if (rankingResult.status === "fulfilled") {
          setSquadList(
            rankingResult.value.map((item) => ({
              squadId: item.squadId,
              squadName: item.squadName,
              currentRanking: item.currentRanking,
              totalXp: item.totalXp,
            })),
          );
        }
      }

      if (contributionsResult.status === "fulfilled") {
        setSquadContributions(contributionsResult.value);
      } else {
        setSquadContributions([]);
        setSquadContributionError("스쿼드 기여도 정보를 불러오지 못했어요.");
      }

      setSquadLoading(false);
      setSquadLoaded(true);
    };

    fetchSquadData();

    return () => {
      cancelled = true;
    };
  }, [squadLoaded]);

  const handleJoinSquad = async (squadId: number | string) => {
    setJoiningSquadId(squadId);
    setSquadJoinError(null);

    try {
      await gamificationApi.joinSquad(squadId);
      setHasMySquad(true);
      setSquadLoaded(false);
    } catch {
      setSquadJoinError("스쿼드 가입에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setJoiningSquadId(null);
    }
  };

  const handleCreateSquad = async () => {
    const schoolName = newSchoolName.trim();
    const region = newSchoolRegion.trim();

    if (!schoolName) {
      setSquadCreateError("학교 이름을 입력해 주세요.");
      return;
    }

    setCreatingSquad(true);
    setSquadCreateError(null);

    try {
      await gamificationApi.createSquad({
        squadName: schoolName,
        ...(region ? { region } : {}),
      });
      setNewSchoolName("");
      setNewSchoolRegion("");
      setHasMySquad(true);
      setSchoolActionMode("join");
      setSquadLoaded(false);
    } catch (error) {
      const maybeAxiosError = error as AxiosError<{ message?: string }>;
      setSquadCreateError(maybeAxiosError.response?.data?.message ?? "학교 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setCreatingSquad(false);
    }
  };

  const mySquadId = mySquadInfo?.squadId ?? null;
  const mySquadData = mySquadId == null
    ? null
    : squadRanking.find((item) => String(item.squadId) === String(mySquadId)) ?? null;

  const rivalSquad = useMemo(() => {
    if (!Array.isArray(squadRanking) || !mySquadData) return null;
    const sorted = [...squadRanking].sort((a, b) => a.currentRanking - b.currentRanking);
    const myIndex = sorted.findIndex((s) => s.squadId === mySquadId);
    if (myIndex <= 0) return null;
    return sorted[myIndex - 1];
  }, [mySquadData, mySquadId, squadRanking]);

  const myContributionPercentile = useMemo(() => {
    if (!Array.isArray(squadContributions) || squadContributions.length === 0) return 50;
    const totalMembers = squadContributions.length;
    const myRanking = squadContributions[Math.ceil(totalMembers / 2) - 1]?.ranking
      ?? Math.ceil(totalMembers / 2);
    return (myRanking / totalMembers) * 100;
  }, [squadContributions]);

  const renderJoinSquad = () => {
    const normalizedKeyword = squadSearchKeyword.trim().toLowerCase();
    const joinableSquads = squadList
      .filter((item) => {
        if (!normalizedKeyword) return true;
        const name = item.squadName.toLowerCase();
        const region = (item.region ?? "").toLowerCase();
        return name.includes(normalizedKeyword) || region.includes(normalizedKeyword);
      });

    return (
      <section className="w-full flex flex-col gap-5">
        <div className="rounded-2xl border border-[#D7EFEA] bg-gradient-to-r from-[#EFFFFB] via-[#F4FCFA] to-white p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex flex-col gap-2">
              <h1 className="text-[30px] leading-[38px] font-bold text-[#12212A]">스쿼드 챌린지</h1>
              <p className="text-sm text-[#4D6A77]">
                같은 학교 유저들과 함께 주식 수익률 랭킹을 확인하세요.
              </p>
            </div>
            <div className="inline-flex items-center rounded-full bg-white px-4 py-2 border border-[#C9EDE5]">
              <span className="text-sm font-semibold text-[#1D8D79]">총 {joinableSquads.length}개 학교</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white p-2 border border-[#E4ECEF]">
          <button
            type="button"
            onClick={() => setSchoolActionMode("join")}
            className={`rounded-xl px-5 py-4 text-base font-bold transition ${
              schoolActionMode === "join"
                ? "bg-main-1 text-white shadow-sm"
                : "bg-gray-50 text-gray-500 hover:bg-[#EFFBF8] hover:text-main-1"
            }`}
            aria-pressed={schoolActionMode === "join"}
          >
            학교 가입하기
          </button>
          <button
            type="button"
            onClick={() => setSchoolActionMode("create")}
            className={`rounded-xl px-5 py-4 text-base font-bold transition ${
              schoolActionMode === "create"
                ? "bg-main-1 text-white shadow-sm"
                : "bg-gray-50 text-gray-500 hover:bg-[#EFFBF8] hover:text-main-1"
            }`}
            aria-pressed={schoolActionMode === "create"}
          >
            학교 생성하기
          </button>
        </div>

        {squadJoinError && (
          <p className="text-sm text-etc-red">{squadJoinError}</p>
        )}

        {squadCreateError && (
          <p className="text-sm text-etc-red">{squadCreateError}</p>
        )}

        {schoolActionMode === "create" ? (
          <div className="rounded-2xl border border-[#D7EFEA] bg-white p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-bold text-[#12212A]">새 학교 만들기</h2>
              <p className="text-sm text-[#6F858F]">
                학교를 만들면 자동으로 그 학교에 가입됩니다.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[1fr_240px]">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#314B56]">학교 이름</span>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  placeholder="예: 한국대학교"
                  className="rounded-xl border border-[#DDE8EC] px-4 py-3 text-sm text-[#14222B] outline-none focus:border-main-1"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-semibold text-[#314B56]">지역 선택사항</span>
                <input
                  type="text"
                  value={newSchoolRegion}
                  onChange={(e) => setNewSchoolRegion(e.target.value)}
                  placeholder="예: 서울"
                  className="rounded-xl border border-[#DDE8EC] px-4 py-3 text-sm text-[#14222B] outline-none focus:border-main-1"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={handleCreateSquad}
                disabled={creatingSquad}
                className="rounded-xl bg-main-1 px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {creatingSquad ? "생성 중..." : "학교 생성하고 가입하기"}
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-[#E4ECEF] bg-white px-4 py-3">
              <input
                type="text"
                value={squadSearchKeyword}
                onChange={(e) => setSquadSearchKeyword(e.target.value)}
                placeholder="학교명 또는 지역으로 검색"
                className="w-full bg-transparent text-sm text-[#14222B] placeholder:text-[#9AAEB8] outline-none"
                aria-label="학교 검색"
              />
            </div>

            {joinableSquads.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {joinableSquads.map((item) => (
                  <div
                    key={item.squadId}
                    className="group flex items-center justify-between rounded-xl border border-[#E4ECEF] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all hover:border-[#8EDBCB] hover:shadow-[0_6px_18px_rgba(33,154,132,0.12)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-11 rounded-xl bg-[#ECF9F6] text-[#1D8D79] flex items-center justify-center text-lg shrink-0">
                        {item.squadName.substring(0, 1)}
                      </div>
                      <div className="min-w-0 flex flex-col gap-1">
                        <span className="text-[16px] font-semibold text-[#14222B] truncate">{item.squadName}</span>
                        <div className="flex items-center gap-2 text-xs">
                          {item.region && (
                            <span className="inline-flex items-center rounded-full bg-[#F3FAF8] border border-[#D8EFEA] px-2 py-0.5 text-[#1D8D79]">
                              {item.region}
                            </span>
                          )}
                          {typeof item.currentRanking === "number" ? (
                            <span className="text-[#5C7682]">현재 #{item.currentRanking}위</span>
                          ) : (
                            <span className="text-[#8AA0AA]">생성된 학교</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-lg bg-main-1 px-4 py-2 text-white text-sm font-semibold disabled:opacity-60 shrink-0"
                      onClick={() => handleJoinSquad(item.squadId)}
                      disabled={joiningSquadId === item.squadId}
                    >
                      {joiningSquadId === item.squadId ? "가입 중..." : "가입하기"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-400">
                {squadSearchKeyword.trim()
                  ? "검색 결과가 없습니다. 다른 학교명이나 지역으로 검색해 보세요."
                  : "가입 가능한 학교가 없습니다. 먼저 학교를 생성해 주세요."}
              </div>
            )}
          </>
        )}
      </section>
    );
  };

  const renderSquadDashboard = () => (
    <>
      <section className="flex-1 flex flex-col gap-6">
        {mySquadData ? (
          <SquadWeeklyBattle mySquad={mySquadData} rivalSquad={rivalSquad} />
        ) : (
          <SquadFallbackCard
            title="주간 배틀 데이터를 준비 중이에요"
            description="내 스쿼드 랭킹 정보가 없어서 배틀 현황을 표시할 수 없습니다."
            actionLabel="새로고침"
            onAction={refetchSquadData}
          />
        )}
        {squadRanking.length > 0 ? (
          <SquadRanking
            items={squadRanking}
            mySquadId={mySquadId}
            onViewAll={() => setShowRankingModal(true)}
          />
        ) : (
          <SquadFallbackCard
            title={squadRankingError ? "스쿼드 랭킹을 불러오지 못했어요" : "아직 스쿼드 랭킹 데이터가 없어요"}
            description={
              squadRankingError
                ? "네트워크 상태를 확인하고 다시 시도해 주세요."
                : "주간 랭킹 집계가 시작되면 여기에 순위가 표시됩니다."
            }
            actionLabel="다시 시도"
            onAction={refetchSquadData}
          />
        )}
        {squadContributions.length > 0 ? (
          <SquadMVP
            items={squadContributions}
            onViewAll={() => setShowContributionModal(true)}
          />
        ) : (
          <SquadFallbackCard
            title={squadContributionError ? "수익률 데이터를 불러오지 못했어요" : "이번 주 수익률 집계 전이에요"}
            description={
              squadContributionError
                ? "잠시 후 다시 시도해 주세요."
                : "스쿼드 수익률이 집계되면 MVP 랭킹이 표시됩니다."
            }
            actionLabel="다시 시도"
            onAction={refetchSquadData}
          />
        )}
      </section>

      <aside className="w-[360px] shrink-0">
        {mySquadData ? (
          <SquadInfoPanel
            squadName={mySquadData.squadName}
            currentRanking={mySquadData.currentRanking}
            weeklyXpChangeRate={mySquadData.weeklyXpChangeRate}
            myContributionPercentile={myContributionPercentile}
          />
        ) : (
          <SquadFallbackCard
            title="내 스쿼드 요약이 비어 있어요"
            description="스쿼드 정보가 집계되면 우측 패널에 상세 현황이 표시됩니다."
            actionLabel="다시 시도"
            onAction={refetchSquadData}
          />
        )}
      </aside>
    </>
  );

  return (
    <div className="bg-gray-100 min-h-screen">
      <main className="flex flex-col px-32 py-10 gap-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-Headline_L_Bold text-black">스쿼드 챌린지</h1>
            <p className="mt-2 text-Body_M_Light text-gray-400">
              학교별 주식 수익률 순위와 팀 수익률을 확인하세요.
            </p>
          </div>
        </div>

        {squadLoading || hasMySquad === null ? (
          <div className="flex gap-10">
            <section className="flex-1 flex flex-col gap-6">
              <SkeletonBlock />
              <SkeletonBlock />
              <SkeletonBlock />
            </section>
            <aside className="w-[360px] shrink-0">
              <SkeletonBlock className="h-[400px]" />
            </aside>
          </div>
        ) : squadTabError ? (
          <SquadFallbackCard
            title="스쿼드 챌린지 정보를 가져오지 못했어요"
            description={squadTabError}
            actionLabel="다시 시도"
            onAction={refetchSquadData}
          />
        ) : !hasMySquad ? (
          renderJoinSquad()
        ) : (
          <>
            {renderJoinSquad()}
            <div className="flex gap-10">
              {renderSquadDashboard()}
            </div>
          </>
        )}
      </main>

      <SquadRankingModal
        isOpen={showRankingModal}
        onClose={() => setShowRankingModal(false)}
        variant="university"
        squadRankingItems={squadRanking}
        mySquadId={mySquadId}
      />

      <SquadRankingModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        variant="contribution"
        contributionItems={squadContributions}
        myNickname={undefined}
      />
    </div>
  );
};

export default ChallengePage;

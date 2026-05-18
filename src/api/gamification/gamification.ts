import { gamificationApiClient } from "./client";

// ─── 타입 정의 ───

export type SquadRankingItem = {
  squadId: number | string;
  squadName: string;
  currentRanking: number;
  totalXp: number;
  weeklyXp: number;
  weeklyXpChangeRate: number;
  rankingChange: number;
  returnRate?: number;
};

export type SquadContributionItem = {
  nickname: string;
  ranking: number;
  weeklyContributionXp: number;
  returnRate: number;
  stockReturnRate?: number;
};

export type MyXpInfo = {
  userId: string;
  nickname?: string;
  totalXp: number;
  level: number;
};

export type UserRankingItem = {
  userId: string;
  nickname: string;
  ranking: number;
  currentXp: number;
  periodXp: number;
  previousPeriodXp: number;
  growthRate: number;
};

export type RankingPeriod = "DAILY" | "WEEKLY" | "MONTHLY";

export type BadgeInfo = {
  badge: string;
  displayName: string;
  acquiredAt: string;
};

export type SquadItem = {
  squadId: number | string;
  squadName: string;
  region?: string;
  currentRanking?: number;
  totalXp?: number;
};

export type MySquadInfo = {
  squadId: number | string;
  squadName: string;
  joined: boolean;
  members?: number;
  groupReturnRate?: number;
};

const readNumber = (value: unknown, fallback = 0): number => (
  typeof value === "number" && Number.isFinite(value)
    ? value
    : typeof value === "string" && value.trim().length > 0 && Number.isFinite(Number(value))
      ? Number(value)
      : fallback
);

const normalizeSquadRankingItem = (item: Record<string, unknown>, index: number): SquadRankingItem | null => {
  const squadId = (item.squadId ?? item.id ?? item.groupId ?? item.teamId ?? "") as number | string;
  const squadName = String(
    item.squadName ??
    item.name ??
    item.schoolName ??
    item.universityName ??
    item.title ??
    "",
  );
  if (String(squadId).length === 0 || squadName.length === 0) {
    return null;
  }

  const currentRanking = readNumber(item.currentRanking ?? item.rank ?? item.ranking, index + 1);
  const weeklyXp = readNumber(item.weeklyXp ?? item.xp ?? item.totalXp, 0);
  const totalXp = readNumber(item.totalXp ?? item.xp ?? item.weeklyXp, weeklyXp);

  return {
    squadId,
    squadName,
    currentRanking,
    totalXp,
    weeklyXp,
    weeklyXpChangeRate: readNumber(item.weeklyXpChangeRate ?? item.groupReturnRate, 0),
    rankingChange: readNumber(item.rankingChange, 0),
    returnRate: typeof item.returnRate === "number" ? item.returnRate : undefined,
  };
};

const normalizeMySquadInfo = (data: unknown): MySquadInfo | null => {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;

  const joined = row.joined !== false && row.squad !== null;
  if (!joined && !row.id && !row.squadId && !row.name && !row.squadName) {
    return null;
  }

  const nested = row.squad && typeof row.squad === "object"
    ? row.squad as Record<string, unknown>
    : row;
  const squadId = (nested.squadId ?? nested.id ?? nested.groupId ?? nested.teamId ?? "") as number | string;
  const squadName = String(
    nested.squadName ??
    nested.name ??
    nested.schoolName ??
    nested.universityName ??
    "",
  );

  if (String(squadId).length === 0 || squadName.length === 0) {
    return null;
  }

  return {
    squadId,
    squadName,
    joined: row.joined !== false,
    members: readNumber(nested.members, 0),
    groupReturnRate: readNumber(nested.groupReturnRate, 0),
  };
};

const normalizeSquadContributionItem = (item: Record<string, unknown>, index: number): SquadContributionItem | null => {
  const nickname = String(item.nickname ?? item.name ?? item.userName ?? item.username ?? "");
  if (!nickname) return null;

  const returnRate = readNumber(
    item.returnRate ?? item.stockReturnRate ?? item.totalReturnRate ?? item.weeklyContributionXp,
    0,
  );

  return {
    nickname,
    ranking: readNumber(item.ranking ?? item.rank, index + 1),
    weeklyContributionXp: readNumber(item.weeklyContributionXp, returnRate),
    returnRate,
    stockReturnRate: readNumber(item.stockReturnRate, returnRate),
  };
};

// 백엔드가 배열을 래핑해서 반환할 수 있으므로 안전하게 추출
function unwrapArray<T>(data: unknown, depth = 0): T[] {
  if (Array.isArray(data)) return data;
  if (depth > 3) return [];

  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;

    for (const key of ["data", "content", "items", "result", "squads", "list"]) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }

    for (const value of Object.values(obj)) {
      const nested = unwrapArray<T>(value, depth + 1);
      if (nested.length > 0) return nested;
    }
  }

  return [];
}

// ─── API 메서드 ───

export const gamificationApi = {
  /** 스쿼드(대학) 랭킹 조회: GET /xp/squads/ranking */
  getSquadRanking: async (): Promise<SquadRankingItem[]> => {
    const res = await gamificationApiClient.get("/xp/squads/ranking");
    return unwrapArray<Record<string, unknown>>(res.data)
      .map((item, index) => normalizeSquadRankingItem(item, index))
      .filter((item): item is SquadRankingItem => item != null);
  },

  /** 내 스쿼드 기여도 조회: GET /xp/squads/contributions/me */
  getMySquadContributions: async (): Promise<SquadContributionItem[]> => {
    const res = await gamificationApiClient.get("/xp/squads/contributions/me");
    return unwrapArray<Record<string, unknown>>(res.data)
      .map((item, index) => normalizeSquadContributionItem(item, index))
      .filter((item): item is SquadContributionItem => item != null);
  },

  /** 내 XP 정보 조회: GET /xp/me */
  getMyXp: async (): Promise<MyXpInfo> => {
    const res = await gamificationApiClient.get<MyXpInfo>("/xp/me");
    return res.data;
  },

  /** 전체 사용자 XP 랭킹 조회: GET /xp/users/ranking */
  getUserXpRanking: async (period?: RankingPeriod, size?: number): Promise<UserRankingItem[]> => {
    const res = await gamificationApiClient.get("/xp/users/ranking", {
      params: {
        ...(period ? { period } : {}),
        ...(size != null ? { size } : {}),
      },
    });
    return unwrapArray<UserRankingItem>(res.data);
  },

  /** 전체 스쿼드 목록 조회: GET /squads */
  getSquads: async (): Promise<SquadItem[]> => {
    const res = await gamificationApiClient.get("/squads");

    const rawItems = unwrapArray<Record<string, unknown>>(res.data);
    return rawItems
      .map((item) => ({
        squadId: (item.squadId ?? item.id ?? item.groupId ?? item.teamId ?? "") as number | string,
        squadName: String(
          item.squadName ??
          item.name ??
          item.schoolName ??
          item.universityName ??
          item.title ??
          ""
        ),
        region: typeof item.region === "string" ? item.region : typeof item.location === "string" ? item.location : undefined,
        currentRanking:
          typeof item.currentRanking === "number"
            ? item.currentRanking
            : typeof item.ranking === "number"
              ? item.ranking
              : undefined,
        totalXp:
          typeof item.totalXp === "number"
            ? item.totalXp
            : typeof item.xp === "number"
              ? item.xp
              : undefined,
      }))
      .filter((item) => item.squadName.length > 0 && String(item.squadId).length > 0);
  },

  /** 내 스쿼드 조회: GET /squads/me */
  getMySquad: async (): Promise<MySquadInfo | null> => {
    const res = await gamificationApiClient.get<unknown>("/squads/me");
    return normalizeMySquadInfo(res.data);
  },

  /** 스쿼드 참여: POST /squads/{squadId}/join */
  joinSquad: async (squadId: number | string): Promise<void> => {
    await gamificationApiClient.post(`/squads/${squadId}/join`);
  },

  /** 내 배지 목록 조회: GET /badges/me */
  getMyBadges: async (): Promise<BadgeInfo[]> => {
    const res = await gamificationApiClient.get("/badges/me");
    return unwrapArray<BadgeInfo>(res.data);
  },
};

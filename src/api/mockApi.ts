import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { Tokens } from "@/store/useAuthStore";

export const isMockMode = import.meta.env.VITE_USE_MOCKS === "true";

export const mockTokens: Tokens = {
  accessToken: "mock-access-token",
  accessExpiresAt: "2099-12-31T23:59:59Z",
  refreshToken: "mock-refresh-token",
  refreshExpiresAt: "2099-12-31T23:59:59Z",
};

export const mockLoginAccount = {
  email: "student@universion.local",
  password: "finvest1234!",
};

const mockUser = {
  userId: "mock-user-1",
  email: mockLoginAccount.email,
  nickname: "이재이",
  name: "이재이",
  birthDate: "2001-01-01",
  phoneNumber: "010-0000-0000",
};

const categories = [
  { categoryId: 10, categoryName: "반도체" },
  { categoryId: 11, categoryName: "2차전지" },
  { categoryId: 12, categoryName: "AI" },
  { categoryId: 13, categoryName: "자동차" },
  { categoryId: 14, categoryName: "바이오" },
];

const stocks = [
  { stockId: 1, symbol: "005930", name: "삼성전자", categoryId: 10, close: 74200, prevDayChangePct: 0.45, volume: 18250000, value: 1350000000000 },
  { stockId: 2, symbol: "000660", name: "SK하이닉스", categoryId: 10, close: 186500, prevDayChangePct: 2.67, volume: 8300000, value: 1547000000000 },
  { stockId: 3, symbol: "373220", name: "LG에너지솔루션", categoryId: 11, close: 412000, prevDayChangePct: -1.45, volume: 610000, value: 251000000000 },
  { stockId: 4, symbol: "035420", name: "NAVER", categoryId: 12, close: 178000, prevDayChangePct: 1.23, volume: 980000, value: 174000000000 },
  { stockId: 5, symbol: "005380", name: "현대차", categoryId: 13, close: 234500, prevDayChangePct: 0.78, volume: 720000, value: 168000000000 },
  { stockId: 6, symbol: "068270", name: "셀트리온", categoryId: 14, close: 178900, prevDayChangePct: 1.12, volume: 690000, value: 123000000000 },
  { stockId: 7, symbol: "035720", name: "카카오", categoryId: 12, close: 45600, prevDayChangePct: -0.34, volume: 2210000, value: 100000000000 },
  { stockId: 8, symbol: "006400", name: "삼성SDI", categoryId: 11, close: 385000, prevDayChangePct: 1.34, volume: 410000, value: 157000000000 },
];

let walletBalance = 50_000_000;
let tradeIdSeq = 3;
let portfolioIdSeq = 3;

const portfolios = [
  { id: 1, name: "기본 포트폴리오", iconCode: "DEFAULT", totalPurchaseAmount: 6_200_000, totalCurrentValue: 6_640_000, totalReturnRate: 7.1 },
  { id: 2, name: "장기 성장주", iconCode: "GROWTH", totalPurchaseAmount: 3_400_000, totalCurrentValue: 3_290_000, totalReturnRate: -3.2 },
];

const trades = [
  { tradeId: 1, stockId: 1, stockName: "삼성전자", amount: 10, price: 73900, portfolioId: 1, transactionType: "BUY", tradeType: "NORMAL", createdAt: new Date(Date.now() - 86_400_000).toISOString() },
  { tradeId: 2, stockId: 2, stockName: "SK하이닉스", amount: 3, price: 181000, portfolioId: 1, transactionType: "BUY", tradeType: "RESERVED", createdAt: new Date(Date.now() - 3_600_000).toISOString() },
];

const courses = [
  {
    id: 1,
    title: "AI 투자 입문 코스",
    description: "시장 흐름과 기본 투자 원칙을 학습합니다.",
    difficulty: "BEGINNER",
    totalLessonCount: 3,
    lessons: [
      { id: 101, title: "투자와 리스크", description: "수익과 위험의 관계", completed: true },
      { id: 102, title: "분산 투자", description: "포트폴리오 기초", completed: false },
      { id: 103, title: "뉴스 읽기", description: "경제 뉴스 해석", completed: false },
    ],
  },
  {
    id: 2,
    title: "차트와 매매 전략",
    description: "캔들, 거래량, 추세를 함께 봅니다.",
    difficulty: "INTERMEDIATE",
    totalLessonCount: 2,
    lessons: [
      { id: 201, title: "캔들 차트", description: "봉 차트 구조", completed: false },
      { id: 202, title: "거래량 분석", description: "수급 확인", completed: false },
    ],
  },
];

const news = [
  { id: 1, title: "반도체 업황 개선 기대감 확대", economicSignal: "POSITIVE", keyword: "SEMICONDUCTOR", createdAt: new Date().toISOString(), analysis: "AI 수요 증가로 메모리 가격 회복 기대가 커지고 있습니다.", likeCount: 24, discussionCount: 5 },
  { id: 2, title: "전기차 배터리 원가 부담 완화", economicSignal: "POSITIVE", keyword: "BATTERY", createdAt: new Date(Date.now() - 7_200_000).toISOString(), analysis: "원재료 가격 안정은 배터리 기업의 마진 개선 요인입니다.", likeCount: 16, discussionCount: 3 },
  { id: 3, title: "환율 변동성 확대에 수출주 주목", economicSignal: "NEUTRAL", keyword: "EXCHANGE_RATE", createdAt: new Date(Date.now() - 12_000_000).toISOString(), analysis: "환율 변동은 업종별 실적 전망에 다른 영향을 줍니다.", likeCount: 9, discussionCount: 2 },
];

let discussionIdSeq = 3;
const discussions = [
  { id: 1, userId: "mock-user-2", content: "반도체 테마는 단기보다 중장기로 봐야 한다고 생각합니다.", newsId: 1, likeCount: 7, comments: [], createdAt: new Date(Date.now() - 1_800_000).toISOString(), edited: false },
  { id: 2, userId: "mock-user-3", content: "배터리주는 원가보다 판매량 회복이 더 중요해 보여요.", newsId: 2, likeCount: 3, comments: [], createdAt: new Date(Date.now() - 5_400_000).toISOString(), edited: false },
];

const squadRanking = [
  { squadId: 1, squadName: "Universion", currentRanking: 1, totalXp: 18420, weeklyXp: 3250, weeklyXpChangeRate: 12.4, rankingChange: 1, returnRate: 18.4 },
  { squadId: 2, squadName: "FinTech Lab", currentRanking: 2, totalXp: 16900, weeklyXp: 3010, weeklyXpChangeRate: 8.2, rankingChange: -1, returnRate: 12.7 },
  { squadId: 3, squadName: "Data Investors", currentRanking: 3, totalXp: 14200, weeklyXp: 2440, weeklyXpChangeRate: 4.6, rankingChange: 0, returnRate: 7.3 },
];

function ok<T>(config: InternalAxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status >= 400 ? "Error" : "OK",
    headers: {},
    config,
  };
}

function parsePath(config: InternalAxiosRequestConfig) {
  const url = config.url ?? "/";
  const parsed = new URL(url, "http://mock.local");
  const method = (config.method ?? "get").toUpperCase();
  const params = new URLSearchParams(parsed.search);
  const configParams = config.params as Record<string, string | number | undefined> | undefined;
  if (configParams) {
    Object.entries(configParams).forEach(([key, value]) => {
      if (value != null) params.set(key, String(value));
    });
  }
  return { path: parsed.pathname, method, params };
}

function readBody(config: InternalAxiosRequestConfig): Record<string, unknown> {
  if (!config.data) return {};
  if (typeof config.data === "string") {
    try {
      return JSON.parse(config.data) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return config.data as Record<string, unknown>;
}

function listStocks() {
  return stocks.map((stock) => ({
    stockId: stock.stockId,
    symbol: stock.symbol,
    name: stock.name,
    categoryId: stock.categoryId,
  }));
}

function closingPrices(ids: number[]) {
  const filtered = ids.length > 0 ? stocks.filter((stock) => ids.includes(stock.stockId)) : stocks;
  return filtered.map((stock) => ({
    stockId: stock.stockId,
    stockName: stock.name,
    at: new Date().toISOString(),
    close: stock.close,
    prevDayChangePct: stock.prevDayChangePct,
    volume: stock.volume,
    value: stock.value,
  }));
}

function candleSeries(stockId: number, timeframe = "DAY", endTime?: string | null) {
  const stock = stocks.find((item) => item.stockId === stockId) ?? stocks[0];
  const end = endTime ? new Date(endTime) : new Date();
  const safeEnd = Number.isNaN(end.getTime()) ? new Date() : end;
  const configs: Record<string, { count: number; step: "minute" | "day" | "month" | "year"; amount: number; wave: number }> = {
    MINUTE: { count: 80, step: "minute", amount: 1, wave: 0.008 },
    HOUR: { count: 80, step: "minute", amount: 60, wave: 0.012 },
    DAY: { count: 64, step: "day", amount: 1, wave: 0.04 },
    WEEK: { count: 56, step: "day", amount: 7, wave: 0.07 },
    MONTH: { count: 48, step: "month", amount: 1, wave: 0.12 },
    YEAR: { count: 12, step: "year", amount: 1, wave: 0.18 },
  };
  const config = configs[timeframe] ?? configs.DAY;

  return Array.from({ length: config.count }, (_, index) => {
    const date = new Date(safeEnd);
    const distance = config.count - 1 - index;
    if (config.step === "minute") {
      date.setMinutes(safeEnd.getMinutes() - distance * config.amount);
    } else if (config.step === "day") {
      date.setDate(safeEnd.getDate() - distance * config.amount);
    } else if (config.step === "month") {
      date.setMonth(safeEnd.getMonth() - distance * config.amount);
    } else {
      date.setFullYear(safeEnd.getFullYear() - distance * config.amount);
    }

    const drift = Math.sin(index / 5) * config.wave + index * 0.001;
    const close = Math.round(stock.close * (1 + drift));
    const open = Math.round(close * (1 + Math.sin(index) * config.wave * 0.2));
    return {
      open,
      close,
      high: Math.max(open, close) + Math.round(stock.close * config.wave * 0.25),
      low: Math.min(open, close) - Math.round(stock.close * config.wave * 0.25),
      volume: Math.round(stock.volume * (0.45 + index / (config.count * 1.8))),
      value: Math.round(stock.value * (0.45 + index / (config.count * 1.8))),
      stockId,
      timeframe,
      at: date.toISOString(),
      prevDayChangePct: stock.prevDayChangePct,
    };
  });
}

function performanceChart() {
  const points = Array.from({ length: 8 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (7 - index) * 7);
    return {
      periodStartDate: date.toISOString().slice(0, 10),
      totalCurrentValue: 9_500_000 + index * 180_000,
      totalReturnRate: -1.5 + index * 1.1,
    };
  });
  return {
    interval: "WEEKLY",
    startDate: points[0].periodStartDate,
    endDate: points[points.length - 1].periodStartDate,
    portfolios: portfolios.map((portfolio) => ({
      portfolioId: portfolio.id,
      portfolioName: portfolio.name,
      points,
    })),
    total: points,
  };
}

function lessonDetail(lessonId: number) {
  const lesson = courses.flatMap((course) => course.lessons).find((item) => item.id === lessonId);
  return {
    id: lessonId,
    title: lesson?.title ?? "투자 학습",
    description: lesson?.description ?? "모의 학습 콘텐츠",
    content: "## 핵심 개념\n\n투자는 수익 가능성과 손실 가능성을 함께 관리하는 과정입니다.\n\n- 분산 투자를 통해 단일 종목 리스크를 줄입니다.\n- 뉴스, 차트, 거래량을 함께 확인합니다.\n- 모의 투자에서 먼저 전략을 검증합니다.",
    completed: lesson?.completed ?? false,
  };
}

function handleMock(config: InternalAxiosRequestConfig): AxiosResponse<unknown> {
  const { path, method, params } = parsePath(config);
  const body = readBody(config);

  if (path === "/auth/login" && method === "POST") {
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");
    if (email === mockLoginAccount.email && password === mockLoginAccount.password) {
      return ok(config, mockTokens);
    }
    return ok(config, { message: "임시 계정 정보를 확인해주세요." }, 401);
  }
  if (path === "/auth/signup" && method === "POST") return ok(config, { user: { ...mockUser, ...body }, tokens: mockTokens });
  if (path === "/auth/refresh" && method === "POST") return ok(config, mockTokens);
  if (path === "/auth/logout" && method === "POST") return ok(config, {});
  if (path === "/auth/sessions" && method === "GET") return ok(config, []);

  if (path === "/members/me" && method === "GET") return ok(config, mockUser);
  if (path === "/members" && method === "PATCH") return ok(config, { ...mockUser, ...body });
  if (path === "/members/nickname" && method === "PATCH") return ok(config, { ...mockUser, nickname: String(body.nickname ?? mockUser.nickname) });
  if (path === "/members/check-email" && method === "GET") return ok(config, { duplicate: false });
  if (path === "/members/check-nickname" && method === "GET") return ok(config, { duplicate: false });
  if (path === "/members/favorite-stocks" && method === "GET") return ok(config, stocks.slice(0, 3).map((stock) => ({ stockId: stock.stockId, name: stock.name, userId: mockUser.userId })));
  if (path.startsWith("/members/favorite-stocks/")) return ok(config, { stockId: Number(path.split("/").pop()), name: "관심 종목", userId: mockUser.userId });

  if ((path === "/api/v1/search" || path === "/v1/search") && method === "GET") {
    const query = (params.get("query") ?? "").toLowerCase().replace(/\s+/g, "");
    const limit = Number(params.get("limit") ?? 6);
    const stockResults = stocks
      .filter((stock) => stock.name.toLowerCase().replace(/\s+/g, "").includes(query) || stock.symbol.includes(query))
      .slice(0, limit)
      .map((stock) => ({ stockId: stock.stockId, id: stock.stockId, name: stock.name, code: stock.symbol, type: "domestic" }));
    const learningResults = courses
      .filter((course) => course.title.toLowerCase().replace(/\s+/g, "").includes(query))
      .slice(0, limit)
      .map((course) => ({ id: course.id, title: course.title, category: course.difficulty, contentType: "course" }));
    return ok(config, { query, stocks: stockResults, learning: learningResults });
  }

  if (path === "/market/status") return ok(config, { status: "CLOSED" });
  if (path === "/market/categories") return ok(config, categories);
  if (path.match(/^\/market\/categories\/\d+\/stocks$/)) {
    const categoryId = Number(path.split("/")[3]);
    const category = categories.find((item) => item.categoryId === categoryId);
    return ok(config, { categoryId, categoryName: category?.categoryName ?? "테마", stocks: listStocks().filter((stock) => stock.categoryId === categoryId) });
  }
  if (path.match(/^\/market\/categories\/\d+\/change-rate$/)) {
    const categoryId = Number(path.split("/")[3]);
    const category = categories.find((item) => item.categoryId === categoryId);
    return ok(config, { categoryId, categoryName: category?.categoryName ?? "테마", changeRate: 1.8, averageChangePct: 1.8, stockCount: 12, positiveCount: 8, negativeCount: 4, updatedAt: new Date().toISOString() });
  }
  if (path === "/market/stocks/top-rising") return ok(config, listStocks().sort((a, b) => stocks.find((s) => s.stockId === b.stockId)!.prevDayChangePct - stocks.find((s) => s.stockId === a.stockId)!.prevDayChangePct));
  if (path === "/market/stocks/top-falling") return ok(config, listStocks().sort((a, b) => stocks.find((s) => s.stockId === a.stockId)!.prevDayChangePct - stocks.find((s) => s.stockId === b.stockId)!.prevDayChangePct));
  if (path === "/market/stocks/top-by-volume" || path === "/market/stocks/top-by-value") return ok(config, listStocks());
  if (path === "/market/stocks/search") {
    const query = (params.get("query") ?? "").toLowerCase();
    return ok(config, listStocks().filter((stock) => stock.name.toLowerCase().includes(query) || stock.symbol.includes(query)));
  }
  if (path === "/market/stocks/closing-prices") {
    const ids = (params.get("stockIds") ?? "").split(",").map(Number).filter(Number.isFinite);
    return ok(config, closingPrices(ids));
  }
  if (path.match(/^\/market\/stocks\/\d+\/candles$/)) {
    const stockId = Number(path.split("/")[3]);
    return ok(config, candleSeries(stockId, params.get("timeframe") ?? "DAY", params.get("endTime")));
  }
  if (path.match(/^\/market\/indexes\/[^/]+\/candles$/)) return ok(config, candleSeries(1, params.get("timeframe") ?? "DAY", params.get("endTime")));

  if (path === "/wallets/balance") return ok(config, { walletId: 1, userId: mockUser.userId, balance: walletBalance });
  if (path === "/portfolios" && method === "GET") return ok(config, portfolios);
  if (path === "/portfolios" && method === "POST") {
    portfolios.push({ id: portfolioIdSeq++, name: String(body.name ?? "새 포트폴리오"), iconCode: String(body.iconCode ?? "DEFAULT"), totalPurchaseAmount: 0, totalCurrentValue: 0, totalReturnRate: 0 });
    return ok(config, {});
  }
  if (path === "/portfolios/comparison") return ok(config, portfolios.map((portfolio) => ({ name: portfolio.name, totalAssetAmount: portfolio.totalCurrentValue, returnRate: portfolio.totalReturnRate, realizedProfit: portfolio.totalCurrentValue - portfolio.totalPurchaseAmount })));
  if (path === "/portfolios/performance-chart") return ok(config, performanceChart());
  if (path.match(/^\/portfolios\/\d+\/assets$/)) return ok(config, stocks.slice(0, 3).map((stock, index) => ({ id: index + 1, name: stock.name, amount: index + 2, totalPrice: stock.close * (index + 2), currency: "KRW", stockId: stock.stockId })));
  if (path === "/assets/allocation") return ok(config, { cashAmount: walletBalance, stockAmount: 9_930_000, totalAmount: walletBalance + 9_930_000, changeAmount: 440_000, changeRate: 4.63 });
  if (path === "/assets/top-100") return ok(config, { totalElements: stocks.length, items: stocks.map((stock) => ({ stockId: stock.stockId, name: stock.name, totalAmount: stock.value })) });
  if (path === "/rankings/user-profit") return ok(config, { rankType: params.get("type") ?? "DAILY", page: 0, size: 50, totalElements: 3, totalPages: 1, items: [{ rank: 1, userId: mockUser.userId, nickname: mockUser.nickname, returnRate: 12.4, profitLoss: 1240000 }] });

  if (path === "/trades/history") return ok(config, trades);
  if (path === "/trades/reserved/stock-ids") return ok(config, trades.filter((trade) => trade.tradeType === "RESERVED").map((trade) => trade.stockId));
  if (path === "/trades" && method === "POST") {
    const stock = stocks.find((item) => item.stockId === Number(body.stockId)) ?? stocks[0];
    const trade = { tradeId: tradeIdSeq++, stockId: stock.stockId, stockName: stock.name, amount: Number(body.amount ?? 1), price: Number(body.price ?? stock.close), portfolioId: Number(body.portfolioId ?? 1), userId: mockUser.userId, transactionType: String(body.transactionType ?? "BUY"), tradeType: String(body.tradeType ?? "NORMAL"), createdAt: new Date().toISOString() };
    if (trade.transactionType === "BUY") walletBalance = Math.max(0, walletBalance - trade.amount * trade.price);
    trades.unshift(trade);
    return ok(config, trade);
  }
  if (path.match(/^\/trades\/\d+$/)) return ok(config, trades.find((trade) => trade.tradeId === Number(path.split("/").pop())) ?? trades[0]);

  if (path === "/study/courses/me") return ok(config, courses);
  if (path === "/study/courses" && method === "POST") return ok(config, {});
  if (path === "/study/courses/preview") return ok(config, { content: "AI가 생성한 투자 학습 코스 미리보기입니다." });
  if (path === "/study/keywords/recommended") return ok(config, ["반도체", "분산투자", "ETF", "금리", "환율"]);
  if (path === "/study/ai-recommends/today") return ok(config, { content: "오늘은 반도체와 금리 뉴스가 시장에 미치는 영향을 함께 살펴보세요." });
  if (path.match(/^\/study\/lessons\/\d+$/)) return ok(config, lessonDetail(Number(path.split("/")[3])));
  if (path.match(/^\/study\/lessons\/\d+\/complete$/)) return ok(config, {});
  if (path.match(/^\/study\/lessons\/\d+\/metrics\/one-minute$/)) return ok(config, {});
  if (path === "/study/lessons/completions/me") return ok(config, { month: params.get("month") ?? "2026-04", items: [{ lessonId: 101, completedAt: new Date(Date.now() - 2_400_000).toISOString() }] });
  if (path === "/study/metrics/me") return ok(config, { xpEarned: 1200, timeSpentMinutes: 85, lastPingAt: new Date().toISOString() });

  if (path === "/xp/squads/ranking") return ok(config, squadRanking);
  if (path === "/xp/squads/contributions/me") return ok(config, [{ nickname: "이재이", ranking: 1, weeklyContributionXp: 920 }, { nickname: "팀원A", ranking: 2, weeklyContributionXp: 710 }, { nickname: "팀원B", ranking: 3, weeklyContributionXp: 630 }]);
  if (path === "/xp/me") return ok(config, { userId: mockUser.userId, nickname: mockUser.nickname, totalXp: 1840, level: 4 });
  if (path === "/xp/users/ranking") return ok(config, [{ userId: mockUser.userId, nickname: mockUser.nickname, ranking: 1, currentXp: 1840, periodXp: 320, previousPeriodXp: 280, growthRate: 14.2 }]);
  if (path === "/squads") return ok(config, squadRanking.map((item) => ({ squadId: item.squadId, squadName: item.squadName, region: "서울", currentRanking: item.currentRanking, totalXp: item.totalXp })));
  if (path === "/squads/me") return ok(config, { userId: mockUser.userId, nickname: mockUser.nickname, totalXp: 1840, level: 4 });
  if (path.match(/^\/squads\/\d+\/join$/)) return ok(config, {});
  if (path === "/badges/me") return ok(config, [{ badge: "KNOWLEDGE_SEEKER", displayName: "지식 탐구자", acquiredAt: new Date(Date.now() - 86_400_000).toISOString() }]);

  if (path === "/news") return ok(config, news);
  if (path.match(/^\/news\/\d+$/)) {
    const item = news.find((entry) => entry.id === Number(path.split("/").pop())) ?? news[0];
    return ok(config, { ...item, content: `<p>${item.analysis}</p><p>모의 뉴스 본문입니다.</p>`, provider: "Universion News", publishedAt: item.createdAt, likedByMe: false });
  }
  if (path.match(/^\/news\/\d+\/like$/)) return ok(config, {});
  if (path === "/news/keywords/trending") return ok(config, [{ keyword: "SEMICONDUCTOR", count: 12 }, { keyword: "BATTERY", count: 9 }, { keyword: "AI", count: 7 }]);
  if (path === "/themes/today") return ok(config, categories.slice(0, 3).map((category) => ({ categoryId: category.categoryId, categoryName: category.categoryName, averageChangePct: 1.4 })));
  if (path.match(/^\/themes\/today\/\d+$/)) return ok(config, { categoryId: Number(path.split("/").pop()), categoryName: "오늘의 테마", analysis: "관련 종목의 수급과 뉴스 흐름이 양호합니다.", news: news.slice(0, 3).map((item) => ({ id: item.id, newsId: item.id, title: item.title, publishedAt: item.createdAt, provider: "Universion News" })) });
  if (path === "/discussions" && method === "GET") return ok(config, discussions);
  if (path === "/discussions" && method === "POST") {
    const discussion = { id: discussionIdSeq++, userId: mockUser.userId, content: String(body.content ?? ""), newsId: Number(body.newsId ?? 0), likeCount: 0, comments: [], createdAt: new Date().toISOString(), edited: false };
    discussions.unshift(discussion);
    return ok(config, discussion);
  }
  if (path.match(/^\/discussions\/\d+$/)) return ok(config, discussions.find((item) => item.id === Number(path.split("/")[2])) ?? discussions[0]);
  if (path.match(/^\/discussions\/\d+\/comments$/)) return ok(config, []);
  if (path.includes("/like") || method === "DELETE") return ok(config, {});

  return ok(config, {});
}

export function createMockAdapter(): AxiosAdapter | undefined {
  if (!isMockMode) return undefined;

  return async (config) => {
    await new Promise((resolve) => globalThis.setTimeout(resolve, 120));
    return handleMock(config);
  };
}

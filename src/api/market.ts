import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";
import type { CandlestickData, Time } from "lightweight-charts";
import { DateTime } from "luxon";
import type { ChartPeriod } from "@/pages/Simulation/components/StockChart";
import { createMockAdapter } from "@/api/mockApi";

const API_BASE = import.meta.env.VITE_API_BASE_URL
  ?? import.meta.env.VITE_API_BASE
  ?? (import.meta.env.DEV ? "/api" : "http://localhost:8080");

const mockAdapter = createMockAdapter();

const marketApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  ...(mockAdapter ? { adapter: mockAdapter } : {}),
});

marketApi.interceptors.request.use((config) => {
  const tokens = useAuthStore.getState().tokens;
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

// --- Category Types ---

export type CategoryId = number | string;
export type StockId = number | string;

export interface CategoryResponse {
  categoryId: CategoryId;
  categoryName: string;
}

export interface CategoryStockListResponse {
  categoryId: CategoryId;
  categoryName: string;
  stocks: StockListItem[];
}

export interface CategoryChangeRateResponse {
  categoryId: CategoryId;
  categoryName: string;
  changeRate: number;
  averageChangePct?: number;
  stockCount?: number;
  positiveCount?: number;
  negativeCount?: number;
  updatedAt?: string;
}

export interface HomeThemeItem {
  id: string;
  name: string;
  category: string;
  stockNames: string[];
  change: string;
  changeRate: number;
  summary: string;
  color: string;
  topStockId: StockId;
  topStockName: string;
  topStock: string;
  basePrice: number;
  newsCount: number;
}

interface RawCategoryChangeRateResponse {
  categoryId?: CategoryId;
  id?: CategoryId;
  categoryName: string;
  name?: string;
  changeRate?: number;
  averageChangePct?: number;
  averageChangeRate?: number;
  stockCount?: number;
  positiveCount?: number;
  negativeCount?: number;
  updatedAt?: string;
}

type RawCategoryResponse = Record<string, unknown> & {
  categoryId?: CategoryId;
  categoryName?: string;
  id?: CategoryId;
  name?: string;
};

type RawCategoryStockListResponse = Record<string, unknown> & {
  categoryId?: CategoryId;
  categoryName?: string;
  id?: CategoryId;
  name?: string;
  stocks?: RawStockListItem[];
};

type RawHomeThemeItem = Record<string, unknown> & {
  id?: string;
  name?: string;
  category?: string;
  stocks?: string[];
  change?: string | number;
  summary?: string;
  color?: string;
  topStockId?: number | string;
  topStockName?: string;
  topStock?: string;
  basePrice?: number | string;
  newsCount?: number | string;
};

type RawHomeThemesResponse = Record<string, unknown> & {
  category?: string;
  items?: RawHomeThemeItem[];
};

type RawHomeThemeChartResponse = Record<string, unknown> & {
  chartData?: Array<Record<string, unknown> & {
    time?: string;
    price?: number | string;
    value?: number | string;
  }>;
};

// --- Stock List / Closing Price Types ---

export interface StockListItem {
  stockId: StockId;
  symbol: string;
  name: string;
  categoryId: number;
}

type RawStockListItem = Record<string, unknown> & {
  stockId?: number | string;
  id?: number | string;
  symbol?: string;
  ticker?: string;
  code?: string;
  name?: string;
  displayName?: string;
  canonicalName?: string;
  categoryId?: number | string;
  currentPrice?: number | string;
  change?: number | string;
  tradingValue?: number | string;
};

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    if (Number.isFinite(parsed)) return parsed;
    const sanitized = value.replace(/,/g, "").replace(/[^0-9.+-]/g, "");
    if (!sanitized) return fallback;
    const sanitizedParsed = Number(sanitized);
    return Number.isFinite(sanitizedParsed) ? sanitizedParsed : fallback;
  }
  return fallback;
}

function toKoreanMoneyNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const text = value.replace(/,/g, "").trim();
    const numeric = Number(text.replace(/[^0-9.+-]/g, ""));
    if (!Number.isFinite(numeric)) return fallback;
    if (text.includes("천억")) return numeric * 100_000_000_000;
    if (text.includes("조")) return numeric * 1_000_000_000_000;
    if (text.includes("억")) return numeric * 100_000_000;
    if (text.includes("만")) return numeric * 10_000;
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toPercentNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, "").replace(/%/g, "").trim());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toThemeChartTime(value: unknown): Time {
  const text = String(value ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text as Time;
  if (/^\d{2}\/\d{2}$/.test(text)) {
    const [month, day] = text.split("/");
    return `${new Date().getFullYear()}-${month}-${day}` as Time;
  }
  return text as Time;
}

function normalizeStockId(value: unknown): StockId {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return "";
    return trimmed;
  }
  return 0;
}

export function hasStockId(value: unknown): value is StockId {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }
  return typeof value === "string" && value.trim().length > 0;
}

export function toNumericStockId(stockId: StockId | null | undefined): number | undefined {
  if (typeof stockId === "number") {
    return Number.isFinite(stockId) && stockId > 0 ? stockId : undefined;
  }
  if (typeof stockId === "string" && /^\d+$/.test(stockId.trim())) {
    const parsed = Number(stockId);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }
  return undefined;
}

function toStockIdKey(stockId: StockId): string {
  return String(stockId);
}

function normalizeStockListItem(item: RawStockListItem): StockListItem {
  return {
    stockId: normalizeStockId(item.stockId ?? item.id),
    symbol: String(item.symbol ?? item.ticker ?? item.code ?? ""),
    name: String(item.name ?? item.displayName ?? item.canonicalName ?? ""),
    categoryId: toNumber(item.categoryId),
  };
}

function normalizeHomeThemeItem(item: RawHomeThemeItem): HomeThemeItem {
  const topStockName = String(item.topStockName ?? item.topStock ?? "");

  return {
    id: String(item.id ?? ""),
    name: String(item.name ?? ""),
    category: String(item.category ?? ""),
    stockNames: Array.isArray(item.stocks) ? item.stocks.map(String) : [],
    change: String(item.change ?? "0%"),
    changeRate: toPercentNumber(item.change),
    summary: String(item.summary ?? ""),
    color: String(item.color ?? "#42d6ba"),
    topStockId: normalizeStockId(item.topStockId),
    topStockName,
    topStock: String(item.topStock ?? topStockName),
    basePrice: toNumber(item.basePrice),
    newsCount: toNumber(item.newsCount),
  };
}

export interface StockClosingPrice {
  stockId: StockId;
  stockName: string;
  at: string;
  close: number;
  prevDayChangePct: number;
  volume: number;
  value: number;
}

type RawStockClosingPrice = Record<string, unknown> & {
  stockId?: number | string;
  id?: number | string;
  stockName?: string;
  name?: string;
  at?: string;
  fetchedAt?: string;
  close?: number | string;
  closingPrice?: number | string;
  price?: number | string;
  prevDayChangePct?: number | string;
  changeRate?: number | string;
  volume?: number | string;
  value?: number | string;
  tradeValue?: number | string;
};

function normalizeClosingPrice(item: RawStockClosingPrice): StockClosingPrice {
  const close = toNumber(item.close ?? item.closingPrice ?? item.price);
  const volume = toNumber(item.volume);
  const value = toKoreanMoneyNumber(item.value ?? item.tradeValue);
  return {
    stockId: normalizeStockId(item.stockId ?? item.id),
    stockName: String(item.stockName ?? item.name ?? ""),
    at: String(item.at ?? item.fetchedAt ?? ""),
    close,
    prevDayChangePct: toNumber(item.prevDayChangePct ?? item.changeRate),
    volume,
    value: value > 0 ? value : close * volume,
  };
}

export interface StockDetailResponse {
  stockId: StockId;
  symbol: string;
  name: string;
  close: number;
  prevDayChangePct: number;
  volume: number;
}

export function normalizeStockDetail(item: RawStockListItem & RawStockClosingPrice): StockDetailResponse {
  return {
    stockId: normalizeStockId(item.stockId ?? item.id),
    symbol: String(item.symbol ?? item.ticker ?? item.code ?? ""),
    name: String(item.name ?? item.displayName ?? item.canonicalName ?? item.stockName ?? ""),
    close: toNumber(item.close ?? item.closingPrice ?? item.price),
    prevDayChangePct: toNumber(item.prevDayChangePct ?? item.changeRate),
    volume: toNumber(item.volume),
  };
}

export interface StockWithPrice {
  stockId: StockId;
  symbol: string;
  name: string;
  categoryId: number;
  close: number;
  prevDayChangePct: number;
  volume: number;
  value: number;
}

// --- Candle Types ---

export interface CandleResponse {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  stockId: StockId;
  timeframe: string;
  at: string;
  prevDayChangePct: number;
}

function normalizeStockWithPrice(item: RawStockListItem & RawStockClosingPrice): StockWithPrice {
  const stock = normalizeStockListItem(item);
  const close = toNumber(item.close ?? item.closingPrice ?? item.currentPrice ?? item.price);
  const volume = toNumber(item.volume);
  const value = toKoreanMoneyNumber(item.value ?? item.tradeValue ?? item.tradingValue);

  return {
    stockId: stock.stockId,
    symbol: stock.symbol,
    name: stock.name,
    categoryId: stock.categoryId,
    close,
    prevDayChangePct: toPercentNumber(item.prevDayChangePct ?? item.changeRate ?? item.change),
    volume,
    value: value > 0 ? value : close * volume,
  };
}

export type IndexType = "KOSPI" | "KOSDAQ";

type Timeframe = "MINUTE" | "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";

const PERIOD_TO_TIMEFRAME: Record<ChartPeriod, Timeframe> = {
  "분봉": "MINUTE",
  "일봉": "DAY",
  "주봉": "WEEK",
  "월봉": "MONTH",
  "년봉": "YEAR",
};

const KST_ZONE = "Asia/Seoul";

export function toKstDateTime(date: Date): string {
  return DateTime.fromJSDate(date).setZone(KST_ZONE).toFormat("yyyy-LL-dd'T'HH:mm:ss");
}

function getKstNowDateTime(): string {
  return DateTime.now().setZone(KST_ZONE).toFormat("yyyy-LL-dd'T'HH:mm:ss");
}

export function getDefaultTimeRange(period: ChartPeriod): { startTime: string; endTime: string } {
  const end = DateTime.now().setZone(KST_ZONE);
  const start = end;

  let startDateTime = start;
  switch (period) {
    case "분봉":
      // 주말/공휴일 대비 3거래일 분량 조회
      startDateTime = start.minus({ days: 3 });
      break;
    case "일봉":
      startDateTime = start.minus({ months: 3 });
      break;
    case "주봉":
      startDateTime = start.minus({ years: 1 });
      break;
    case "월봉":
      startDateTime = start.minus({ years: 3 });
      break;
    case "년봉":
      startDateTime = start.minus({ years: 10 });
      break;
  }

  return {
    startTime: startDateTime.toFormat("yyyy-LL-dd'T'HH:mm:ss"),
    endTime: end.toFormat("yyyy-LL-dd'T'HH:mm:ss"),
  };
}

export interface CandleWithVolume extends CandlestickData<Time> {
  volume: number;
}

function getTimeSortValue(time: Time): number {
  if (typeof time === "number") return time;
  if (typeof time === "string") {
    const millis = Date.parse(time);
    return Number.isFinite(millis) ? millis / 1000 : Number.MAX_SAFE_INTEGER;
  }
  return Date.UTC(time.year, time.month - 1, time.day) / 1000;
}

export function normalizeCandleData(candles: CandleWithVolume[]): CandleWithVolume[] {
  const byTime = new Map<string, CandleWithVolume>();

  for (const candle of candles) {
    byTime.set(String(candle.time), candle);
  }

  return Array.from(byTime.values()).sort((a, b) => {
    const diff = getTimeSortValue(a.time) - getTimeSortValue(b.time);
    return diff === 0 ? String(a.time).localeCompare(String(b.time)) : diff;
  });
}

function toIntradayTimestamp(at: string): Time {
  if (!at) return 0 as Time;

  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(at);
  const parsed = hasTimezone
    ? DateTime.fromISO(at, { setZone: true })
    : DateTime.fromISO(at, { zone: "Asia/Seoul" });

  if (!parsed.isValid) {
    return 0 as Time;
  }

  return Math.floor(parsed.toSeconds()) as Time;
}

function toChartData(candles: CandleResponse[]): CandleWithVolume[] {
  const chartData = candles
    .map((c) => {
      const isIntraday = c.timeframe === "MINUTE" || c.timeframe === "HOUR";
      const time = isIntraday
        ? toIntradayTimestamp(c.at)
        : (c.at.split("T")[0] as Time);

      return { time, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume ?? 0 };
    })
    .filter((d) => {
      if (typeof d.time === "number" && (isNaN(d.time) || d.time <= 0)) return false;
      if (typeof d.time === "string" && (!d.time || d.time === "undefined")) return false;
      if (d.open == null || d.high == null || d.low == null || d.close == null) return false;
      if (isNaN(d.open) || isNaN(d.high) || isNaN(d.low) || isNaN(d.close)) return false;
      return true;
    });

  return normalizeCandleData(chartData);
}

// --- API ---

export async function fetchCandles(
  stockId: number | string,
  period: ChartPeriod,
  range?: { startTime: string; endTime: string },
): Promise<CandleWithVolume[]> {
  const { startTime, endTime } = range ?? getDefaultTimeRange(period);
  const normalizedEndTime = period === "분봉" && !range
    ? getKstNowDateTime()
    : endTime;
  const timeframe = PERIOD_TO_TIMEFRAME[period];

  console.log("[fetchCandles] request:", {
    stockId,
    period,
    timeframe,
    startTime,
    endTime: normalizedEndTime,
  });

  const res = await marketApi.get<CandleResponse[]>(
    `/market/stocks/${stockId}/candles`,
    { params: { startTime, endTime: normalizedEndTime, timeframe } },
  );

  console.log("[fetchCandles] response:", { stockId, period, count: res.data?.length });

  if (!Array.isArray(res.data) || res.data.length === 0) {
    return [];
  }

  return toChartData(res.data);
}

// --- Stock List APIs ---

const TOP_RANKING_LIMIT = 5000;

export async function fetchTopRising(): Promise<StockWithPrice[]> {

  const res = await marketApi.get<Array<RawStockListItem & RawStockClosingPrice>>(
    "/market/stocks/top-rising",
    { params: { limit: TOP_RANKING_LIMIT } },
  );

  return res.data.map(normalizeStockWithPrice).filter((item) => hasStockId(item.stockId));
}

export async function fetchTopFalling(): Promise<StockWithPrice[]> {

  const res = await marketApi.get<Array<RawStockListItem & RawStockClosingPrice>>(
    "/market/stocks/top-falling",
    { params: { limit: TOP_RANKING_LIMIT } },
  );

  return res.data.map(normalizeStockWithPrice).filter((item) => hasStockId(item.stockId));
}

export async function fetchTopByVolume(): Promise<StockWithPrice[]> {

  const res = await marketApi.get<Array<RawStockListItem & RawStockClosingPrice>>(
    "/market/stocks/top-by-volume",
    { params: { limit: TOP_RANKING_LIMIT } },
  );

  return res.data.map(normalizeStockWithPrice).filter((item) => hasStockId(item.stockId));
}

export async function fetchTopByValue(): Promise<StockWithPrice[]> {

  const res = await marketApi.get<Array<RawStockListItem & RawStockClosingPrice>>(
    "/market/stocks/top-by-value",
    { params: { limit: TOP_RANKING_LIMIT } },
  );

  return res.data.map(normalizeStockWithPrice).filter((item) => hasStockId(item.stockId));
}

export async function searchStocks(
  query: string,
  marketType?: string,
): Promise<StockListItem[]> {
  const res = await marketApi.get<RawStockListItem[]>("/market/stocks/search", {
    params: { query, marketType },
  });
  return res.data.map(normalizeStockListItem).filter((item) => hasStockId(item.stockId));
}

export async function fetchClosingPrices(
  stockIds: StockId[],
): Promise<StockClosingPrice[]> {
  const BATCH_SIZE = 30;

  if (stockIds.length <= BATCH_SIZE) {
    const res = await marketApi.get<RawStockClosingPrice[]>(
      "/market/stocks/closing-prices",
      { params: { stockIds: stockIds.join(",") } },
    );
    return res.data.map(normalizeClosingPrice).filter((item) => hasStockId(item.stockId));
  }

  const batches: StockId[][] = [];
  for (let i = 0; i < stockIds.length; i += BATCH_SIZE) {
    batches.push(stockIds.slice(i, i + BATCH_SIZE));
  }

  const results = await Promise.all(
    batches.map((batch) =>
      marketApi.get<RawStockClosingPrice[]>("/market/stocks/closing-prices", {
        params: { stockIds: batch.join(",") },
      }),
    ),
  );

  return results
    .flatMap((r) => r.data)
    .map(normalizeClosingPrice)
    .filter((item) => hasStockId(item.stockId));
}

export async function fetchStockDetail(stockId: number | string): Promise<StockDetailResponse> {
  const res = await marketApi.get<RawStockListItem & RawStockClosingPrice>(`/market/stocks/${stockId}`);
  return normalizeStockDetail(res.data);
}

interface SimulatorStockListResponse {
  market?: string;
  query?: string;
  items?: Array<RawStockListItem & RawStockClosingPrice>;
}

export async function fetchSimulatorStocks(
  query = "",
  market = "all",
  limit = 3000,
): Promise<StockWithPrice[]> {
  const res = await marketApi.get<SimulatorStockListResponse>("/api/v1/simulator/stocks", {
    params: { query, market, limit },
  });

  const items = Array.isArray(res.data?.items) ? res.data.items : [];
  return items
    .map(normalizeStockWithPrice)
    .filter((item) => hasStockId(item.stockId));
}

// --- Market Status Types ---

export interface MarketStatusResponse {
  status: "OPEN" | "CLOSED";
}

export async function fetchMarketStatus(): Promise<MarketStatusResponse> {
  const res = await marketApi.get<MarketStatusResponse>("/market/status");
  return res.data;
}

// --- Category APIs ---

export async function fetchCategories(): Promise<CategoryResponse[]> {
  const res = await marketApi.get<RawCategoryResponse[]>("/market/categories");
  if (!Array.isArray(res.data)) {
    return [];
  }

  return res.data
    .map((item) => ({
      categoryId: item.categoryId ?? item.id ?? "",
      categoryName: String(item.categoryName ?? item.name ?? ""),
    }))
    .filter((item) => String(item.categoryId).length > 0 && item.categoryName.length > 0);
}

export async function fetchCategoryStocks(
  categoryId: CategoryId,
): Promise<CategoryStockListResponse> {
  const res = await marketApi.get<RawCategoryStockListResponse | RawStockListItem[]>(
    `/market/categories/${categoryId}/stocks`,
  );

  if (Array.isArray(res.data)) {
    return {
      categoryId,
      categoryName: String(categoryId),
      stocks: res.data.map(normalizeStockListItem).filter((item) => hasStockId(item.stockId)),
    };
  }

  const stocks = Array.isArray(res.data.stocks) ? res.data.stocks : [];

  return {
    categoryId: res.data.categoryId ?? res.data.id ?? categoryId,
    categoryName: String(res.data.categoryName ?? res.data.name ?? categoryId),
    stocks: stocks.map(normalizeStockListItem).filter((item) => hasStockId(item.stockId)),
  };
}

export async function fetchCategoryChangeRate(
  categoryId: CategoryId,
): Promise<CategoryChangeRateResponse> {
  const res = await marketApi.get<RawCategoryChangeRateResponse>(
    `/market/categories/${categoryId}/change-rate`,
  );
  const data = res.data;

  return {
    categoryId: data.categoryId ?? data.id ?? categoryId,
    categoryName: data.categoryName ?? data.name ?? String(categoryId),
    changeRate: data.changeRate ?? data.averageChangePct ?? data.averageChangeRate ?? 0,
    averageChangePct: data.averageChangePct,
    stockCount: data.stockCount,
    positiveCount: data.positiveCount,
    negativeCount: data.negativeCount,
    updatedAt: data.updatedAt,
  };
}

export async function fetchHomeThemes(category = "industry"): Promise<HomeThemeItem[]> {
  const res = await marketApi.get<RawHomeThemesResponse>("/api/v1/home/themes", {
    params: { category },
  });

  const items = Array.isArray(res.data?.items) ? res.data.items : [];
  return items
    .map(normalizeHomeThemeItem)
    .filter((item) => item.id.length > 0 && item.name.length > 0);
}

export async function fetchHomeThemeChart(themeId: string, days = 30): Promise<AreaDataPoint[]> {
  const res = await marketApi.get<RawHomeThemeChartResponse>(
    `/api/v1/home/themes/${themeId}/chart`,
    { params: { days } },
  );

  const rows = Array.isArray(res.data?.chartData) ? res.data.chartData : [];
  return rows
    .map((item) => ({
      time: toThemeChartTime(item.time),
      value: toNumber(item.value ?? item.price),
    }))
    .filter((item) => item.value > 0 && String(item.time).length > 0);
}

// --- Index Candle API ---

export interface IndexCandleResponse {
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
  value: number;
  indexType: string;
  timeframe: string;
  at: string;
}

export async function fetchIndexCandles(
  indexType: IndexType,
  period: ChartPeriod = "일봉",
): Promise<CandlestickData<Time>[]> {
  const { startTime, endTime } = getDefaultTimeRange(period);
  const timeframe = PERIOD_TO_TIMEFRAME[period];

  const res = await marketApi.get<IndexCandleResponse[]>(
    `/market/indexes/${indexType}/candles`,
    { params: { startTime, endTime, timeframe } },
  );

  if (!Array.isArray(res.data) || res.data.length === 0) {
    return [];
  }

  return res.data
    .map((c) => {
      const isIntraday = c.timeframe === "MINUTE" || c.timeframe === "HOUR";
      const time = isIntraday
        ? toIntradayTimestamp(c.at)
        : (c.at.split("T")[0] as Time);
      return { time, open: c.open, high: c.high, low: c.low, close: c.close };
    })
    .filter((d) => {
      if (typeof d.time === "number" && (isNaN(d.time) || d.time <= 0)) return false;
      if (typeof d.time === "string" && (!d.time || d.time === "undefined")) return false;
      if (d.open == null || d.high == null || d.low == null || d.close == null) return false;
      if (isNaN(d.open) || isNaN(d.high) || isNaN(d.low) || isNaN(d.close)) return false;
      return true;
    });
}

// --- Area Chart Data Converter ---

export interface AreaDataPoint {
  time: Time;
  value: number;
}

export function toAreaData(candles: CandlestickData<Time>[]): AreaDataPoint[] {
  return candles.map((c) => ({ time: c.time, value: c.close }));
}

// --- Merge Helper ---

export function mergeStockData(
  stocks: StockListItem[],
  prices: StockClosingPrice[],
): StockWithPrice[] {
  const priceMap = new Map(prices.map((p) => [toStockIdKey(p.stockId), p]));
  return stocks.map((stock) => {
    const price = priceMap.get(toStockIdKey(stock.stockId));
    return {
      stockId: stock.stockId,
      symbol: stock.symbol,
      name: stock.name,
      categoryId: stock.categoryId,
      close: price?.close ?? 0,
      prevDayChangePct: price?.prevDayChangePct ?? 0,
      volume: price?.volume ?? 0,
      value: price?.value && price.value > 0 ? price.value : (price?.close ?? 0) * (price?.volume ?? 0),
    };
  });
}

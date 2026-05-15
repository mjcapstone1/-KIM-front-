import { api } from "@/api/axios";

export type SearchStockResult = {
  stockId?: string | number;
  id?: string | number;
  name?: string;
  code?: string;
  type?: string;
  nameEn?: string;
  marketSegment?: string;
};

export type SearchLearningResult = {
  id?: string | number;
  title?: string;
  category?: string;
  contentType?: string;
};

export type SearchResponse = {
  query: string;
  stocks: SearchStockResult[];
  learning: SearchLearningResult[];
};

function getSearchEndpoint(): string {
  const baseUrl = api.defaults.baseURL ?? "";
  const isAbsoluteBackendApiBase = /^https?:\/\//.test(baseUrl) && baseUrl.replace(/\/+$/, "").endsWith("/api");
  return isAbsoluteBackendApiBase ? "/v1/search" : "/api/v1/search";
}

export async function searchAll(query: string, limit = 6): Promise<SearchResponse> {
  const response = await api.get<SearchResponse>(getSearchEndpoint(), {
    params: { query, limit },
  });

  return {
    query: response.data.query ?? query,
    stocks: Array.isArray(response.data.stocks) ? response.data.stocks : [],
    learning: Array.isArray(response.data.learning) ? response.data.learning : [],
  };
}

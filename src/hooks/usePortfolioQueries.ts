import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { assetPortfolioApi } from "@/api/asset";
import type { PortfolioAsset } from "@/api/asset";
import type { StockId } from "@/api/market";
import { walletApi } from "@/api/wallet";

export const walletKeys = {
  all: ["wallet"] as const,
  balance: () => [...walletKeys.all, "balance"] as const,
};

export const portfolioKeys = {
  all: ["portfolio"] as const,
  holdings: (folderId?: string | null) => [...portfolioKeys.all, "holdings", folderId ?? "all"] as const,
  allocation: () => [...portfolioKeys.all, "allocation"] as const,
};

export function useWalletBalance() {
  return useQuery({
    queryKey: walletKeys.balance(),
    queryFn: walletApi.getBalance,
    staleTime: 10_000,
  });
}

export function usePortfolioHoldings(folderId?: string | null) {
  return useQuery({
    queryKey: portfolioKeys.holdings(folderId),
    queryFn: () => assetPortfolioApi.getPortfolioHoldings(folderId),
    staleTime: 10_000,
  });
}

export function useAssetAllocation() {
  return useQuery({
    queryKey: portfolioKeys.allocation(),
    queryFn: assetPortfolioApi.getAssetAllocation,
    staleTime: 10_000,
  });
}

export function useStockHolding(stockId: StockId | null | undefined) {
  const holdingsQuery = usePortfolioHoldings();
  const stockIdText = String(stockId ?? "").trim();

  const holding = useMemo<PortfolioAsset | null>(() => {
    if (!stockIdText) return null;
    return (holdingsQuery.data ?? []).find((item) => {
      const ids = [item.id, item.stockId, item.code].map((value) => String(value ?? "").trim());
      return ids.includes(stockIdText);
    }) ?? null;
  }, [holdingsQuery.data, stockIdText]);

  return { ...holdingsQuery, data: holding };
}

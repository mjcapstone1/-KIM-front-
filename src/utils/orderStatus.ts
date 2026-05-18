import type { TradeResponse } from "@/api/trade";

export type OrderStatusLevel = "pending" | "completed" | "canceled" | "failed" | "unknown";

export interface OrderStatusMeta {
  level: OrderStatusLevel;
  label: string;
  description: string;
}

const normalize = (value?: string | null) => String(value ?? "").trim().toLowerCase();

export const getOrderStatusMeta = (order: Pick<TradeResponse, "status" | "failureReasonCode" | "failureMessage">): OrderStatusMeta => {
  const status = normalize(order.status);
  const reasonCode = normalize(order.failureReasonCode).toUpperCase();

  if (status === "pending") {
    return {
      level: "pending",
      label: "대기중",
      description: "주문 조건을 기다리고 있습니다.",
    };
  }

  if (status === "completed") {
    return {
      level: "completed",
      label: "체결 완료",
      description: "주문이 체결되었습니다.",
    };
  }

  if (status === "canceled" || status === "cancelled") {
    return {
      level: "canceled",
      label: "취소됨",
      description: "사용자가 주문을 취소했습니다.",
    };
  }

  if (status === "failed") {
    if (reasonCode === "INSUFFICIENT_BALANCE") {
      return {
        level: "failed",
        label: "실패",
        description: "체결 시점 가격 상승으로 잔액이 부족해 주문이 실패했습니다.",
      };
    }

    if (reasonCode === "INSUFFICIENT_HOLDINGS") {
      return {
        level: "failed",
        label: "실패",
        description: "보유 수량이 부족해 예약 매도가 실패했습니다.",
      };
    }

    return {
      level: "failed",
      label: "실패",
      description: order.failureMessage || "주문 처리 중 문제가 발생해 실패했습니다.",
    };
  }

  return {
    level: "unknown",
    label: "상태 확인중",
    description: "주문 상태를 확인하고 있습니다.",
  };
};

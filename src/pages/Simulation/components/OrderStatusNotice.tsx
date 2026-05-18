import type { TradeResponse } from "@/api/trade";
import { cn } from "@/utils/cn";
import { getOrderStatusMeta } from "@/utils/orderStatus";

interface OrderStatusNoticeProps {
  order: Pick<TradeResponse, "status" | "failureReasonCode" | "failureMessage">;
  compact?: boolean;
  className?: string;
}

const levelClassNames = {
  pending: "border-amber-200 bg-amber-50 text-amber-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
  canceled: "border-gray-200 bg-gray-50 text-gray-600",
  failed: "border-red-200 bg-red-50 text-red-700",
  unknown: "border-gray-200 bg-gray-50 text-gray-500",
};

const badgeClassNames = {
  pending: "bg-amber-100 text-amber-800",
  completed: "bg-emerald-100 text-emerald-700",
  canceled: "bg-gray-200 text-gray-700",
  failed: "bg-red-100 text-red-700",
  unknown: "bg-gray-200 text-gray-600",
};

const OrderStatusNotice = ({ order, compact = false, className }: OrderStatusNoticeProps) => {
  const meta = getOrderStatusMeta(order);

  return (
    <div className={cn("rounded-xl border px-3 py-2 text-sm", levelClassNames[meta.level], className)}>
      <div className="flex items-center gap-2">
        <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", badgeClassNames[meta.level])}>
          {meta.label}
        </span>
        <span className={compact ? "text-xs" : undefined}>{meta.description}</span>
      </div>
    </div>
  );
};

export default OrderStatusNotice;

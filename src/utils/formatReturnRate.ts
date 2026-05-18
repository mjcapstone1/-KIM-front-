export function formatReturnRate(value: number | null | undefined, digits = 2): string {
  const rate = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return `${rate >= 0 ? "+" : ""}${rate.toFixed(digits)}%`;
}

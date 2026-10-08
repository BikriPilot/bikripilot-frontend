import { toLatinDigits } from "./phone";

export function formatMoney(paisa: number) {
  return `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: paisa % 100 === 0 ? 0 : 2 }).format(paisa / 100)}`;
}
export function takaToPaisa(value: string) {
  const number = Number(toLatinDigits(value).replace(/,/g, ""));
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

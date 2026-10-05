export function formatMoney(paisa: number) {
  return `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 0 }).format(paisa / 100)}`;
}
export function takaToPaisa(value: string) {
  const number = Number(value.replace(/,/g, ""));
  return Number.isFinite(number) ? Math.round(number * 100) : 0;
}

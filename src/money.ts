/** JKK 家賃表示（例: 85,000～）の下限を整数円で返す */
export function parseMinRentYen(rentLabel: string): number | null {
  const normalized = rentLabel.replace(/,/g, "").replace(/～.*$/, "").trim();
  const n = Number.parseInt(normalized, 10);
  return Number.isNaN(n) ? null : n;
}

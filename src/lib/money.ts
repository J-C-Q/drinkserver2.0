// Amounts are stored as integer euro cents; only format them for display.
export const formatCents = (cents: number) => (cents / 100).toFixed(2);

// "12,50" or "12.5" -> 1250; null if it is not a valid amount.
export const parseEuros = (value: string) => {
  const match = value.trim().replace(",", ".").match(/^(\d{1,6})(?:\.(\d{1,2}))?$/);
  if (!match) {
    return null;
  }
  return Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
};

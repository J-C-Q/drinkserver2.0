// Amounts are stored as integer euro cents; only format them for display.
export const formatCents = (cents: number) => (cents / 100).toFixed(2);

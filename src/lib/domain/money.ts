/**
 * Money helpers. Prices are authored in dollars (readable JSON) but all
 * arithmetic is done in integer cents to avoid floating-point drift
 * (0.1 + 0.2 !== 0.3). Convert to cents, sum in cents, format only at the edge.
 */

export function toCents(dollars: number): number {
  return Math.round(dollars * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatUSD(dollars: number): string {
  return usd.format(dollars);
}

export function formatCents(cents: number): string {
  return usd.format(fromCents(cents));
}

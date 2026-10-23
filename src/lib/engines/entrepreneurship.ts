/** Start-up calculations (pure functions). */

export const funnelCustomers = (visitors: number, ...stageRates: number[]): number => stageRates.reduce((n, r) => n * r, visitors);
export const proportionStandardError = (p: number, n: number): number => Math.sqrt((p * (1 - p)) / n);
export const proportionInterval = (p: number, n: number, z = 1.96): { low: number; high: number } => {
  const m = z * proportionStandardError(p, n);
  return { low: p - m, high: p + m };
};
/** Sample size so that a 95% interval for a proportion has the given half-width. */
export const sampleSizeForProportion = (p: number, halfWidth: number, z = 1.96): number => Math.ceil((z * z * p * (1 - p)) / (halfWidth * halfWidth) - 1e-9);

export const netBurn = (monthlyRevenue: number, monthlyExpenses: number): number => Math.max(0, monthlyExpenses - monthlyRevenue);
export const runwayMonths = (cash: number, monthlyNetBurn: number): number => (monthlyNetBurn > 0 ? cash / monthlyNetBurn : Infinity);
export const contributionPerOrder = (price: number, ...variableCosts: number[]): number => price - variableCosts.reduce((s, c) => s + c, 0);
export const breakEvenOrders = (fixedCosts: number, contribution: number): number => fixedCosts / contribution;

export const postMoney = (preMoney: number, investment: number): number => preMoney + investment;
export const investorOwnership = (preMoney: number, investment: number): number => investment / postMoney(preMoney, investment);
/** Existing holders' stake after a round in which new investors take `newOwnership` (decimal). */
export const stakeAfterRound = (stakeBefore: number, newOwnership: number): number => stakeBefore * (1 - newOwnership);
export const discountedPrice = (roundPrice: number, discount: number): number => roundPrice * (1 - discount);

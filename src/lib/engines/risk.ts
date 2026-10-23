/** Ethics, governance and risk calculations (pure functions). */

/** Utilitarian net benefit: total benefit to those who gain minus total harm to those who lose. */
export const netBenefit = (gainers: number, gainEach: number, losers: number, lossEach: number): number => gainers * gainEach - losers * lossEach;
export const expectedLoss = (probability: number, impact: number): number => probability * impact;
/** Probability at which spending `cost` to avoid a loss of `impact` breaks even. */
export const breakEvenProbability = (cost: number, impact: number): number => cost / impact;

/** Share of the cost of a perk borne by a manager who owns `ownership` of the firm; the rest falls on other shareholders. */
export const managerBorneCost = (perkCost: number, ownership: number): number => perkCost * ownership;
export const outsideShareholderCost = (perkCost: number, ownership: number): number => perkCost * (1 - ownership);
export const optionIntrinsicValue = (options: number, stockPrice: number, strike: number): number => options * Math.max(0, stockPrice - strike);

/** One-period parametric value at risk for normally distributed P&L (z = 1.645 for 95%). */
export const valueAtRisk = (sigma: number, z = 1.645, mean = 0): number => z * sigma - mean;
/** Scale one-day VaR to n days under independence (square-root-of-time rule). */
export const scaleVar = (oneDayVar: number, days: number): number => oneDayVar * Math.sqrt(days);

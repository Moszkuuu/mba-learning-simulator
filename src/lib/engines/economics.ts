/** Managerial economics calculations (pure functions). Percentages as decimals unless stated. */

/** Arc elasticity from percentage changes. */
export const elasticity = (pctChangeQuantity: number, pctChangePrice: number): number => pctChangeQuantity / pctChangePrice;
/** Midpoint (arc) price elasticity of demand. */
export function midpointElasticity(p1: number, q1: number, p2: number, q2: number): number {
  const dq = (q2 - q1) / ((q1 + q2) / 2);
  const dp = (p2 - p1) / ((p1 + p2) / 2);
  return dq / dp;
}
/** Point elasticity for linear demand Q = a - bP at price p. */
export const pointElasticityLinear = (a: number, b: number, p: number): number => (-b * p) / (a - b * p);
/** Revenue change factor for a price change, given constant elasticity E (negative) and small changes expressed as decimals. */
export const revenueChange = (elasticityValue: number, priceChange: number): number => (1 + priceChange) * (1 + elasticityValue * priceChange) - 1;

/** Marginal cost of the extra unit between two output levels. */
export const marginalCost = (totalCostLow: number, totalCostHigh: number, qLow: number, qHigh: number): number => (totalCostHigh - totalCostLow) / (qHigh - qLow);

export interface MonopolyResult { quantity: number; price: number; profit: number }
/** Profit-maximising monopolist facing inverse demand P = a - bQ with constant marginal cost c and fixed cost f (MR = a - 2bQ = c). */
export function monopolyLinear(a: number, b: number, c: number, fixedCost = 0): MonopolyResult {
  const quantity = (a - c) / (2 * b);
  const price = a - b * quantity;
  return { quantity, price, profit: (price - c) * quantity - fixedCost };
}

/** Lerner index (P - MC) / P. */
export const lerner = (price: number, mc: number): number => (price - mc) / price;
/** Inverse-elasticity pricing rule: P = MC / (1 + 1/E) with E < -1. */
export const markupPrice = (mc: number, elasticityValue: number): number => mc / (1 + 1 / elasticityValue);

export type Payoff = [number, number];
/** Pure-strategy Nash equilibria of a two-player game. matrix[row][col] = [rowPayoff, colPayoff]. */
export function pureNash(matrix: Payoff[][]): [number, number][] {
  const out: [number, number][] = [];
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      const rowBest = matrix.every((_, r2) => matrix[r2][c][0] <= matrix[r][c][0]);
      const colBest = matrix[r].every((_, c2) => matrix[r][c2][1] <= matrix[r][c][1]);
      if (rowBest && colBest) out.push([r, c]);
    }
  }
  return out;
}
export const expectedPayoff = (probabilities: number[], payoffs: number[]): number => probabilities.reduce((s, p, i) => s + p * payoffs[i], 0);

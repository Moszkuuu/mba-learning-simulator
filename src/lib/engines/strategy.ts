/** Strategy and decision-analysis calculations (pure functions). Shares are percentages (0-100) unless noted. */

export const concentrationRatio = (shares: number[], n: number): number => [...shares].sort((a, b) => b - a).slice(0, n).reduce((s, x) => s + x, 0);
/** Herfindahl-Hirschman Index: sum of squared percentage shares (0-10,000). */
export const hhi = (shares: number[]): number => shares.reduce((s, x) => s + x * x, 0);
/** HHI after two firms merge. */
export const hhiAfterMerger = (shares: number[], i: number, j: number): number => {
  const merged = shares.filter((_, k) => k !== i && k !== j);
  merged.push(shares[i] + shares[j]);
  return hhi(merged);
};

/** Unit cost after cumulative output of `units` with a learning rate (0.8 = costs fall to 80% each doubling). */
export const experienceCurveCost = (firstUnitCost: number, learningRate: number, cumulativeUnits: number): number =>
  firstUnitCost * Math.pow(cumulativeUnits, Math.log2(learningRate));
/** Price premium (decimal) a differentiator needs to earn the same unit margin as a rival. */
export const requiredPricePremium = (rivalPrice: number, rivalCost: number, ownCost: number): number => (rivalPrice - rivalCost + ownCost) / rivalPrice - 1;

export const relativeMarketShare = (ownShare: number, largestRivalShare: number): number => ownShare / largestRivalShare;
/** Net gain to the acquirer = synergies - premium paid over standalone value. */
export const acquirerNetGain = (standaloneValue: number, synergies: number, pricePaid: number): number => standaloneValue + synergies - pricePaid;
export const maxPremiumPct = (standaloneValue: number, synergies: number): number => (synergies / standaloneValue) * 100;

export interface Outcome { probability: number; payoff: number }
export const emv = (outcomes: Outcome[]): number => outcomes.reduce((s, o) => s + o.probability * o.payoff, 0);
/** Expected value with perfect information: choose the best action after learning the state (here: act only on positive payoffs, else payoff 0). */
export const emvWithPerfectInfo = (outcomes: Outcome[]): number => outcomes.reduce((s, o) => s + o.probability * Math.max(o.payoff, 0), 0);
export const evpi = (outcomes: Outcome[]): number => emvWithPerfectInfo(outcomes) - Math.max(emv(outcomes), 0);
/** Probability of success at which a two-outcome gamble has zero EMV. */
export const breakEvenProbability = (gain: number, loss: number): number => loss / (gain + loss);

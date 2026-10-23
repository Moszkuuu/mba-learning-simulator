/** Statistics and forecasting calculations (pure functions). */

export const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length;
export function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
/** Sample variance (n - 1 denominator). */
export const sampleVariance = (xs: number[]): number => {
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
};
export const sampleSd = (xs: number[]): number => Math.sqrt(sampleVariance(xs));
export const zScore = (x: number, mu: number, sd: number): number => (x - mu) / sd;
export const coefficientOfVariation = (sd: number, mu: number): number => sd / mu;

/** P(A | B) from P(A and B) and P(B). */
export const conditional = (pAandB: number, pB: number): number => pAandB / pB;
/** Bayes' rule with a base rate, sensitivity (P(+ | condition)) and false-positive rate (P(+ | no condition)). */
export const posteriorGivenPositive = (baseRate: number, sensitivity: number, falsePositiveRate: number): number =>
  (baseRate * sensitivity) / (baseRate * sensitivity + (1 - baseRate) * falsePositiveRate);
export const expectedValue = (values: number[], probabilities: number[]): number => values.reduce((s, v, i) => s + v * probabilities[i], 0);
const choose = (n: number, k: number): number => {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
};
export const binomialPmf = (n: number, k: number, p: number): number => choose(n, k) * p ** k * (1 - p) ** (n - k);

export const standardError = (sd: number, n: number): number => sd / Math.sqrt(n);
export const marginOfError = (se: number, z = 1.96): number => z * se;
export const zStatistic = (sampleMean: number, hypothesised: number, se: number): number => (sampleMean - hypothesised) / se;
export const requiredSampleSize = (sd: number, margin: number, z = 1.96): number => Math.ceil(((z * sd) / margin) ** 2 - 1e-9);
/** Standard normal CDF (Abramowitz-Stegun approximation, accurate to about 1e-7). */
export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}
export const twoSidedP = (z: number): number => 2 * (1 - normalCdf(Math.abs(z)));
export const twoProportionZ = (x1: number, n1: number, x2: number, n2: number): number => {
  const p1 = x1 / n1, p2 = x2 / n2;
  const se = Math.sqrt((p1 * (1 - p1)) / n1 + (p2 * (1 - p2)) / n2);
  return (p2 - p1) / se;
};

export interface Regression { slope: number; intercept: number; r2: number }
export function linearRegression(x: number[], y: number[]): Regression {
  const mx = mean(x), my = mean(y);
  const sxy = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const sxx = x.reduce((s, xi) => s + (xi - mx) ** 2, 0);
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const sst = y.reduce((s, yi) => s + (yi - my) ** 2, 0);
  const sse = y.reduce((s, yi, i) => s + (yi - (intercept + slope * x[i])) ** 2, 0);
  return { slope, intercept, r2: 1 - sse / sst };
}
export const movingAverageForecast = (series: number[], periods: number): number => mean(series.slice(-periods));
export const exponentialSmoothing = (previousForecast: number, actual: number, alpha: number): number => previousForecast + alpha * (actual - previousForecast);
/** Mean absolute percentage error, in percent. */
export const mape = (actual: number[], forecast: number[]): number => (mean(actual.map((a, i) => Math.abs((a - forecast[i]) / a))) * 100);

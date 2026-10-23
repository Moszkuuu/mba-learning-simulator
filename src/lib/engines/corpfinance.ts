/** Corporate finance calculations (pure functions). Rates are decimals (0.08 = 8%). */

export const futureValue = (pv: number, rate: number, years: number): number => pv * Math.pow(1 + rate, years);
export const presentValue = (fv: number, rate: number, years: number): number => fv / Math.pow(1 + rate, years);
export const annuityFactor = (rate: number, years: number): number => (rate === 0 ? years : (1 - Math.pow(1 + rate, -years)) / rate);
export const annuityPV = (payment: number, rate: number, years: number): number => payment * annuityFactor(rate, years);
export const perpetuityPV = (payment: number, rate: number): number => payment / rate;
/** Effective annual rate from a nominal annual rate compounded `periods` times a year. */
export const effectiveAnnualRate = (nominal: number, periods: number): number => Math.pow(1 + nominal / periods, periods) - 1;

/** cashFlows[0] is the time-0 flow (usually the negative outlay). */
export const npv = (rate: number, cashFlows: number[]): number => cashFlows.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0);

/** IRR by bisection; returns NaN if there is no sign change in [-0.99, 10]. */
export function irr(cashFlows: number[]): number {
  let lo = -0.99, hi = 10;
  const f = (r: number) => npv(r, cashFlows);
  if (f(lo) * f(hi) > 0) return NaN;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (f(lo) * f(mid) <= 0) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/** Simple payback in years with linear interpolation inside the recovery year; NaN if never recovered. */
export function paybackPeriod(cashFlows: number[]): number {
  let cumulative = cashFlows[0];
  for (let t = 1; t < cashFlows.length; t++) {
    if (cumulative + cashFlows[t] >= 0) return t - 1 + -cumulative / cashFlows[t];
    cumulative += cashFlows[t];
  }
  return NaN;
}
export const profitabilityIndex = (rate: number, cashFlows: number[]): number => (npv(rate, cashFlows) - cashFlows[0]) / -cashFlows[0];

export const afterTaxCostOfDebt = (preTaxRate: number, taxRate: number): number => preTaxRate * (1 - taxRate);
/** CAPM: expected return = risk-free + beta x equity risk premium. */
export const capm = (riskFree: number, beta: number, equityRiskPremium: number): number => riskFree + beta * equityRiskPremium;
export const wacc = (equityValue: number, debtValue: number, costOfEquity: number, preTaxCostOfDebt: number, taxRate: number): number => {
  const v = equityValue + debtValue;
  return (equityValue / v) * costOfEquity + (debtValue / v) * afterTaxCostOfDebt(preTaxCostOfDebt, taxRate);
};

/** Gordon growth: value = next cash flow / (r - g). */
export const gordonValue = (nextCashFlow: number, rate: number, growth: number): number => nextCashFlow / (rate - growth);
export const terminalValue = (finalYearFcf: number, rate: number, growth: number): number => gordonValue(finalYearFcf * (1 + growth), rate, growth);
/** Enterprise value from explicit forecast FCFs (years 1..n) plus a Gordon terminal value at year n. */
export function dcfEnterpriseValue(fcfs: number[], rate: number, growth: number): { pvForecast: number; pvTerminal: number; enterpriseValue: number } {
  const pvForecast = fcfs.reduce((s, cf, i) => s + cf / Math.pow(1 + rate, i + 1), 0);
  const pvTerminal = presentValue(terminalValue(fcfs[fcfs.length - 1], rate, growth), rate, fcfs.length);
  return { pvForecast, pvTerminal, enterpriseValue: pvForecast + pvTerminal };
}
export const equityFromEnterprise = (enterpriseValue: number, netDebt: number): number => enterpriseValue - netDebt;

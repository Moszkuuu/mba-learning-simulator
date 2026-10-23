/**
 * Pure financial-accounting formulas. No UI or storage code lives here.
 * All amounts are in dollars; "days" arguments let callers choose 30/360/365-day bases.
 */

export const safeDivide = (num: number, den: number): number => (den === 0 ? NaN : num / den);

// ---- Income statement ----
export const grossProfit = (revenue: number, cogs: number): number => revenue - cogs;
export const grossMarginPct = (revenue: number, cogs: number): number =>
  safeDivide(grossProfit(revenue, cogs), revenue) * 100;
/** COGS = opening inventory + purchases - closing inventory */
export const cogsFromInventory = (opening: number, purchases: number, closing: number): number =>
  opening + purchases - closing;
export const operatingProfit = (grossProfitValue: number, operatingExpenses: number): number =>
  grossProfitValue - operatingExpenses;
export const operatingMarginPct = (operatingProfitValue: number, revenue: number): number =>
  safeDivide(operatingProfitValue, revenue) * 100;
export const netProfit = (operatingProfitValue: number, interest: number, taxRate = 0): number => {
  const pretax = operatingProfitValue - interest;
  return pretax - Math.max(0, pretax) * taxRate;
};
export const netMarginPct = (netProfitValue: number, revenue: number): number =>
  safeDivide(netProfitValue, revenue) * 100;

// ---- Receivables / payables ----
/** DSO = AR / revenue x days in period */
export const dso = (ar: number, revenue: number, daysInPeriod: number): number =>
  safeDivide(ar, revenue) * daysInPeriod;
/** DPO = AP / COGS x days in period */
export const dpo = (ap: number, cogs: number, daysInPeriod: number): number =>
  safeDivide(ap, cogs) * daysInPeriod;
/** Cash collected = credit sales - increase in AR */
export const cashCollections = (revenue: number, openingAR: number, closingAR: number): number =>
  revenue - (closingAR - openingAR);

// ---- Inventory / working capital ----
export const inventoryTurnover = (cogs: number, averageInventory: number): number =>
  safeDivide(cogs, averageInventory);
export const dio = (inventory: number, cogs: number, daysInPeriod: number): number =>
  safeDivide(inventory, cogs) * daysInPeriod;
/** Trade (operating) working capital = AR + inventory - AP */
export const tradeWorkingCapital = (ar: number, inventory: number, ap: number): number =>
  ar + inventory - ap;
/** Net working capital = current assets - current liabilities */
export const netWorkingCapital = (currentAssets: number, currentLiabilities: number): number =>
  currentAssets - currentLiabilities;
export const cashConversionCycle = (dioDays: number, dsoDays: number, dpoDays: number): number =>
  dioDays + dsoDays - dpoDays;

// ---- Cash flow ----
export interface OperatingCashFlowInput {
  netIncome: number;
  depreciation?: number;
  /** Increase in AR (positive) uses cash */
  changeInAR: number;
  /** Increase in inventory (positive) uses cash */
  changeInInventory: number;
  /** Increase in AP (positive) provides cash */
  changeInAP: number;
}
/** Indirect method: NI + D&A - ΔAR - ΔInventory + ΔAP */
export const operatingCashFlowIndirect = (i: OperatingCashFlowInput): number =>
  i.netIncome + (i.depreciation ?? 0) - i.changeInAR - i.changeInInventory + i.changeInAP;
/** Direct method: collections - supplier payments - cash operating expenses - interest paid */
export const operatingCashFlowDirect = (
  collections: number,
  supplierPayments: number,
  cashOperatingExpenses: number,
  interestPaid = 0,
): number => collections - supplierPayments - cashOperatingExpenses - interestPaid;

// ---- Break-even ----
export const contributionMarginPerUnit = (price: number, variableCost: number): number => price - variableCost;
export const contributionMarginRatio = (price: number, variableCost: number): number =>
  safeDivide(price - variableCost, price);
/** Units needed to earn `targetProfit` (0 = break-even). Returns NaN if CM <= 0. */
export const breakEvenUnits = (fixedCosts: number, price: number, variableCost: number, targetProfit = 0): number => {
  const cm = price - variableCost;
  return cm > 0 ? (fixedCosts + targetProfit) / cm : NaN;
};
export const breakEvenRevenue = (fixedCosts: number, cmRatio: number, targetProfit = 0): number =>
  cmRatio > 0 ? (fixedCosts + targetProfit) / cmRatio : NaN;
export const marginOfSafetyPct = (actual: number, breakEven: number): number =>
  safeDivide(actual - breakEven, actual) * 100;

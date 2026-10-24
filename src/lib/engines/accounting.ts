/** Financial accounting calculations beyond the core formulas in ../finance.ts (pure functions). */
import { annuityFactor } from './corpfinance';

// ---- accounting equation and double entry ----
export const equityFromEquation = (assets: number, liabilities: number): number => assets - liabilities;
export const closingEquity = (openingEquity: number, profit: number, dividends: number, newCapital = 0): number => openingEquity + newCapital + profit - dividends;
export interface Line { account: string; debit?: number; credit?: number }
export const totalDebits = (lines: Line[]): number => lines.reduce((s, l) => s + (l.debit ?? 0), 0);
export const totalCredits = (lines: Line[]): number => lines.reduce((s, l) => s + (l.credit ?? 0), 0);
export const isBalanced = (lines: Line[]): boolean => Math.abs(totalDebits(lines) - totalCredits(lines)) < 1e-9;

// ---- accruals and deferrals ----
export const monthlyShare = (amount: number, months: number, monthsElapsed: number): number => (amount / months) * monthsElapsed;
export const accruedFraction = (periodAmount: number, daysOwed: number, daysInPeriod: number): number => (periodAmount * daysOwed) / daysInPeriod;
export const allowance = (receivables: number, rate: number): number => receivables * rate;

// ---- inventory ----
export interface Layer { units: number; cost: number }
/** FIFO: oldest layers are sold first. Returns cost of goods sold and ending inventory value. */
export function fifo(layers: Layer[], unitsSold: number): { cogs: number; ending: number } {
  let left = unitsSold, cogs = 0, ending = 0;
  for (const l of layers) {
    const take = Math.min(l.units, left);
    cogs += take * l.cost;
    ending += (l.units - take) * l.cost;
    left -= take;
  }
  return { cogs, ending };
}
/** LIFO: newest layers are sold first (not permitted under IFRS). */
export const lifo = (layers: Layer[], unitsSold: number): { cogs: number; ending: number } => fifo([...layers].reverse(), unitsSold);
export function weightedAverage(layers: Layer[], unitsSold: number): { unitCost: number; cogs: number; ending: number } {
  const units = layers.reduce((s, l) => s + l.units, 0);
  const total = layers.reduce((s, l) => s + l.units * l.cost, 0);
  const unitCost = total / units;
  return { unitCost, cogs: unitCost * unitsSold, ending: total - unitCost * unitsSold };
}
export const netRealisableValue = (sellingPrice: number, costToSell: number): number => sellingPrice - costToSell;
export const inventoryWriteDown = (unitCost: number, nrv: number, units: number): number => Math.max(0, unitCost - nrv) * units;

// ---- long-lived assets ----
export const straightLine = (cost: number, residual: number, lifeYears: number): number => (cost - residual) / lifeYears;
/** Double-declining-balance depreciation for a given year (1-based); never depreciates below residual. */
export function doubleDeclining(cost: number, residual: number, lifeYears: number, year: number): number {
  const rate = 2 / lifeYears;
  let book = cost;
  let dep = 0;
  for (let y = 1; y <= year; y++) {
    dep = Math.min(book * rate, book - residual);
    book -= dep;
  }
  return dep;
}
export const unitsOfProduction = (cost: number, residual: number, totalUnits: number, unitsThisYear: number): number => ((cost - residual) / totalUnits) * unitsThisYear;
export const bookValueSL = (cost: number, residual: number, lifeYears: number, yearsUsed: number): number => cost - straightLine(cost, residual, lifeYears) * yearsUsed;
export const gainOnDisposal = (proceeds: number, bookValue: number): number => proceeds - bookValue;

// ---- debt and equity ----
export const loanPayment = (principal: number, rate: number, years: number): number => principal / annuityFactor(rate, years);
export const interestForPeriod = (balance: number, rate: number): number => balance * rate;
export const debtToEquity = (debt: number, equity: number): number => debt / equity;
export const interestCoverage = (ebit: number, interest: number): number => ebit / interest;

// ---- ratios ----
export const currentRatio = (currentAssets: number, currentLiabilities: number): number => currentAssets / currentLiabilities;
export const quickRatio = (currentAssets: number, inventory: number, currentLiabilities: number): number => (currentAssets - inventory) / currentLiabilities;
export const roe = (netIncome: number, equity: number): number => (netIncome / equity) * 100;
export const dupont = (netIncome: number, revenue: number, assets: number, equity: number): { margin: number; turnover: number; multiplier: number; roe: number } => {
  const margin = netIncome / revenue, turnover = revenue / assets, multiplier = assets / equity;
  return { margin, turnover, multiplier, roe: margin * turnover * multiplier };
};
export const growthPct = (previous: number, current: number): number => (current / previous - 1) * 100;
export const commonSizePct = (item: number, base: number): number => (item / base) * 100;
export const daysOutstanding360 = (balance: number, flow: number): number => (balance / flow) * 360;

// ---- earnings quality ----
export const cashConversion = (operatingCashFlow: number, netIncome: number): number => operatingCashFlow / netIncome;
export const totalAccruals = (netIncome: number, operatingCashFlow: number): number => netIncome - operatingCashFlow;
/** Convert LIFO figures to FIFO using the LIFO reserve (cumulative FIFO - LIFO inventory difference). */
export const fifoInventory = (lifoInventory: number, lifoReserve: number): number => lifoInventory + lifoReserve;
export const fifoCogs = (lifoCogs: number, reserveIncrease: number): number => lifoCogs - reserveIncrease;

/**
 * Deterministic monthly simulation of a fictional food distributor ("Harvest Route Foods").
 * Every outcome follows from the documented mechanisms below - there is no randomness.
 *
 * ASSUMPTIONS (also shown to the student in the Simulator "Model assumptions" panel):
 *  1. Months are 30 days. Month 1 = January; the simulation runs 12 months.
 *  2. Base product: price $20/unit, unit cost $13/unit (35% gross margin), 10,000 units demanded per month.
 *  3. Demand = base x seasonality x price effect x marketing effect x credit-terms effect.
 *     - Seasonality: fixed calendar table (holiday peak in Nov/Dec).
 *     - Price effect: priceIndex^(-1.5) (constant elasticity of 1.5).
 *     - Marketing effect: 1 + 20% x (1 - e^(-S/20,000)), where S = this month's spend + 50% of last month's S
 *       (diminishing returns, 50% carry-over).
 *     - Credit-terms effect: +0.15% demand per day of customer terms above 60 days (negative below 60).
 *  4. Units sold = min(demand, units in stock). Unsold demand is "lost sales". Inventory can never go negative.
 *  5. Purchases arrive at the start of the month and can be sold that month. Supplier terms change the unit cost:
 *     0 days -2% (early-payment discount), 30 days 0%, 60 days +1.5%, 90 days +3% (supplier financing premium).
 *     Inventory is valued at weighted-average cost.
 *  6. Revenue and COGS are recognised when goods are sold. Cash is collected `customerTerms` days later
 *     (0/30/60/90 days = same month / +1 / +2 / +3 months). Supplier invoices are paid `supplierTerms` days after purchase.
 *  7. Bad debt expense = 0.3% of revenue per 30 days of customer terms (0 / 0.3 / 0.6 / 0.9%); it reduces cash collected.
 *  8. Operating expenses = fixed $60,000 + marketing + bad debt + inventory holding cost (1% of opening inventory value:
 *     warehousing, spoilage, insurance). Marketing and fixed costs are paid in cash in the month incurred.
 *  9. Negative cash is an overdraft: 1.5% interest per month on the negative balance, up to a $150,000 facility.
 *     Beyond that the company defaults and the simulation ends. No income tax or depreciation is modelled.
 * 10. Equity = cash + AR + inventory - AP, so closing equity = opening equity + cumulative net profit (checked by tests).
 */

export const SIM = {
  months: 12,
  daysPerMonth: 30,
  basePrice: 20,
  baseUnitCost: 13,
  baseUnits: 10_000,
  elasticity: 1.5,
  marketingMaxUplift: 0.2,
  marketingScale: 20_000,
  marketingCarryover: 0.5,
  termsDemandPerDay: 0.0015,
  neutralCustomerTerms: 60,
  badDebtPer30Days: 0.003,
  fixedCosts: 60_000,
  holdingRate: 0.01,
  overdraftRate: 0.015,
  overdraftLimit: 150_000,
  startCash: 500_000,
  startInventoryValue: 300_000,
  startCustomerTerms: 60,
  startSupplierTerms: 30,
  seasonality: [0.95, 0.95, 1.0, 1.0, 1.02, 1.02, 1.0, 1.0, 1.03, 1.05, 1.1, 1.15],
  supplierCostAdjustment: { 0: -0.02, 30: 0, 60: 0.015, 90: 0.03 } as Record<number, number>,
  limits: {
    priceIndex: { min: 0.8, max: 1.25 },
    marketing: { min: 0, max: 50_000 },
    purchases: { min: 0, max: 500_000 },
  },
} as const;

export const CUSTOMER_TERMS = [0, 30, 60, 90] as const;
export const SUPPLIER_TERMS = [0, 30, 60, 90] as const;
export const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface Decision {
  /** Selling price as a multiple of the $20 base price (1 = $20). */
  priceIndex: number;
  /** Extra marketing spend, $ this month. */
  marketing: number;
  /** Inventory purchase budget, $ (at invoice cost). */
  purchases: number;
  customerTermsDays: number;
  supplierTermsDays: number;
}

interface Ledger {
  dueMonth: number;
  amount: number;
}

export type SimStatus = 'running' | 'completed' | 'defaulted';

/** Language-neutral warning; the UI turns it into text. */
export type SimWarning =
  | { code: 'stockout'; demand: number; sold: number; lost: number }
  | { code: 'liquidity'; cash: number }
  | { code: 'default' };

export interface MonthResult {
  month: number;
  decision: Decision;
  price: number;
  unitCost: number;
  demandUnits: number;
  unitsSold: number;
  lostUnits: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marketing: number;
  fixedCosts: number;
  holdingCost: number;
  badDebt: number;
  operatingExpenses: number;
  operatingProfit: number;
  interest: number;
  netProfit: number;
  purchases: number;
  collections: number;
  supplierPayments: number;
  cashFlow: number;
  openingCash: number;
  closingCash: number;
  accountsReceivable: number;
  inventory: number;
  accountsPayable: number;
  equity: number;
  warnings: SimWarning[];
}

export interface SimState {
  /** Next month to be played (1-12); 13 once finished. */
  month: number;
  cash: number;
  inventoryUnits: number;
  inventoryValue: number;
  receivables: Ledger[];
  payables: Ledger[];
  marketingStock: number;
  status: SimStatus;
  history: MonthResult[];
}

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const defaultDecision = (): Decision => ({
  priceIndex: 1,
  marketing: 0,
  purchases: 130_000,
  customerTermsDays: SIM.startCustomerTerms,
  supplierTermsDays: SIM.startSupplierTerms,
});

export function initialState(): SimState {
  const startUnits = SIM.startInventoryValue / SIM.baseUnitCost;
  return {
    month: 1,
    cash: SIM.startCash,
    inventoryUnits: startUnits,
    inventoryValue: SIM.startInventoryValue,
    // 60-day terms: December's sales are collected in Jan (month 1) and Nov's in Feb (month 2)
    receivables: [
      { dueMonth: 1, amount: 200_000 },
      { dueMonth: 2, amount: 200_000 },
    ],
    // 30-day supplier terms: last month's $130,000 purchases are due in month 1
    payables: [{ dueMonth: 1, amount: 130_000 }],
    marketingStock: 0,
    status: 'running',
    history: [],
  };
}

const sum = (l: Ledger[]): number => l.reduce((s, e) => s + e.amount, 0);
export const receivablesBalance = (s: SimState): number => round2(sum(s.receivables));
export const payablesBalance = (s: SimState): number => round2(sum(s.payables));
export const equityOf = (s: SimState): number =>
  round2(s.cash + receivablesBalance(s) + s.inventoryValue - payablesBalance(s));

export interface DecisionError {
  field: keyof Decision;
  message: string;
}

export interface DecisionCheck {
  decision: Decision;
  errors: DecisionError[];
}

const nearestOption = (v: number, options: readonly number[]): number =>
  options.reduce((best, o) => (Math.abs(o - v) < Math.abs(best - v) ? o : best), options[0]);

/** Validates raw decision values (may contain NaN/out-of-range). Returns a safe, clamped decision plus error messages. */
export function validateDecision(raw: Partial<Record<keyof Decision, number>>): DecisionCheck {
  const errors: DecisionError[] = [];
  const base = defaultDecision();
  const num = (key: keyof Decision, label: string, min: number, max: number): number => {
    const v = raw[key];
    if (v === undefined || typeof v !== 'number' || !Number.isFinite(v)) {
      errors.push({ field: key, message: `${label}: enter a valid number.` });
      return base[key];
    }
    if (v < min || v > max) {
      errors.push({ field: key, message: `${label}: must be between ${min} and ${max}.` });
      return Math.min(max, Math.max(min, v));
    }
    return v;
  };
  const L = SIM.limits;
  const decision: Decision = {
    priceIndex: num('priceIndex', 'Price index', L.priceIndex.min, L.priceIndex.max),
    marketing: num('marketing', 'Marketing', L.marketing.min, L.marketing.max),
    purchases: num('purchases', 'Inventory purchases', L.purchases.min, L.purchases.max),
    customerTermsDays: nearestOption(raw.customerTermsDays ?? base.customerTermsDays, CUSTOMER_TERMS),
    supplierTermsDays: nearestOption(raw.supplierTermsDays ?? base.supplierTermsDays, SUPPLIER_TERMS),
  };
  return { decision, errors };
}

export const unitCostFor = (supplierTermsDays: number): number =>
  round2(SIM.baseUnitCost * (1 + (SIM.supplierCostAdjustment[supplierTermsDays] ?? 0)));

export interface DemandBreakdown {
  seasonality: number;
  price: number;
  marketing: number;
  terms: number;
  units: number;
}

export function demandFor(month: number, d: Decision, marketingStock: number): DemandBreakdown {
  const seasonality = SIM.seasonality[(month - 1) % 12];
  const price = Math.pow(d.priceIndex, -SIM.elasticity);
  const marketing = 1 + SIM.marketingMaxUplift * (1 - Math.exp(-marketingStock / SIM.marketingScale));
  const terms = 1 + SIM.termsDemandPerDay * (d.customerTermsDays - SIM.neutralCustomerTerms);
  return { seasonality, price, marketing, terms, units: Math.floor(SIM.baseUnits * seasonality * price * marketing * terms) };
}

/** Plays one month. Pure: returns a new state and never mutates the input. */
export function simulateMonth(prev: SimState, rawDecision: Decision): { state: SimState; result: MonthResult } {
  if (prev.status !== 'running') throw new Error('Simulation is already finished.');
  const { decision: d } = validateDecision(rawDecision);
  const month = prev.month;
  const warnings: SimWarning[] = [];
  const openingCash = prev.cash;
  const openingInventoryValue = prev.inventoryValue;

  // 1. Purchases arrive; inventory valued at weighted-average cost
  const unitCost = unitCostFor(d.supplierTermsDays);
  const purchases = round2(d.purchases);
  let units = prev.inventoryUnits + purchases / unitCost;
  let invValue = round2(prev.inventoryValue + purchases);
  const payables = [...prev.payables];
  if (purchases > 0) payables.push({ dueMonth: month + d.supplierTermsDays / SIM.daysPerMonth, amount: purchases });

  // 2. Demand and sales (capped by stock)
  const marketingStock = d.marketing + SIM.marketingCarryover * prev.marketingStock;
  const demand = demandFor(month, d, marketingStock);
  const price = round2(SIM.basePrice * d.priceIndex);
  const unitsSold = Math.min(demand.units, Math.floor(units));
  const lostUnits = demand.units - unitsSold;
  const revenue = round2(unitsSold * price);
  const cogs = units > 0 ? Math.min(invValue, round2((invValue / units) * unitsSold)) : 0;
  units = Math.max(0, units - unitsSold);
  invValue = Math.max(0, round2(invValue - cogs));
  if (units === 0) invValue = 0;
  if (lostUnits > 0) warnings.push({ code: 'stockout', demand: demand.units, sold: unitsSold, lost: lostUnits });

  // 3. Receivable created, net of expected bad debt
  const badDebt = round2(revenue * SIM.badDebtPer30Days * (d.customerTermsDays / SIM.daysPerMonth));
  const receivables = [...prev.receivables];
  if (revenue > 0) receivables.push({ dueMonth: month + d.customerTermsDays / SIM.daysPerMonth, amount: round2(revenue - badDebt) });

  // 4. Cash collected / supplier payments falling due this month
  const collections = round2(sum(receivables.filter((e) => e.dueMonth <= month)));
  const supplierPayments = round2(sum(payables.filter((e) => e.dueMonth <= month)));
  const remainingAR = receivables.filter((e) => e.dueMonth > month);
  const remainingAP = payables.filter((e) => e.dueMonth > month);

  // 5. Operating expenses & profit
  const holdingCost = round2(openingInventoryValue * SIM.holdingRate);
  const operatingExpenses = round2(SIM.fixedCosts + d.marketing + badDebt + holdingCost);
  const grossProfit = round2(revenue - cogs);
  const operatingProfit = round2(grossProfit - operatingExpenses);

  // 6. Cash, overdraft interest
  const cashBeforeInterest = round2(openingCash + collections - supplierPayments - SIM.fixedCosts - d.marketing - holdingCost);
  const interest = cashBeforeInterest < 0 ? round2(-cashBeforeInterest * SIM.overdraftRate) : 0;
  const closingCash = round2(cashBeforeInterest - interest);
  const netProfit = round2(operatingProfit - interest);

  let status: SimStatus = 'running';
  if (closingCash < 0) warnings.push({ code: 'liquidity', cash: closingCash });
  if (closingCash < -SIM.overdraftLimit) {
    status = 'defaulted';
    warnings.push({ code: 'default' });
  } else if (month >= SIM.months) {
    status = 'completed';
  }

  const state: SimState = {
    month: month + 1,
    cash: closingCash,
    inventoryUnits: units,
    inventoryValue: invValue,
    receivables: remainingAR,
    payables: remainingAP,
    marketingStock,
    status,
    history: prev.history,
  };
  const result: MonthResult = {
    month, decision: d, price, unitCost, demandUnits: demand.units, unitsSold, lostUnits,
    revenue, cogs, grossProfit, marketing: d.marketing, fixedCosts: SIM.fixedCosts, holdingCost, badDebt,
    operatingExpenses, operatingProfit, interest, netProfit, purchases, collections, supplierPayments,
    cashFlow: round2(closingCash - openingCash), openingCash, closingCash,
    accountsReceivable: receivablesBalance(state), inventory: state.inventoryValue,
    accountsPayable: payablesBalance(state), equity: equityOf(state), warnings,
  };
  return { state: { ...state, history: [...prev.history, result] }, result };
}

export const startingEquity = (): number => equityOf(initialState());

export interface SimSummary {
  months: number;
  status: SimStatus;
  finalCash: number;
  finalEquity: number;
  cumulativeProfit: number;
  totalRevenue: number;
  lostUnits: number;
  minCash: number;
}

export function summarize(state: SimState): SimSummary {
  const h = state.history;
  return {
    months: h.length,
    status: state.status,
    finalCash: state.cash,
    finalEquity: equityOf(state),
    cumulativeProfit: round2(h.reduce((s, m) => s + m.netProfit, 0)),
    totalRevenue: round2(h.reduce((s, m) => s + m.revenue, 0)),
    lostUnits: h.reduce((s, m) => s + m.lostUnits, 0),
    minCash: h.length ? Math.min(...h.map((m) => m.closingCash)) : state.cash,
  };
}

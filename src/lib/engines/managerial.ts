/** Managerial accounting calculations (pure functions). */

export const totalCost = (fixed: number, variablePerUnit: number, units: number): number => fixed + variablePerUnit * units;

export interface HighLow { variablePerUnit: number; fixed: number }
/** High-low method: uses the highest and lowest activity levels to split a mixed cost. */
export function highLow(highUnits: number, highCost: number, lowUnits: number, lowCost: number): HighLow {
  const variablePerUnit = (highCost - lowCost) / (highUnits - lowUnits);
  return { variablePerUnit, fixed: highCost - variablePerUnit * highUnits };
}

/** Predetermined overhead rate = estimated overhead / estimated allocation base. */
export const overheadRate = (estimatedOverhead: number, estimatedBase: number): number => estimatedOverhead / estimatedBase;
export const appliedOverhead = (rate: number, actualBase: number): number => rate * actualBase;
/** Positive = under-applied (actual > applied); negative = over-applied. */
export const overheadUnderApplied = (actualOverhead: number, applied: number): number => actualOverhead - applied;

/** Absorption profit minus variable-costing profit = fixed overhead per unit x (units produced - units sold). */
export const absorptionMinusVariableProfit = (fixedOverhead: number, produced: number, sold: number): number =>
  (fixedOverhead / produced) * (produced - sold);

export const flexibleBudget = (fixed: number, variablePerUnit: number, actualUnits: number): number => fixed + variablePerUnit * actualUnits;

/** Positive = unfavourable (paid more than standard). */
export const priceVariance = (actualPrice: number, standardPrice: number, actualQty: number): number => (actualPrice - standardPrice) * actualQty;
/** Positive = unfavourable (used more than the standard allowed). */
export const usageVariance = (actualQty: number, standardQtyAllowed: number, standardPrice: number): number => (actualQty - standardQtyAllowed) * standardPrice;

/** Incremental profit of a special order when there is spare capacity and no extra fixed cost. */
export const specialOrderProfit = (units: number, offerPrice: number, variableCost: number): number => units * (offerPrice - variableCost);
/** Annual saving from making (positive) rather than buying; only avoidable (relevant) costs count. */
export const makeInsteadOfBuySaving = (units: number, buyPrice: number, relevantMakeCostPerUnit: number): number => units * (buyPrice - relevantMakeCostPerUnit);
/** Profit change from dropping a segment: lose its contribution, save its avoidable fixed costs. */
export const dropSegmentEffect = (contribution: number, avoidableFixed: number): number => -contribution + avoidableFixed;
export const contributionPerScarceHour = (contributionPerUnit: number, hoursPerUnit: number): number => contributionPerUnit / hoursPerUnit;

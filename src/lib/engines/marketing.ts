/** Marketing analytics (pure functions). */

export const captured = (customers: number, penetration: number): number => customers * penetration;
/** Net contribution from targeting a segment. penetration is a decimal. */
export const segmentNetContribution = (customers: number, penetration: number, contributionPerCustomer: number, cost: number): number =>
  captured(customers, penetration) * contributionPerCustomer - cost;
/** Penetration (decimal) at which a segment just covers its targeting cost. */
export const breakEvenPenetration = (customers: number, contributionPerCustomer: number, cost: number): number => cost / (customers * contributionPerCustomer);

/** Economic value to the customer = reference price + value of positive differentiators - value of negative differentiators. */
export const economicValueToCustomer = (referencePrice: number, positive: number, negative: number): number => referencePrice + positive - negative;
/** Price midway between cost and customer value (shares the surplus equally). */
export const sharedSurplusPrice = (cost: number, evc: number, firmShare: number): number => cost + firmShare * (evc - cost);

/** Required volume increase (decimal) to keep total contribution after a price cut of `cut` when contribution margin is `margin` (both as fractions of the current price). */
export const breakEvenVolumeGainForPriceCut = (margin: number, cut: number): number => cut / (margin - cut);
/** Maximum tolerable volume loss (decimal) after a price rise of `rise`. */
export const breakEvenVolumeLossForPriceRise = (margin: number, rise: number): number => rise / (margin + rise);
export const contributionIndexAfterPriceChange = (margin: number, priceChange: number, volumeChange: number): number =>
  ((margin + priceChange) * (1 + volumeChange)) / margin;

export const customerAcquisitionCost = (acquisitionSpend: number, newCustomers: number): number => acquisitionSpend / newCustomers;
/** Expected customer lifetime in periods with a constant churn rate (decimal). */
export const lifetimePeriods = (churn: number): number => 1 / churn;
export const customerLifetimeValue = (marginPerPeriod: number, churn: number): number => marginPerPeriod * lifetimePeriods(churn);
export const ltvToCac = (ltv: number, cac: number): number => ltv / cac;
export const paybackPeriods = (cac: number, marginPerPeriod: number): number => cac / marginPerPeriod;

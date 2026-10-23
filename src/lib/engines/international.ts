/** International business calculations (pure functions). Rates are decimals (0.02 = 2%). */

/** Convert an amount using a quote of "domestic units per one unit of foreign currency". */
export const convert = (amount: number, rate: number): number => amount * rate;
/** Cross rate: units of B per unit of A, given B per USD and A per USD. */
export const crossRate = (bPerUsd: number, aPerUsd: number): number => bPerUsd / aPerUsd;
/** Covered interest parity: forward = spot x (1 + domestic rate) / (1 + foreign rate), spot quoted as domestic per foreign. */
export const forwardRate = (spot: number, domesticRate: number, foreignRate: number): number => (spot * (1 + domesticRate)) / (1 + foreignRate);
export const percentChange = (from: number, to: number): number => to / from - 1;

/** Opportunity cost of one unit of good X in units of Y, given maximum outputs of X and Y. */
export const opportunityCost = (maxX: number, maxY: number): number => maxY / maxX;
export const tariffRevenue = (importValue: number, tariffRate: number): number => importValue * tariffRate;
export const domesticPriceWithTariff = (worldPrice: number, tariffRate: number): number => worldPrice * (1 + tariffRate);

export const royalty = (licenseeSales: number, royaltyRate: number): number => licenseeSales * royaltyRate;
/** Expected NPV when a project is lost (recovering only `recovery`) with probability `lossProbability`. */
export const expectedPvWithLoss = (pvIfSuccessful: number, lossProbability: number, recovery: number): number => (1 - lossProbability) * pvIfSuccessful + lossProbability * recovery;

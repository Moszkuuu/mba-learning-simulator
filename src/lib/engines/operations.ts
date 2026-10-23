/** Operations and supply chain calculations (pure functions). */

/** Units per hour for a step that takes `minutesPerUnit` with `workers` working in parallel. */
export const stepCapacityPerHour = (minutesPerUnit: number, workers = 1): number => (60 / minutesPerUnit) * workers;
export const processCapacity = (stepCapacities: number[]): number => Math.min(...stepCapacities);
export const bottleneckIndex = (stepCapacities: number[]): number => stepCapacities.indexOf(Math.min(...stepCapacities));
export const utilization = (flowRate: number, capacity: number): number => flowRate / capacity;
/** Little's Law: average inventory (WIP) = throughput x average flow time. */
export const littleWip = (throughput: number, flowTime: number): number => throughput * flowTime;
export const littleFlowTime = (wip: number, throughput: number): number => wip / throughput;

export const eoq = (annualDemand: number, orderCost: number, holdingCostPerUnit: number): number => Math.sqrt((2 * annualDemand * orderCost) / holdingCostPerUnit);
export const annualOrderingCost = (annualDemand: number, orderQty: number, orderCost: number): number => (annualDemand / orderQty) * orderCost;
export const annualHoldingCost = (orderQty: number, holdingCostPerUnit: number): number => (orderQty / 2) * holdingCostPerUnit;
export const annualInventoryCost = (annualDemand: number, orderQty: number, orderCost: number, holdingCostPerUnit: number): number =>
  annualOrderingCost(annualDemand, orderQty, orderCost) + annualHoldingCost(orderQty, holdingCostPerUnit);
export const reorderPoint = (demandPerPeriod: number, leadTime: number, safetyStock = 0): number => demandPerPeriod * leadTime + safetyStock;
export const demandStdDuringLeadTime = (stdPerPeriod: number, leadTimePeriods: number): number => stdPerPeriod * Math.sqrt(leadTimePeriods);
export const safetyStock = (z: number, stdDuringLeadTime: number): number => z * stdDuringLeadTime;

export interface MM1 { rho: number; L: number; Lq: number; W: number; Wq: number }
/** M/M/1 queue: arrivals lambda, service rate mu (same time unit). Requires lambda < mu. */
export function mm1(lambda: number, mu: number): MM1 {
  const rho = lambda / mu;
  if (rho >= 1) throw new Error('Unstable queue: arrival rate must be below service rate.');
  const L = rho / (1 - rho);
  const Lq = (rho * rho) / (1 - rho);
  return { rho, L, Lq, W: 1 / (mu - lambda), Wq: Lq / lambda };
}

export const dpmo = (defects: number, units: number, opportunitiesPerUnit: number): number => (defects / (units * opportunitiesPerUnit)) * 1_000_000;
export const processCapability = (usl: number, lsl: number, sigma: number): number => (usl - lsl) / (6 * sigma);
export const processCapabilityIndex = (usl: number, lsl: number, mean: number, sigma: number): number => Math.min(usl - mean, mean - lsl) / (3 * sigma);
export const controlLimits = (mean: number, sigma: number, sampleSize: number): { lcl: number; ucl: number } => {
  const se = sigma / Math.sqrt(sampleSize);
  return { lcl: mean - 3 * se, ucl: mean + 3 * se };
};

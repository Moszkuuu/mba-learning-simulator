/** Organizational behaviour calculations (pure functions). */

/** Vroom's expectancy model: motivational force = expectancy x instrumentality x valence. */
export const motivationalForce = (expectancy: number, instrumentality: number, valence: number): number => expectancy * instrumentality * valence;
/** Equity theory ratio: outcomes received per unit of input. */
export const outcomeInputRatio = (outcomes: number, inputs: number): number => outcomes / inputs;

/** Number of two-way communication links in a team of n people. */
export const communicationLinks = (n: number): number => (n * (n - 1)) / 2;

/** Managers needed above `operatives` when every manager supervises `span` people, up to a single top manager. */
export function managersNeeded(operatives: number, span: number): number {
  let managers = 0;
  let level = operatives;
  while (level > 1) {
    level = Math.ceil(level / span);
    managers += level;
  }
  return managers;
}
export const hierarchyLevels = (operatives: number, span: number): number => Math.ceil(Math.log(operatives) / Math.log(span) - 1e-9);

export const totalForce = (scores: number[]): number => scores.reduce((s, x) => s + x, 0);
export const netForce = (driving: number[], restraining: number[]): number => totalForce(driving) - totalForce(restraining);

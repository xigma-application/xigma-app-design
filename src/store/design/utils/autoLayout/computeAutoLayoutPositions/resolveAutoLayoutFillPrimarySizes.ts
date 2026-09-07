// utils
import { clampAutoLayoutSize } from '../clampAutoLayoutSize';

export type TAutoLayoutFillPrimaryCandidate = { id: string; max?: number; min?: number };

const isViolator = (share: number, candidate: TAutoLayoutFillPrimaryCandidate): boolean =>
  (candidate.max !== undefined && share > candidate.max) || (candidate.min !== undefined && share < candidate.min);

export const resolveAutoLayoutFillPrimarySizes = (
  leftover: number,
  candidates: TAutoLayoutFillPrimaryCandidate[],
): Record<string, number> => {
  const resolved: Record<string, number> = {};
  let unfrozen = candidates;
  let remaining = leftover;

  while (unfrozen.length > 0) {
    const share = remaining / unfrozen.length;
    const violators = unfrozen.filter((candidate) => isViolator(share, candidate));

    if (violators.length === 0) {
      unfrozen.forEach((candidate) => {
        resolved[candidate.id] = Math.max(share, 0);
      });
      break;
    }

    violators.forEach((candidate) => {
      const value = clampAutoLayoutSize(share, candidate.min, candidate.max);
      resolved[candidate.id] = value;
      remaining -= value;
    });
    unfrozen = unfrozen.filter((candidate) => !violators.includes(candidate));
  }

  return resolved;
};

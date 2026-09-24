import { isEqual } from 'lodash';

// types
import { TEffect } from 'types/design/types';

// utils
import { getEffectComparable } from './getEffectComparable';

export const getMixedEffectKeys = (effects: TEffect[]): Set<keyof TEffect> => {
  const comparables = effects.map(getEffectComparable);
  const keys = new Set(comparables.flatMap((comparable) => Object.keys(comparable) as (keyof TEffect)[]));

  return new Set([...keys].filter((key) => comparables.some((comparable) => !isEqual(comparable[key], comparables[0][key]))));
};

import { isEqual } from 'lodash';

// types
import { TLayoutGuide } from 'types/design/types';

// utils
import { getLayoutGuideComparable } from './getLayoutGuideComparable';

export const getMixedLayoutGuideKeys = (guides: TLayoutGuide[]): Set<keyof TLayoutGuide> => {
  const comparables = guides.map(getLayoutGuideComparable);
  const keys = new Set(comparables.flatMap((comparable) => Object.keys(comparable) as (keyof TLayoutGuide)[]));

  return new Set([...keys].filter((key) => comparables.some((comparable) => !isEqual(comparable[key], comparables[0][key]))));
};

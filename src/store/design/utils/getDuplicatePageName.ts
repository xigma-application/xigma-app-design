// types
import { TDesignPage } from '../types';

export const getDuplicatePageName = (pages: Record<string, TDesignPage>, sourceName: string): string => {
  const takenNames = new Set(Object.values(pages).map((page) => page.name));
  const base = `${sourceName} copy`;

  if (takenNames.has(base)) {
    let suffix = 2;

    while (takenNames.has(`${base} ${suffix}`)) {
      suffix += 1;
    }

    return `${base} ${suffix}`;
  }

  return base;
};

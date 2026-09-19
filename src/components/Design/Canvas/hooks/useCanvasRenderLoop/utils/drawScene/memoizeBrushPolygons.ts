// types
import { TPoint } from 'types/canvas';

const MAX_ENTRIES = 6;
const cache = new Map<string, TPoint[][] | null>();

const evictOldestEntries = (): void => {
  if (cache.size > MAX_ENTRIES) {
    cache.delete(cache.keys().next().value as string);
  }
};

const storePolygons = (key: string, value: TPoint[][] | null): void => {
  cache.set(key, value);
  evictOldestEntries();
};

export const memoizeBrushPolygons = (key: string, compute: () => TPoint[][] | null): TPoint[][] | null => {
  switch (cache.has(key)) {
    case true:
      return cache.get(key) ?? null;
    default: {
      const value = compute();
      storePolygons(key, value);

      return value;
    }
  }
};

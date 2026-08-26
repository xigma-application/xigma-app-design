// utils
import { buildKey } from './buildKey';
import { isStale } from './isStale';

// types
import { TCacheEntry, TClusterResultCache } from './types';

export const createClusterResultCache = <T>(maxEntries: number): TClusterResultCache<T> => {
  const store = new Map<string, TCacheEntry<T>>();

  return {
    get: (nodeId, cluster, extraKey, planar, compute): T => {
      const key = buildKey(nodeId, cluster, extraKey);
      const cached = store.get(key);

      if (cached && !isStale(cached, cluster, planar)) {
        store.delete(key);
        store.set(key, cached);

        return cached.result;
      }

      const result = compute();

      store.set(key, {
        result,
        segments: new Map(cluster.segmentIds.map((id) => [id, planar.segments[id]])),
        vertices: new Map(cluster.vertexIds.map((id) => [id, planar.vertices[id]])),
      });

      if (store.size > maxEntries) {
        const oldestKey = store.keys().next().value;

        /* v8 ignore if -- @preserve unreachable: store.size > maxEntries (>= 0) guarantees a first key */
        if (oldestKey !== undefined) {
          store.delete(oldestKey);
        }
      }

      return result;
    },
  };
};

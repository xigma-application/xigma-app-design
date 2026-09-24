// types
import { TVectorNode } from 'types/design/types';

const cache = new WeakMap<TVectorNode, TVectorNode>();

export const getBooleanOutline = (vector: TVectorNode): TVectorNode => {
  const cached = cache.get(vector);

  if (!cached) {
    const outline: TVectorNode = { ...vector, filledFaceKeys: [] };

    cache.set(vector, outline);
    return outline;
  }

  return cached;
};

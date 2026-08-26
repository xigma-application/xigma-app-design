// types
import { TVectorNode } from 'types/design/types';
import { TPlanarVectorNetwork } from './planarizeVectorNetwork/types';

// utils
import { planarizeVectorNetwork } from './planarizeVectorNetwork/planarizeVectorNetwork';

const cache = new WeakMap<TVectorNode, TPlanarVectorNetwork>();

export const getPlanarVectorNetwork = (node: TVectorNode): TPlanarVectorNetwork => {
  const cached = cache.get(node);

  if (!cached) {
    const planar = planarizeVectorNetwork(node.segments, node.vertices);
    cache.set(node, planar);

    return planar;
  }

  return cached;
};

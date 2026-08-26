// types
import { TVectorNode } from 'types/design/types';
import { TPlanarVectorNetwork } from './planarizeVectorNetwork/types';

// utils
import { planarizeVectorNetwork } from './planarizeVectorNetwork/planarizeVectorNetwork';

const cache = new WeakMap<TVectorNode, TPlanarVectorNetwork>();

// planarizeVectorNetwork's own crossing search is the most expensive step in deriving a node's faces
// (planarizeVectorNetwork/findAllNetworkCrossings.ts). deriveVectorFaces.ts and getVectorFillLoopPoints.ts
// both need the same node's planar network, often within the same frame/pointer event — this shared,
// node-identity-keyed cache is what lets the second caller reuse the first's result instead of
// re-running the whole crossing search from scratch.
export const getPlanarVectorNetwork = (node: TVectorNode): TPlanarVectorNetwork => {
  const cached = cache.get(node);

  if (!cached) {
    const planar = planarizeVectorNetwork(Object.values(node.segments), node.vertices);

    cache.set(node, planar);

    return planar;
  }

  return cached;
};

// types
import { TVectorNode } from 'types/design/types';
import { TPlanarVectorNetwork } from './planarizeVectorNetwork/types';

// utils
import { planarizeVectorNetwork } from './planarizeVectorNetwork/planarizeVectorNetwork';

// Keyed on `segments`/`vertices` themselves, not the whole `node` — an edit that touches some
// other field (fillColor, strokeWidth, name, ...) still produces a new `node` object via Immer,
// but leaves `segments`/`vertices` as the exact same references, so this stays a hit instead of
// re-running crossing detection for a change that couldn't possibly have moved anything.
const cache = new WeakMap<TVectorNode['segments'], WeakMap<TVectorNode['vertices'], TPlanarVectorNetwork>>();

export const getPlanarVectorNetwork = (node: TVectorNode): TPlanarVectorNetwork => {
  const byVertices = cache.get(node.segments) ?? new WeakMap<TVectorNode['vertices'], TPlanarVectorNetwork>();
  const cached = byVertices.get(node.vertices);

  if (cached) {
    return cached;
  }

  const planar = planarizeVectorNetwork(node.segments, node.vertices);

  byVertices.set(node.vertices, planar);
  cache.set(node.segments, byVertices);

  return planar;
};

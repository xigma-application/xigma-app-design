// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRoundedVectorFillData } from './getRoundedVectorFillData';
import { roundVectorNetworkCorners } from './roundVectorNetworkCorners';

const cache = new WeakMap<TVectorNode, TVectorNode>();

const computeRoundedVectorNode = (node: TVectorNode, radius: number): TVectorNode => {
  const network = roundVectorNetworkCorners(node, radius);
  return network ? { ...node, ...network, ...getRoundedVectorFillData(node, network), cornerRadius: undefined } : node;
};

export const getRoundedVectorNode = (node: TVectorNode): TVectorNode => {
  const radius = node.cornerRadius ?? 0;

  if (radius > 0) {
    const cached = cache.get(node) ?? computeRoundedVectorNode(node, radius);

    cache.set(node, cached);
    return cached;
  }

  return node;
};

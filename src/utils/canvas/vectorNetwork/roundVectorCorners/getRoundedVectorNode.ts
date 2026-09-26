// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRoundedVectorFillData } from './getRoundedVectorFillData';
import { hasVectorCornerRadius } from './hasVectorCornerRadius';
import { roundVectorNetworkCorners } from './roundVectorNetworkCorners';

const cache = new WeakMap<TVectorNode, TVectorNode>();

const computeRoundedVectorNode = (node: TVectorNode): TVectorNode => {
  const network = roundVectorNetworkCorners(node);
  return network
    ? { ...node, ...network, ...getRoundedVectorFillData(node, network), cornerRadius: undefined, cornerRadiusByVertexId: undefined }
    : node;
};

export const getRoundedVectorNode = (node: TVectorNode): TVectorNode => {
  if (hasVectorCornerRadius(node)) {
    const cached = cache.get(node) ?? computeRoundedVectorNode(node);

    cache.set(node, cached);
    return cached;
  }

  return node;
};

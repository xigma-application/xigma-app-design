// types
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorChainArcLengthTable, type TVectorChainArcLengthSample } from '../../../vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder, type TVectorChainOrder } from '../../../vectorNetwork/getVectorChainOrder/getVectorChainOrder';

export type TChainSampleData = {
  chainOrder: TVectorChainOrder;
  rendered: TVectorNode;
  table: TVectorChainArcLengthSample[];
};

const cache = new WeakMap<TVectorNode, TChainSampleData | null>();

export const getChainSampleData = (vectorNode: TVectorNode): TChainSampleData | null => {
  const cached = cache.get(vectorNode);

  if (!cached) {
    const rendered = vectorNode;
    const chainOrder = getVectorChainOrder(rendered);
    const data = chainOrder ? { chainOrder, rendered, table: getVectorChainArcLengthTable(rendered, chainOrder) } : null;
    cache.set(vectorNode, data);

    return data;
  }

  return cached;
};

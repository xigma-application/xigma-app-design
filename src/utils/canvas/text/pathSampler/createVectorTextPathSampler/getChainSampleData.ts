// types
import { TVectorNode } from 'types/design/types';

// utils
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorChainArcLengthTable, type TVectorChainArcLengthSample } from '../../../vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder, type TVectorChainOrder } from '../../../vectorNetwork/getVectorChainOrder';

export type TChainSampleData = {
  chainOrder: TVectorChainOrder;
  rendered: TVectorNode;
  table: TVectorChainArcLengthSample[];
};

const cache = new WeakMap<TVectorNode, TChainSampleData | null>();

export const getChainSampleData = (vectorNode: TVectorNode): TChainSampleData | null => {
  const cached = cache.get(vectorNode);

  if (cached !== undefined) {
    return cached;
  }

  const rendered = getRenderedVectorNode(vectorNode);
  const chainOrder = getVectorChainOrder(rendered);
  const data = chainOrder ? { chainOrder, rendered, table: getVectorChainArcLengthTable(rendered, chainOrder) } : null;

  cache.set(vectorNode, data);

  return data;
};

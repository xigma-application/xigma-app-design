// types
import { TVectorNode } from 'types/design/types';

// utils
import { getIsChainReadingReversed } from './getIsChainReadingReversed';
import { getRenderedVectorNode } from 'components/Design/Canvas/utils/getRenderedVectorNode';
import { getVectorChainArcLengthTable, type TVectorChainArcLengthSample } from '../../../vectorNetwork/getVectorChainArcLengthTable';
import { getVectorChainOrder, type TVectorChainOrder } from '../../../vectorNetwork/getVectorChainOrder/getVectorChainOrder';
import { walkVectorChainFrom } from '../../../vectorNetwork/getVectorChainOrder/walkVectorChainFrom';

export type TChainSampleData = {
  chainOrder: TVectorChainOrder;
  rendered: TVectorNode;
  table: TVectorChainArcLengthSample[];
};

const cache = new WeakMap<TVectorNode, TChainSampleData | null>();

const getChainEndVertexId = (rendered: TVectorNode, chainOrder: TVectorChainOrder): string => {
  const lastEntry = chainOrder.entries[chainOrder.entries.length - 1];
  const segment = rendered.segments[lastEntry.segmentId];

  return lastEntry.reversed ? segment.startId : segment.endId;
};

export const getChainSampleData = (vectorNode: TVectorNode): TChainSampleData | null => {
  const cached = cache.get(vectorNode);

  if (cached !== undefined) {
    return cached;
  }

  const rendered = getRenderedVectorNode(vectorNode);
  const chainOrder = getVectorChainOrder(rendered);
  let data: TChainSampleData | null = null;

  if (chainOrder) {
    const table = getVectorChainArcLengthTable(rendered, chainOrder);

    if (getIsChainReadingReversed(rendered, chainOrder.isClosed, table)) {
      const reversedChainOrder: TVectorChainOrder = {
        entries: walkVectorChainFrom(rendered, getChainEndVertexId(rendered, chainOrder)),
        isClosed: chainOrder.isClosed,
      };

      data = { chainOrder: reversedChainOrder, rendered, table: getVectorChainArcLengthTable(rendered, reversedChainOrder) };
    } else {
      data = { chainOrder, rendered, table };
    }
  }

  cache.set(vectorNode, data);

  return data;
};

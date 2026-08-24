// types
import { TVectorNode } from 'types/design/types';
import { TVectorChainOrder } from './getVectorChainOrder';

// utils
import { getVectorChainArcLengthTable } from './getVectorChainArcLengthTable';

export type TVectorChainPosition = { segmentId: string; t: number };

export const getVectorChainPositionAtFraction = (
  node: TVectorNode,
  chainOrder: TVectorChainOrder,
  fraction: number,
): TVectorChainPosition => {
  const table = getVectorChainArcLengthTable(node, chainOrder);
  const totalLength = table[table.length - 1].length;
  const targetLength = fraction * totalLength;
  const upperIndex = Math.max(
    table.findIndex((sample) => sample.length >= targetLength),
    1,
  );
  const upper = table[upperIndex];
  const lower = table[upperIndex - 1];

  if (lower.segmentId !== upper.segmentId) {
    return { segmentId: upper.segmentId, t: upper.t };
  }

  const span = upper.length - lower.length;
  const ratio = span === 0 ? 0 : (targetLength - lower.length) / span;

  return { segmentId: upper.segmentId, t: lower.t + (upper.t - lower.t) * ratio };
};

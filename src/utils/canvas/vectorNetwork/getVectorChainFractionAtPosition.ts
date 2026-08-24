// types
import { TVectorNode } from 'types/design/types';
import { TVectorChainOrder } from './getVectorChainOrder';

// utils
import { getVectorChainArcLengthTable } from './getVectorChainArcLengthTable';

export const getVectorChainFractionAtPosition = (
  node: TVectorNode,
  chainOrder: TVectorChainOrder,
  segmentId: string,
  t: number,
): number => {
  const table = getVectorChainArcLengthTable(node, chainOrder, { [segmentId]: [t] });
  const totalLength = table[table.length - 1].length;

  if (totalLength !== 0) {
    const exactSample = table.find((sample) => sample.segmentId === segmentId && sample.t === t)!;
    return exactSample.length / totalLength;
  }

  return 0;
};

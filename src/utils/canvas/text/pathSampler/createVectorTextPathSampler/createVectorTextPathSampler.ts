// types
import { TTextPathBox, TTextPathSampler } from '../types';
import { TVectorNode } from 'types/design/types';

// utils
import { getChainSampleData, type TChainSampleData } from './getChainSampleData';
import { getNearestVectorChainOffset } from '../../../vectorNetwork/getNearestVectorChainOffset';
import { sampleVectorChainAtLength } from './sampleVectorChainAtLength';

const getChainCornerLengths = ({ chainOrder, table }: TChainSampleData): number[] => {
  const corners = table.slice(1).flatMap((sample, index) => (sample.segmentId === table[index].segmentId ? [] : [table[index].length]));
  return chainOrder.isClosed ? [0, ...corners] : corners;
};

export const createVectorTextPathSampler = (box: TTextPathBox, vectorNode: TVectorNode): TTextPathSampler => {
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const data = getChainSampleData(vectorNode);

  if (!data) {
    return {
      cornerLengths: [],
      isClosed: false,
      nearestOffsetAtPoint: () => ({ distance: Infinity, offset: 0, point: center }),
      sampleAtLength: () => ({ angleDegrees: 0, x: 0, y: 0 }),
      totalLength: 0,
    };
  }

  const { chainOrder, rendered, table } = data;

  return {
    cornerLengths: getChainCornerLengths(data),
    isClosed: chainOrder.isClosed,
    nearestOffsetAtPoint: (worldPoint) => getNearestVectorChainOffset(rendered, table, worldPoint),
    sampleAtLength: (length) => sampleVectorChainAtLength(center, data, length),
    totalLength: table[table.length - 1].length,
  };
};

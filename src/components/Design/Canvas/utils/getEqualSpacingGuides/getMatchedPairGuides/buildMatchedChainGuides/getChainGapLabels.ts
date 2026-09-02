// types
import { TChainGeometry } from './types';
import { TDistanceGuideLabel, TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from '../walkMatchedChain/types';

// utils
import { getLabel } from '../../../getDistanceGuides/getLabel';

export const getChainGapLabels = (
  chain: TEdges[],
  geometry: TChainGeometry,
  axis: TMatchedChainAxis,
  gapEqualToleranceWorldUnits: number,
): TDistanceGuideLabel[] => {
  const vertical = axis === 'vertical';
  const { activeCross, gaps } = geometry;
  const labels: TDistanceGuideLabel[] = [];

  gaps.forEach((gap, i) => {
    const matchesNeighbour =
      (i > 0 && Math.abs(gap - gaps[i - 1]) <= gapEqualToleranceWorldUnits) ||
      (i < gaps.length - 1 && Math.abs(gap - gaps[i + 1]) <= gapEqualToleranceWorldUnits);

    if (matchesNeighbour) {
      const start = vertical ? chain[i].bottom : chain[i].right;
      const end = vertical ? chain[i + 1].top : chain[i + 1].left;
      const [x1, y1, x2, y2] = vertical ? [activeCross, start, activeCross, end] : [start, activeCross, end, activeCross];

      labels.push(getLabel(x1, y1, x2, y2, vertical ? { x: 1, y: 0 } : { x: 0, y: 1 }, gap));
    }
  });

  return labels;
};

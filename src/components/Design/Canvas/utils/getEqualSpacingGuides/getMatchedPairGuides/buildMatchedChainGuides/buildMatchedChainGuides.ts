// types
import { TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from '../walkMatchedChain/types';
import { TMatchedPairGuides } from '../../types';

// utils
import { getChainGapLabels } from './getChainGapLabels';
import { getChainGeometry } from './getChainGeometry';
import { getChainGuideLines } from './getChainGuideLines';
import { getChainMarkers } from './getChainMarkers';

export const buildMatchedChainGuides = (
  active: TEdges,
  chain: TEdges[],
  axis: TMatchedChainAxis,
  gapEqualToleranceWorldUnits: number,
): TMatchedPairGuides => {
  const geometry = getChainGeometry(active, chain, axis);

  return {
    labels: getChainGapLabels(chain, geometry, axis, gapEqualToleranceWorldUnits),
    lines: getChainGuideLines(active, geometry, axis),
    markers: getChainMarkers(chain, geometry, axis),
  };
};

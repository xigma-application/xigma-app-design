// types
import { TChainGeometry } from './types';
import { TDistanceGuideLine, TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from '../walkMatchedChain/types';

export const getChainGuideLines = (active: TEdges, geometry: TChainGeometry, axis: TMatchedChainAxis): TDistanceGuideLine[] => {
  const { activeCross, spanFar, spanNear } = geometry;

  return axis === 'vertical'
    ? [
        { dashed: false, x1: activeCross, x2: activeCross, y1: spanNear, y2: spanFar },
        { dashed: false, x1: active.left, x2: active.left, y1: spanNear, y2: spanFar },
        { dashed: false, x1: active.right, x2: active.right, y1: spanNear, y2: spanFar },
      ]
    : [
        { dashed: false, x1: spanNear, x2: spanFar, y1: activeCross, y2: activeCross },
        { dashed: false, x1: spanNear, x2: spanFar, y1: active.top, y2: active.top },
        { dashed: false, x1: spanNear, x2: spanFar, y1: active.bottom, y2: active.bottom },
      ];
};

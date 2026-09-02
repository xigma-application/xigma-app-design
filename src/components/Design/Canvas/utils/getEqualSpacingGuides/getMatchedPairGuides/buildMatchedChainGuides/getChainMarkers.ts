// types
import { TChainGeometry } from './types';
import { TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from '../walkMatchedChain/types';
import { TPoint } from 'types/canvas';

export const getChainMarkers = (chain: TEdges[], geometry: TChainGeometry, axis: TMatchedChainAxis): TPoint[] => {
  const vertical = axis === 'vertical';
  const { activeCross, spanFar, spanNear } = geometry;

  const markers = chain.flatMap((edges) => [
    { x: edges.left, y: edges.top },
    { x: edges.left, y: edges.bottom },
    { x: edges.right, y: edges.top },
    { x: edges.right, y: edges.bottom },
  ]);

  markers.push(
    vertical ? { x: activeCross, y: spanNear } : { x: spanNear, y: activeCross },
    vertical ? { x: activeCross, y: spanFar } : { x: spanFar, y: activeCross },
  );

  return markers;
};

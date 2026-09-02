// types
import { TChainGeometry } from './types';
import { TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from '../walkMatchedChain/types';
import { TPoint } from 'types/canvas';

export const getChainMarkers = (chain: TEdges[], geometry: TChainGeometry, axis: TMatchedChainAxis): TPoint[] => {
  const vertical = axis === 'vertical';
  const { activeCentre, activeCross, centreLineFar } = geometry;

  const markers = chain.flatMap((edges) => [
    { x: edges.left, y: edges.top },
    { x: edges.left, y: edges.bottom },
    { x: edges.right, y: edges.top },
    { x: edges.right, y: edges.bottom },
  ]);

  markers.push(
    vertical ? { x: activeCross, y: activeCentre } : { x: activeCentre, y: activeCross },
    vertical ? { x: activeCross, y: centreLineFar } : { x: centreLineFar, y: activeCross },
  );

  return markers;
};

// types
import { TChainGeometry } from './types';
import { TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from '../walkMatchedChain/types';

export const getChainGeometry = (active: TEdges, chain: TEdges[], axis: TMatchedChainAxis): TChainGeometry => {
  const vertical = axis === 'vertical';
  const activeCross = vertical ? (active.left + active.right) / 2 : (active.top + active.bottom) / 2;
  const spanNear = vertical ? chain[0].top : chain[0].left;
  const spanFar = vertical ? chain[chain.length - 1].bottom : chain[chain.length - 1].right;
  const gaps = chain.slice(0, -1).map((edges, i) => (vertical ? chain[i + 1].top - edges.bottom : chain[i + 1].left - edges.right));

  return { activeCross, gaps, spanFar, spanNear };
};

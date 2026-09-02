// types
import { TEdges } from '../../../getDistanceGuides/types';
import { TMatchedChainAxis } from './types';

export type TAxisEdges = {
  breadth: number;
  centre: number;
  far: number;
  length: number;
  near: number;
};

export const getAxisEdges = (edges: TEdges, axis: TMatchedChainAxis): TAxisEdges => {
  const vertical = axis === 'vertical';
  const near = vertical ? edges.top : edges.left;
  const far = vertical ? edges.bottom : edges.right;

  return {
    breadth: vertical ? edges.right - edges.left : edges.bottom - edges.top,
    centre: vertical ? (edges.left + edges.right) / 2 : (edges.top + edges.bottom) / 2,
    far,
    length: far - near,
    near,
  };
};

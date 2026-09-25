// types
import { TLineStrokeShape } from 'utils/canvas/line/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getSimpleVectorChain } from 'utils/canvas/vectorNetwork/getSimpleVectorChain/getSimpleVectorChain';
import { getVectorModeStrokePolygons } from './getVectorModeStrokePolygons';

const cache = new WeakMap<TVectorNode, TLineStrokeShape | null>();

const computeVectorStrokeShape = (node: TVectorNode): TLineStrokeShape | null => {
  const chain = node.strokeMode || node.strokeStyle || node.strokeProfile ? getSimpleVectorChain(node) : null;

  if (chain?.closed && node.strokeWidth > 0) {
    const polygons = getVectorModeStrokePolygons(node, chain.points);
    return polygons ? { fillRule: 'evenOdd', polygons } : null;
  }

  return null;
};

export const getVectorStrokeShape = (node: TVectorNode): TLineStrokeShape | null => {
  if (!cache.has(node)) {
    cache.set(node, computeVectorStrokeShape(node));
  }

  return cache.get(node) ?? null;
};

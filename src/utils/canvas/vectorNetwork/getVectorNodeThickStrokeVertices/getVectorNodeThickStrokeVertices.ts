// types
import { TVectorNode } from 'types/design/types';

// utils
import { getClustersForStroke } from './getClustersForStroke';
import { getNodeStrokeVertices } from './getNodeStrokeVertices';
import { getPlanarVectorNetwork } from '../getPlanarVectorNetwork';

const wholeNodeCache = new WeakMap<TVectorNode, Map<number, number[]>>();

export const getVectorNodeThickStrokeVertices = (node: TVectorNode, halfWidth: number): number[] => {
  const nodeCache = wholeNodeCache.get(node) ?? new Map<number, number[]>();
  wholeNodeCache.set(node, nodeCache);
  const cachedForWidth = nodeCache.get(halfWidth);

  if (!cachedForWidth) {
    const planar = getPlanarVectorNetwork(node);
    const clusters = getClustersForStroke(node, planar);
    const rawNetwork = { segments: node.segments, vertices: node.vertices };
    const vertices = getNodeStrokeVertices(node, halfWidth, clusters, rawNetwork);

    nodeCache.set(halfWidth, vertices);

    return vertices;
  }

  return cachedForWidth;
};

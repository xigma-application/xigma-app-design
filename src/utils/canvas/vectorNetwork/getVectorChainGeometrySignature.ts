// types
import { TVectorNode } from 'types/design/types';

const cache = new WeakMap<TVectorNode, string>();

const formatTangent = (tangent: { x: number; y: number } | null): string => (tangent ? `${tangent.x},${tangent.y}` : '-');

export const getVectorChainGeometrySignature = (node: TVectorNode): string => {
  const cached = cache.get(node);

  if (cached !== undefined) {
    return cached;
  }

  const vertices = Object.values(node.vertices)
    .map((vertex) => `${vertex.id}:${vertex.x}:${vertex.y}`)
    .sort()
    .join('|');
  const segments = Object.values(node.segments)
    .map(
      (segment) =>
        `${segment.id}:${segment.startId}:${segment.endId}:${formatTangent(segment.tangentStart)}:${formatTangent(segment.tangentEnd)}`,
    )
    .sort()
    .join('|');
  const signature = `${node.rotation};${vertices};${segments}`;

  cache.set(node, signature);

  return signature;
};

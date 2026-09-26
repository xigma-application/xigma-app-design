// types
import { TVectorNode } from 'types/design/types';
import { TVectorPointGroup } from '../types';

export const getVectorPointGroups = (node: TVectorNode, vertexIds: string[]): TVectorPointGroup[] => {
  const neighbours = new Map<string, string[]>();
  const componentByVertex = new Map<string, number>();

  Object.values(node.segments).forEach(({ endId, startId }) => {
    neighbours.set(startId, [...(neighbours.get(startId) ?? []), endId]);
    neighbours.set(endId, [...(neighbours.get(endId) ?? []), startId]);
  });

  Object.keys(node.vertices).forEach((vertexId, component) => {
    const queue = componentByVertex.has(vertexId) ? [] : [vertexId];

    while (queue.length > 0) {
      const current = queue.pop()!;

      if (!componentByVertex.has(current)) {
        componentByVertex.set(current, component);
        queue.push(...(neighbours.get(current) ?? []));
      }
    }
  });

  const groups = new Map<number, string[]>();

  vertexIds.forEach((vertexId) => {
    const component = componentByVertex.get(vertexId)!;

    groups.set(component, [...(groups.get(component) ?? []), vertexId]);
  });

  return [...groups.values()].map((ids) => {
    const xs = ids.map((vertexId) => node.vertices[vertexId].x);
    const ys = ids.map((vertexId) => node.vertices[vertexId].y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);

    return { nodeId: node.id, rect: { height: Math.max(...ys) - y, width: Math.max(...xs) - x, x, y }, vertexIds: ids };
  });
};

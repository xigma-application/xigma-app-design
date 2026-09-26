// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getVectorHandleVertexId } from './getVectorHandleVertexId';

export const getVectorHandlePoint = (node: TVectorNode, handle: TVectorHandleHover): TPoint => {
  const vertex = node.vertices[getVectorHandleVertexId(node, handle)];
  const tangent = node.segments[handle.segmentId][handle.end === 'start' ? 'tangentStart' : 'tangentEnd']!;

  return { x: vertex.x + tangent.x, y: vertex.y + tangent.y };
};

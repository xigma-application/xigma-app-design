// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPenPointHoverContext, TPenPointHoverResult } from '../types';

// utils
import { getVectorVertexAtPoint } from '../../../../../../utils/getVectorVertexAtPoint';

export const resolveVertexPointHover = ({
  excludeVertexId,
  node,
  point,
  viewport,
}: TPenPointHoverContext): TPenPointHoverResult | undefined => {
  const vertexHover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom, excludeVertexId);

  if (vertexHover) {
    return { hoverKind: 'vertex', point: node.vertices[vertexHover.vertexId], segmentId: null };
  }
};

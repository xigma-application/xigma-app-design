// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { getVectorVertexAtPoint } from '../../../../utils/getVectorVertexAtPoint';

export const updateNewVertexPreview = (
  point: TPoint,
  node: TVectorNode | null,
  viewport: TViewport,
  penNewVertexPreviewRef: TCanvasRefs['penNewVertexPreviewRef'],
): boolean => {
  if (node) {
    const hover = getVectorVertexAtPoint(point, node, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);
    penNewVertexPreviewRef.current = hover ? node.vertices[hover.vertexId] : point;

    return hover !== null;
  }

  penNewVertexPreviewRef.current = point;
  return false;
};

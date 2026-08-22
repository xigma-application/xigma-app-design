// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';
import { TCrossNodeVertexHit, TEdgeHit, THoverHit } from './types';

// utils
import { getVectorEdgeAtPoint } from '../../../../../../utils/getVectorEdgeAtPoint';

export const getEdgeHit = (
  point: TPoint,
  node: TVectorNode,
  hover: THoverHit,
  crossNodeVertexHover: TCrossNodeVertexHit,
  viewport: TViewport,
): TEdgeHit =>
  hover || crossNodeVertexHover
    ? null
    : getVectorEdgeAtPoint(point, node, VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

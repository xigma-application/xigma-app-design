// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX, VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TCrossNodeEdgeHit, TCrossNodeVertexHit, TEdgeHit, THoverHit } from './types';

// utils
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorEdgeAtPointAcrossOpenNodes';

export const getCrossNodeEdgeHit = (
  point: TPoint,
  hover: THoverHit,
  crossNodeVertexHover: TCrossNodeVertexHit,
  edgeHit: TEdgeHit,
  otherOpenNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  viewport: TViewport,
): TCrossNodeEdgeHit =>
  hover || crossNodeVertexHover || edgeHit
    ? null
    : getVectorEdgeAtPointAcrossOpenNodes(
        point,
        otherOpenNodeIds,
        nodes,
        VECTOR_EDGE_HIT_TOLERANCE_PX / viewport.zoom,
        VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom,
      );

// others
import { VECTOR_VERTEX_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';
import { TCrossNodeVertexHit, THoverHit } from './types';

// utils
import { getVectorVertexAtPointAcrossOpenNodes } from '../../../../../../utils/getVectorVertexAtPointAcrossOpenNodes';

export const getCrossNodeVertexHover = (
  point: TPoint,
  hover: THoverHit,
  otherOpenNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  viewport: TViewport,
): TCrossNodeVertexHit =>
  hover ? null : getVectorVertexAtPointAcrossOpenNodes(point, otherOpenNodeIds, nodes, VECTOR_VERTEX_HIT_RADIUS_PX / viewport.zoom);

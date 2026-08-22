// others
import { VECTOR_EDGE_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { findVectorEditingNodeForVertex } from '../../../utils/findVectorEditingNodeForVertex';
import { getVectorEditingNode } from '../../../utils/getVectorEditingNode';
import { getVectorEdgeAtPointAcrossOpenNodes } from '../../../utils/getVectorEdgeAtPointAcrossOpenNodes';
import { getVectorVertexAtPointAcrossOpenNodes } from '../../../utils/getVectorVertexAtPointAcrossOpenNodes';

export const resolvePenTargetNode = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  penActiveVertexId: string | null,
  vertexTolerance: number,
  viewportZoom: number,
): TVectorNode | null => {
  const primaryNode = getVectorEditingNode(nodes, vectorEditingNodeIds[0] ?? null);

  if (penActiveVertexId) {
    return findVectorEditingNodeForVertex(vectorEditingNodeIds, nodes, penActiveVertexId) ?? primaryNode;
  }

  const vertexHit = getVectorVertexAtPointAcrossOpenNodes(point, vectorEditingNodeIds, nodes, vertexTolerance);

  if (vertexHit) {
    return vertexHit.node;
  }

  const edgeHit = getVectorEdgeAtPointAcrossOpenNodes(
    point,
    vectorEditingNodeIds,
    nodes,
    VECTOR_EDGE_HIT_TOLERANCE_PX / viewportZoom,
    vertexTolerance,
  );

  if (edgeHit) {
    return edgeHit.node;
  }

  return vectorEditingNodeIds.length > 1 ? null : primaryNode;
};

// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TSceneNode, TVectorNode } from 'types/design/types';

// utils
import { getEffectiveTangentEnd } from 'utils/canvas/vectorNetwork/getEffectiveTangentEnd';
import { getEffectiveTangentStart } from 'utils/canvas/vectorNetwork/getEffectiveTangentStart';
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVectorHandleAtPoint, TVectorHandleHit } from './getVectorHandleAtPoint';
import { getVectorHandlePosition } from 'utils/canvas/vectorNetwork/getVectorHandlePosition';
import { pickClosestVectorHitAcrossNodes } from './pickClosestVectorHitAcrossNodes';

export const getVectorHandleAtPointAcrossOpenNodes = (
  point: TPoint,
  vectorEditingNodeIds: string[],
  nodes: Record<string, TSceneNode>,
  tolerance: number,
  visualSelectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  selectedSegmentIds: string[],
): { hit: TVectorHandleHit; node: TVectorNode } | null => {
  const result = pickClosestVectorHitAcrossNodes(
    vectorEditingNodeIds,
    nodes,
    (bakedNode) => {
      const tangentVisibilityVertexIds = getTangentVisibilityVertexIds(bakedNode, visualSelectedVertexIds, selectedHandles);
      const oneHopVertexIds = getOneHopVectorVertexIds(bakedNode, tangentVisibilityVertexIds);

      return getVectorHandleAtPoint(
        point,
        bakedNode,
        tolerance,
        tangentVisibilityVertexIds,
        oneHopVertexIds,
        selectedHandles,
        selectedSegmentIds,
      );
    },
    (bakedNode, hit) => {
      const segment = bakedNode.segments[hit.segmentId];
      const handlePosition = (
        hit.end === 'start'
          ? getVectorHandlePosition(bakedNode.vertices[segment.startId], getEffectiveTangentStart(bakedNode.vertices, segment))
          : getVectorHandlePosition(bakedNode.vertices[segment.endId], getEffectiveTangentEnd(bakedNode.vertices, segment))
      ) as TPoint;

      return Math.hypot(point.x - handlePosition.x, point.y - handlePosition.y);
    },
  );

  return result
    ? { hit: { end: result.hit.end, segmentId: result.hit.segmentId, vertexId: result.hit.vertexId }, node: result.node }
    : null;
};

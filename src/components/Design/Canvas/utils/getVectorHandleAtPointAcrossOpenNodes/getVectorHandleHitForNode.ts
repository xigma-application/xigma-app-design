// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode } from 'types/design/types';

// utils
import { getOneHopVectorVertexIds } from 'utils/canvas/vectorNetwork/getOneHopVectorVertexIds/getOneHopVectorVertexIds';
import { getTangentVisibilityVertexIds } from 'utils/canvas/vectorNetwork/getTangentVisibilityVertexIds';
import { getVectorHandleAtPoint, TVectorHandleHit } from '../getVectorHandleAtPoint';

export const getVectorHandleHitForNode = (
  bakedNode: TVectorNode,
  point: TPoint,
  tolerance: number,
  visualSelectedVertexIds: string[],
  selectedHandles: TVectorHandleHover[],
  selectedSegmentIds: string[],
): TVectorHandleHit | null => {
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
};

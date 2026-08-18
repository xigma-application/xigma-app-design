// others
import { RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getStarVertexCountHandlePosition } from 'utils/canvas/vertexCount/star/getStarVertexCountHandlePosition';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { shouldShowVertexCountHandle } from 'utils/canvas/vertexCount/shouldShowVertexCountHandle';

export const getStarVertexCountHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; flipX: boolean; flipY: boolean; nodeId: string; rotation: number } | null => {
  const [node] = selectedNodes;
  const isStar = selectedNodes.length === 1 && node.type === NodeType.star;
  const bounds = isStar ? getNodeBounds(node) : null;

  if (isStar && bounds && shouldShowVertexCountHandle(bounds, viewport)) {
    const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
    const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
    const handlePosition = getStarVertexCountHandlePosition(
      bounds,
      node.points,
      node.ratio,
      node.cornerRadius ?? 0,
      node.flipX,
      node.flipY,
    );

    return Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y) <= tolerance
      ? { bounds, flipX: node.flipX, flipY: node.flipY, nodeId: node.id, rotation: node.rotation }
      : null;
  }

  return null;
};

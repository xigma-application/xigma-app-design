// others
import { RADIUS_HANDLE_HIT_RADIUS_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getStarRatioHandlePosition } from 'utils/canvas/ratio/star/getStarRatioHandlePosition';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { shouldShowVertexCountHandle } from 'utils/canvas/vertexCount/shouldShowVertexCountHandle';

export const getStarRatioHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; flipX: boolean; flipY: boolean; nodeId: string; points: number; rotation: number } | null => {
  const [node] = selectedNodes;
  const isStar = selectedNodes.length === 1 && node.type === NodeType.star;
  const bounds = isStar ? getNodeBounds(node) : null;

  if (isStar && bounds && shouldShowVertexCountHandle(bounds, viewport)) {
    const testPoint = getUnrotatedQueryPoint(point, bounds, node.rotation);
    const tolerance = RADIUS_HANDLE_HIT_RADIUS_PX / viewport.zoom;
    const handlePosition = getStarRatioHandlePosition(bounds, node.points, node.ratio, node.cornerRadius ?? 0, node.flipX, node.flipY);

    return Math.hypot(testPoint.x - handlePosition.x, testPoint.y - handlePosition.y) <= tolerance
      ? { bounds, flipX: node.flipX, flipY: node.flipY, nodeId: node.id, points: node.points, rotation: node.rotation }
      : null;
  }

  return null;
};

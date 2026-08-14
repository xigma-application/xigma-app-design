// others
import { CORNER_HANDLE_SIZE, RESIZE_EDGE_HIT_TOLERANCE_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TDraftRect, TPoint, TResizeHandle } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { getNodeBounds } from './getNodeBounds';
import { getSelectionBounds } from './getSelectionBounds';
import { getUnrotatedQueryPoint } from './getUnrotatedQueryPoint';
import { isGroupSelection } from './isGroupSelection';

const getHandleAtBounds = (point: TPoint, bounds: TDraftRect, viewport: TViewport): TResizeHandle | null => {
  const { height, width, x, y } = bounds;
  const corners: { handle: TResizeHandle; point: TPoint }[] = [
    { handle: 'nw', point: { x, y } },
    { handle: 'ne', point: { x: x + width, y } },
    { handle: 'se', point: { x: x + width, y: y + height } },
    { handle: 'sw', point: { x, y: y + height } },
  ];
  const cornerRadius = CORNER_HANDLE_SIZE / viewport.zoom;
  const corner = corners.find(({ point: cornerPoint }) => Math.hypot(point.x - cornerPoint.x, point.y - cornerPoint.y) <= cornerRadius);

  if (corner) {
    return corner.handle;
  }

  const edgeTolerance = RESIZE_EDGE_HIT_TOLERANCE_PX / viewport.zoom;
  const withinHorizontalSpan = point.x >= x && point.x <= x + width;
  const withinVerticalSpan = point.y >= y && point.y <= y + height;

  switch (true) {
    case withinHorizontalSpan && Math.abs(point.y - y) <= edgeTolerance:
      return 'n';
    case withinHorizontalSpan && Math.abs(point.y - (y + height)) <= edgeTolerance:
      return 's';
    case withinVerticalSpan && Math.abs(point.x - x) <= edgeTolerance:
      return 'w';
    case withinVerticalSpan && Math.abs(point.x - (x + width)) <= edgeTolerance:
      return 'e';
    default:
      return null;
  }
};

export const getResizeHandleAtPoint = (
  point: TPoint,
  selectedNodes: TSceneNode[],
  viewport: TViewport,
): { bounds: TDraftRect; handle: TResizeHandle; rotation: number } | null => {
  const [singleNode] = selectedNodes;

  if (selectedNodes.length === 1 && singleNode.type !== NodeType.line) {
    const bounds = getNodeBounds(singleNode);
    const testPoint = getUnrotatedQueryPoint(point, bounds, singleNode.rotation);
    const handle = getHandleAtBounds(testPoint, bounds, viewport);

    return handle ? { bounds, handle, rotation: singleNode.rotation } : null;
  }

  if (isGroupSelection(selectedNodes)) {
    const bounds = getSelectionBounds(selectedNodes);
    const handle = getHandleAtBounds(point, bounds, viewport);

    return handle ? { bounds, handle, rotation: 0 } : null;
  }

  return null;
};

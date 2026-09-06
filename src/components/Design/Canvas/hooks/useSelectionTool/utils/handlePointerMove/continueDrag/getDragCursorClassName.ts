// types
import { TAxisLock } from 'utils/math/axis/getAxisLockedPoint';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TDragState } from 'types/design/selectionTool/types';
import { TSceneNode } from 'types/design/types';

const AXIS_LOCK_CLASS_NAME = { x: 'move-x', y: 'move-y' } as const;
const STRICT_REORDER_CLASS_NAME = 'strict-mode';

export const getDragCursorClassName = (
  canvasRefs: TCanvasRefs,
  dragState: TDragState,
  selectedNodes: TSceneNode[],
  isReorderModifierHeld: boolean,
  axisLock: TAxisLock | null,
): string | null => {
  const isStrictReorderCursor =
    isReorderModifierHeld &&
    !dragState.reorderModeAbandoned &&
    canvasRefs.transform.autoLayoutDropTargetRef.current?.frameId === (selectedNodes[0]?.parentId ?? null);

  switch (true) {
    case isStrictReorderCursor:
      return STRICT_REORDER_CLASS_NAME;
    case Boolean(axisLock):
      return AXIS_LOCK_CLASS_NAME[axisLock as TAxisLock];
    default:
      return null;
  }
};

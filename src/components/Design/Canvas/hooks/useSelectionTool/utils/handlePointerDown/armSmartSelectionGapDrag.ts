import { RefObject } from 'react';

// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSmartSelectionGapDragState } from 'types/design/canvas/types';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';

// utils
import { getDragNodeOrigins } from './armDrag/getDragNodeOrigins';
import { getSmartSelectionCascadeGroups } from '../../../../utils/getSmartSelectionCascadeGroups';
import { getSubtreeNodeIds } from 'store/design/utils/nodeHierarchy/getSubtreeNodeIds';

export const armSmartSelectionGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gapDragRef: RefObject<TSmartSelectionGapDragState | null>,
  layout: TSmartSelectionLayout,
  axis: 'x' | 'y',
  gapIndex: number,
  originalGapValue: number,
  pointerStart: TPoint,
): void => {
  const nodes = selectNodes(store.getState());
  const { anchorPosition, anchorSize, cascadeGroups: layoutGroups } = getSmartSelectionCascadeGroups(layout, axis);
  const cascadeGroups = layoutGroups.map((group) => ({ ...group, nodeIds: getSubtreeNodeIds(group.nodeIds, nodes) }));
  const movingIds = cascadeGroups.flatMap((group) => group.nodeIds);

  gapDragRef.current = {
    anchorPosition,
    anchorSize,
    axis,
    badgeAnchor: pointerStart,
    cascadeGroups,
    currentGapValue: originalGapValue,
    dispatchThrottle: { frameId: null, run: null },
    gapIndex,
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(movingIds, nodes),
    originalGapValue,
    pointerStart,
  };
  canvas.setPointerCapture(event.pointerId);
};

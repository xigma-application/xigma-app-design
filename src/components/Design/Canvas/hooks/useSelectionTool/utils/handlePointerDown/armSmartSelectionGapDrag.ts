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

export const armSmartSelectionGapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  gapDragRef: RefObject<TSmartSelectionGapDragState | null>,
  layout: TSmartSelectionLayout,
  axis: 'x' | 'y',
  originalGapValue: number,
  midpoint: TPoint,
  pointerStart: TPoint,
): void => {
  const { anchorPosition, anchorSize, cascadeGroups } = getSmartSelectionCascadeGroups(layout, axis);
  const movingIds = cascadeGroups.flatMap((group) => group.nodeIds);

  gapDragRef.current = {
    anchorPosition,
    anchorSize,
    axis,
    badgeAnchor: midpoint,
    cascadeGroups,
    currentGapValue: originalGapValue,
    dispatchThrottle: { frameId: null, run: null },
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(movingIds, selectNodes(store.getState())),
    originalGapValue,
    pointerStart,
  };
  canvas.setPointerCapture(event.pointerId);
};

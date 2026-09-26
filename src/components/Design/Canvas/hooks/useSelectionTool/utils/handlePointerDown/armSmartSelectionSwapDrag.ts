import { RefObject } from 'react';

// store
import { selectNodes } from 'store/design/selectors';
import { store } from 'store';

// types
import { TPoint } from 'types/canvas';
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';

// utils
import { getDragNodeOrigins } from './armDrag/getDragNodeOrigins';
import { getSmartSelectionSwapSlots } from '../../../../utils/getSmartSelectionSwapSlots';
import { getSubtreeNodeIds } from 'store/design/utils/nodeHierarchy/getSubtreeNodeIds';

export const armSmartSelectionSwapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  swapDragRef: RefObject<TSmartSelectionSwapDragState | null>,
  layout: TSmartSelectionLayout,
  fromIndex: number,
  pointerStart: TPoint,
): void => {
  const nodes = selectNodes(store.getState());
  const slots = getSmartSelectionSwapSlots(layout).map((slot) => ({ bounds: slot.bounds, id: slot.id }));
  const slotNodeIds = Object.fromEntries(slots.flatMap(({ id }) => (id === null ? [] : [[id, getSubtreeNodeIds([id], nodes)]])));

  swapDragRef.current = {
    dispatchThrottle: { frameId: null, run: null },
    fromIndex,
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(Object.values(slotNodeIds).flat(), nodes),
    pointerStart,
    slotNodeIds,
    slots,
    targetIndex: fromIndex,
  };
  canvas.setPointerCapture(event.pointerId);
};

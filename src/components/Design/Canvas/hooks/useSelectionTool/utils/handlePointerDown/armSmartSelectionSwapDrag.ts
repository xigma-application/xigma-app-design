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

export const armSmartSelectionSwapDrag = (
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  swapDragRef: RefObject<TSmartSelectionSwapDragState | null>,
  layout: TSmartSelectionLayout,
  fromIndex: number,
  pointerStart: TPoint,
): void => {
  const slots = getSmartSelectionSwapSlots(layout).map((slot) => ({ bounds: slot.bounds, id: slot.id }));

  swapDragRef.current = {
    dispatchThrottle: { frameId: null, run: null },
    fromIndex,
    hasMoved: false,
    nodeOrigins: getDragNodeOrigins(
      slots.map((slot) => slot.id).filter((id): id is string => id !== null),
      selectNodes(store.getState()),
    ),
    pointerStart,
    slots,
    targetIndex: fromIndex,
  };
  canvas.setPointerCapture(event.pointerId);
};

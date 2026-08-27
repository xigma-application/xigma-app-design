// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { createShiftKeyPointerMoveEvent } from './createShiftKeyPointerMoveEvent';
import { shouldForwardShiftKeyChange } from './shouldForwardShiftKeyChange';

export const handleShiftKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  canvasRefs: TCanvasRefs,
  selectRefs: TSelectionToolRefs,
  lastPointerClientPosition: TPoint | null,
  onPointerMove: (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs) => void,
): void => {
  if (shouldForwardShiftKeyChange(event, selectRefs, lastPointerClientPosition)) {
    onPointerMove(canvas, createShiftKeyPointerMoveEvent(lastPointerClientPosition, event), canvasRefs, selectRefs);
  }
};

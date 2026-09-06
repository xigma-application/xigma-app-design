// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { createModifierKeyPointerMoveEvent } from './createModifierKeyPointerMoveEvent';
import { shouldForwardModifierKeyChange } from './shouldForwardModifierKeyChange';

export const handleModifierKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  canvasRefs: TCanvasRefs,
  selectRefs: TSelectionToolRefs,
  lastPointerClientPosition: TPoint | null,
  onPointerMove: (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs) => void,
): void => {
  if (shouldForwardModifierKeyChange(event, selectRefs, lastPointerClientPosition)) {
    onPointerMove(canvas, createModifierKeyPointerMoveEvent(lastPointerClientPosition, event), canvasRefs, selectRefs);
  }
};

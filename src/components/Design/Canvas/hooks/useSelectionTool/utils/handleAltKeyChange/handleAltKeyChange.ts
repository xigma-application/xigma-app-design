// types
import { ToolName } from 'types/design/enums';
import { TCanvasRefs } from 'types/design/canvas/types';
import { TPoint } from 'types/canvas';
import { TSelectionToolRefs } from 'types/design/selectionTool/types';

// utils
import { createAltKeyPointerMoveEvent } from './createAltKeyPointerMoveEvent';
import { shouldForwardAltKeyChange } from './shouldForwardAltKeyChange';

export const handleAltKeyChange = (
  canvas: HTMLCanvasElement,
  event: KeyboardEvent,
  canvasRefs: TCanvasRefs,
  selectRefs: TSelectionToolRefs,
  activeTool: ToolName,
  lastPointerClientPosition: TPoint | null,
  onPointerMove: (canvas: HTMLCanvasElement, event: PointerEvent, canvasRefs: TCanvasRefs, selectRefs: TSelectionToolRefs) => void,
): void => {
  if (shouldForwardAltKeyChange(event, activeTool, lastPointerClientPosition)) {
    onPointerMove(canvas, createAltKeyPointerMoveEvent(lastPointerClientPosition, event), canvasRefs, selectRefs);
  }
};

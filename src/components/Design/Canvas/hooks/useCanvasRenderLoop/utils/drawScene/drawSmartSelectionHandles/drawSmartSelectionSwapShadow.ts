// others
import { SMART_SELECTION_SWAP_SHADOW_STROKE } from 'constant/canvas';

// types
import { TSmartSelectionSwapDragState } from 'types/design/canvas/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawSmartSelectionSwapShadow = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  dragState: TSmartSelectionSwapDragState,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const targetSlot = dragState.slots[dragState.targetIndex].bounds;
  const draggedSize = dragState.slots[dragState.fromIndex].bounds;

  drawRect(
    gl,
    program,
    buffer,
    { height: draggedSize.height, stroke: SMART_SELECTION_SWAP_SHADOW_STROKE, width: draggedSize.width, x: targetSlot.x, y: targetSlot.y },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};

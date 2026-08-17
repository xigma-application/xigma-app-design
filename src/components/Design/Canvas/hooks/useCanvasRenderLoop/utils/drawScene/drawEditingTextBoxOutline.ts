// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';

// types
import { TEditingTextBox } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawEditingTextBoxOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingTextBox: TEditingTextBox,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (!editingTextBox.pathId) {
    drawRect(
      gl,
      program,
      buffer,
      { ...editingTextBox, stroke: DRAFT_FRAME_STROKE },
      canvasWidth,
      canvasHeight,
      viewport,
      editingTextBox.rotation,
    );
  }
};

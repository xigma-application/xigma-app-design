// types
import { TEditingTextBox } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawStraightCaret } from './drawStraightCaret';
import { drawStraightSelectionHighlight } from './drawStraightSelectionHighlight';
import { isCaretBlinkedOn } from './isCaretBlinkedOn';

export const drawStraightEditingCaretAndSelection = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingTextBox: TEditingTextBox,
  editingTextContent: string,
  selectionStart: number,
  selectionEnd: number,
  selectionChangedAt: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (selectionStart !== selectionEnd) {
    drawStraightSelectionHighlight(
      gl,
      program,
      buffer,
      editingTextBox,
      editingTextContent,
      selectionStart,
      selectionEnd,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  } else if (isCaretBlinkedOn(selectionChangedAt)) {
    drawStraightCaret(gl, program, buffer, editingTextBox, editingTextContent, selectionEnd, canvasWidth, canvasHeight, viewport);
  }
};

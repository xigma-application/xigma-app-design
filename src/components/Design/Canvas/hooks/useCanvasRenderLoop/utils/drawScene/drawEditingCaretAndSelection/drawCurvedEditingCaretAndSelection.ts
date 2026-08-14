// types
import { TEditingTextBox } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawCurvedCaret } from './drawCurvedCaret';
import { drawCurvedSelectionHighlight } from './drawCurvedSelectionHighlight';
import { isCaretBlinkedOn } from './isCaretBlinkedOn';

export const drawCurvedEditingCaretAndSelection = (
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
    drawCurvedSelectionHighlight(
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
    drawCurvedCaret(gl, program, buffer, editingTextBox, editingTextContent, selectionEnd, canvasWidth, canvasHeight, viewport);
  }
};

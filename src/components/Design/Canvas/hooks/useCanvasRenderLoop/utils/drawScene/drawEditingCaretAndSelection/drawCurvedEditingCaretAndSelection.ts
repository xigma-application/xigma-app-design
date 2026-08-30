// types
import { TEditingTextBox } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCurvedCaret } from './drawCurvedCaret';
import { drawCurvedEditingOutline } from './drawCurvedEditingOutline';
import { drawCurvedSelectionHighlight } from './drawCurvedSelectionHighlight/drawCurvedSelectionHighlight';
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
  pathNode?: TSceneNode,
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
      pathNode,
    );
  } else {
    drawCurvedEditingOutline(gl, program, buffer, editingTextBox, editingTextContent, canvasWidth, canvasHeight, viewport, pathNode);

    if (isCaretBlinkedOn(selectionChangedAt)) {
      drawCurvedCaret(gl, program, buffer, editingTextBox, editingTextContent, selectionEnd, canvasWidth, canvasHeight, viewport, pathNode);
    }
  }
};

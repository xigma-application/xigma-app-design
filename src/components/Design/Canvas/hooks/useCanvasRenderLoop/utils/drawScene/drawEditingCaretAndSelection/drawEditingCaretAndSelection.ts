// types
import { TEditingTextBox } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCurvedEditingCaretAndSelection } from './drawCurvedEditingCaretAndSelection';
import { drawStraightEditingCaretAndSelection } from './drawStraightEditingCaretAndSelection';

export const drawEditingCaretAndSelection = (
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
  editingPathNode?: TSceneNode,
): void => {
  if (editingTextBox.pathId) {
    drawCurvedEditingCaretAndSelection(
      gl,
      program,
      buffer,
      editingTextBox,
      editingTextContent,
      selectionStart,
      selectionEnd,
      selectionChangedAt,
      canvasWidth,
      canvasHeight,
      viewport,
      editingPathNode,
    );
  } else {
    drawStraightEditingCaretAndSelection(
      gl,
      program,
      buffer,
      editingTextBox,
      editingTextContent,
      selectionStart,
      selectionEnd,
      selectionChangedAt,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};

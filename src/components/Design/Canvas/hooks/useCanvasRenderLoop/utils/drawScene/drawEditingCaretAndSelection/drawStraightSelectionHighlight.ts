// others
import { DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { flipRect } from './flipRect';
import { getSelectionRects } from 'utils/canvas/text/getSelectionRects';

export const drawStraightSelectionHighlight = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingTextBox: TEditingTextBox,
  editingTextContent: string,
  selectionStart: number,
  selectionEnd: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const center: TPoint = { x: editingTextBox.x + editingTextBox.width / 2, y: editingTextBox.y + editingTextBox.height / 2 };
  const rects = getSelectionRects(
    MSDF_ATLAS_JSON,
    editingTextContent,
    editingTextBox.width,
    TEXT_FONT_SIZE,
    editingTextBox.x,
    editingTextBox.y,
    selectionStart,
    selectionEnd,
  );

  rects.forEach((rect) => {
    drawRect(
      gl,
      program,
      buffer,
      { ...flipRect(rect, editingTextBox), fill: DRAFT_FRAME_STROKE, fillAlpha: TEXT_SELECTION_FILL_ALPHA },
      canvasWidth,
      canvasHeight,
      viewport,
      editingTextBox.rotation,
      center,
    );
  });
};

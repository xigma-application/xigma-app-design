// others
import { CARET_WIDTH_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_SIZE } from '../../../../../constants';

// types
import { TDraftRect, TEditingTextBox, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { flipRect } from './flipRect';
import { getCaretPoint } from 'utils/canvas/text/getCaretPoint';

export const drawStraightCaret = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingTextBox: TEditingTextBox,
  editingTextContent: string,
  caretIndex: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const center: TPoint = { x: editingTextBox.x + editingTextBox.width / 2, y: editingTextBox.y + editingTextBox.height / 2 };
  const lineHeight = (MSDF_ATLAS_JSON.common.lineHeight * TEXT_FONT_SIZE) / MSDF_ATLAS_JSON.info.size;
  const point = getCaretPoint(
    MSDF_ATLAS_JSON,
    editingTextContent,
    editingTextBox.width,
    TEXT_FONT_SIZE,
    editingTextBox.x,
    editingTextBox.y,
    caretIndex,
  );
  const caretWidth = CARET_WIDTH_PX / viewport.zoom;
  const caretRect: TDraftRect = { height: lineHeight, width: caretWidth, x: point.x - caretWidth / 2, y: point.y };

  drawRect(
    gl,
    program,
    buffer,
    { ...flipRect(caretRect, editingTextBox), fill: TEXT_FILL },
    canvasWidth,
    canvasHeight,
    viewport,
    editingTextBox.rotation,
    center,
  );
};

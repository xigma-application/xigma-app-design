// others
import { CARET_WIDTH_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_SIZE } from '../../../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { drawRect } from 'utils/canvas/drawRect';
import { getCurvedCaretPoint } from 'utils/canvas/text/getCurvedCaretPoint';
import { transformCurvedPoint } from './transformCurvedPoint';

export const drawCurvedCaret = (
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
  const table = buildEllipseArcLengthTable(editingTextBox.width, editingTextBox.height);
  const localCaret = getCurvedCaretPoint(
    MSDF_ATLAS_JSON,
    editingTextContent,
    TEXT_FONT_SIZE,
    editingTextBox.width,
    editingTextBox.height,
    center,
    editingTextBox.pathStartOffset ?? 0,
    editingTextBox.pathFlip ?? false,
    table,
    caretIndex,
  );
  const caret = transformCurvedPoint(localCaret, editingTextBox);
  const caretWidth = CARET_WIDTH_PX / viewport.zoom;

  drawRect(
    gl,
    program,
    buffer,
    { fill: TEXT_FILL, height: lineHeight, width: caretWidth, x: caret.x - caretWidth / 2, y: caret.y - lineHeight / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    caret.angleDegrees,
    caret,
  );
};

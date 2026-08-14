// others
import { DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { buildEllipseArcLengthTable } from 'utils/canvas/shapes/buildEllipseArcLengthTable';
import { drawRect } from 'utils/canvas/drawRect';
import { getCurvedSelectionRects } from 'utils/canvas/text/getCurvedSelectionRects';
import { transformCurvedPoint } from './transformCurvedPoint';

export const drawCurvedSelectionHighlight = (
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
  const lineHeight = (MSDF_ATLAS_JSON.common.lineHeight * TEXT_FONT_SIZE) / MSDF_ATLAS_JSON.info.size;
  const table = buildEllipseArcLengthTable(editingTextBox.width, editingTextBox.height);
  const localRects = getCurvedSelectionRects(
    MSDF_ATLAS_JSON,
    editingTextContent,
    TEXT_FONT_SIZE,
    editingTextBox.width,
    editingTextBox.height,
    center,
    editingTextBox.pathStartOffset ?? 0,
    editingTextBox.pathFlip ?? false,
    table,
    lineHeight,
    selectionStart,
    selectionEnd,
  );

  localRects
    .map((rect) => transformCurvedPoint(rect, editingTextBox))
    .forEach((rect) => {
      drawRect(
        gl,
        program,
        buffer,
        {
          fill: DRAFT_FRAME_STROKE,
          fillAlpha: TEXT_SELECTION_FILL_ALPHA,
          height: rect.height,
          width: rect.width,
          x: rect.x - rect.width / 2,
          y: rect.y - rect.height / 2,
        },
        canvasWidth,
        canvasHeight,
        viewport,
        rect.angleDegrees,
        rect,
      );
    });
};

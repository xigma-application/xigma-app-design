// others
import { CARET_BLINK_INTERVAL_MS, CARET_WIDTH_PX, DRAFT_FRAME_STROKE, TEXT_SELECTION_FILL_ALPHA } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_SIZE } from '../../../../constants';

// types
import { TDraftRect, TEditingTextBox, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect';
import { flipTextPoint } from 'utils/canvas/text/flipTextPoint';
import { getCaretPoint } from 'utils/canvas/text/getCaretPoint';
import { getSelectionRects } from 'utils/canvas/text/getSelectionRects';

const flipRect = (rect: TDraftRect, box: TEditingTextBox): TDraftRect => {
  const topLeft = flipTextPoint({ x: rect.x, y: rect.y }, box);
  const bottomRight = flipTextPoint({ x: rect.x + rect.width, y: rect.y + rect.height }, box);

  return {
    height: Math.abs(bottomRight.y - topLeft.y),
    width: Math.abs(bottomRight.x - topLeft.x),
    x: Math.min(topLeft.x, bottomRight.x),
    y: Math.min(topLeft.y, bottomRight.y),
  };
};

const isCaretBlinkedOn = (selectionChangedAt: number): boolean =>
  Math.floor((Date.now() - selectionChangedAt) / CARET_BLINK_INTERVAL_MS) % 2 === 0;

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
): void => {
  const center: TPoint = { x: editingTextBox.x + editingTextBox.width / 2, y: editingTextBox.y + editingTextBox.height / 2 };
  const lineHeight = (MSDF_ATLAS_JSON.common.lineHeight * TEXT_FONT_SIZE) / MSDF_ATLAS_JSON.info.size;

  if (selectionStart !== selectionEnd) {
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
  } else if (isCaretBlinkedOn(selectionChangedAt)) {
    const point = getCaretPoint(
      MSDF_ATLAS_JSON,
      editingTextContent,
      editingTextBox.width,
      TEXT_FONT_SIZE,
      editingTextBox.x,
      editingTextBox.y,
      selectionEnd,
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
  }
};

// others
import { CARET_WIDTH_PX } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FILL, TEXT_FONT_SIZE } from '../../../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawFilledQuad } from 'utils/canvas/drawFilledQuad';
import { getCurvedCaretPoint } from 'utils/canvas/text/getCurvedCaretPoint';
import { getCurvedCaretQuadCorners } from './getCurvedCaretQuadCorners';
import { getTextPathSampler } from 'utils/canvas/text/pathSampler/getTextPathSampler';
import { getVisibleCurvedContent } from 'utils/canvas/text/getVisibleCurvedContent';

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
  pathNode?: TSceneNode,
): void => {
  const center: TPoint = { x: editingTextBox.x + editingTextBox.width / 2, y: editingTextBox.y + editingTextBox.height / 2 };
  const lineHeight = (MSDF_ATLAS_JSON.common.lineHeight * TEXT_FONT_SIZE) / MSDF_ATLAS_JSON.info.size;
  const ascent = (MSDF_ATLAS_JSON.common.base * TEXT_FONT_SIZE) / MSDF_ATLAS_JSON.info.size;
  const descent = lineHeight - ascent;
  const sampler = getTextPathSampler(editingTextBox, pathNode);
  const visibleContent = getVisibleCurvedContent(
    MSDF_ATLAS_JSON,
    editingTextContent,
    TEXT_FONT_SIZE,
    editingTextBox.pathStartOffset ?? 0,
    editingTextBox.pathFlip ?? false,
    sampler.totalLength,
    sampler.isClosed,
  );
  const localCaret = getCurvedCaretPoint(
    MSDF_ATLAS_JSON,
    visibleContent,
    TEXT_FONT_SIZE,
    center,
    editingTextBox.pathStartOffset ?? 0,
    editingTextBox.pathFlip ?? false,
    sampler,
    caretIndex,
  );
  const caretWidth = CARET_WIDTH_PX / viewport.zoom;
  const corners = getCurvedCaretQuadCorners(localCaret, caretWidth, ascent, descent, editingTextBox);

  drawFilledQuad(gl, program, buffer, corners, TEXT_FILL, canvasWidth, canvasHeight, viewport);
};

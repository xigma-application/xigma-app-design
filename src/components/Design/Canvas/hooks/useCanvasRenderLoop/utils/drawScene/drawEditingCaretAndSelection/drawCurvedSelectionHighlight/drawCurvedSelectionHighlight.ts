// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCurvedSelectionFill } from './drawCurvedSelectionFill';
import { drawCurvedSelectionOutline } from './drawCurvedSelectionOutline';
import { getCurvedSelectionOutlinePoints } from 'utils/canvas/text/getCurvedSelectionOutlinePoints';
import { getCurvedSelectionRibbonVertices } from 'utils/canvas/text/getCurvedSelectionRibbonVertices';
import { getTextPathSampler } from 'utils/canvas/text/pathSampler/getTextPathSampler';
import { getVisibleCurvedContent } from 'utils/canvas/text/getVisibleCurvedContent';
import { toFlatVertices } from './toFlatVertices';
import { toPoints } from './toPoints';
import { transformPoints } from './transformPoints';

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
  pathNode?: TSceneNode,
): void => {
  const center: TPoint = { x: editingTextBox.x + editingTextBox.width / 2, y: editingTextBox.y + editingTextBox.height / 2 };
  const lineHeight = (MSDF_ATLAS_JSON.common.lineHeight * TEXT_FONT_SIZE) / MSDF_ATLAS_JSON.info.size;
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
  const args = [
    MSDF_ATLAS_JSON,
    visibleContent,
    TEXT_FONT_SIZE,
    center,
    editingTextBox.pathStartOffset ?? 0,
    editingTextBox.pathFlip ?? false,
    sampler,
    lineHeight,
    selectionStart,
    selectionEnd,
  ] as const;
  const localVertices = getCurvedSelectionRibbonVertices(...args);

  if (localVertices.length !== 0) {
    const vertices = toFlatVertices(transformPoints(toPoints(localVertices), editingTextBox, center));
    const outlinePoints = toFlatVertices(transformPoints(getCurvedSelectionOutlinePoints(...args), editingTextBox, center));

    drawCurvedSelectionFill(gl, program, buffer, vertices, canvasWidth, canvasHeight, viewport);
    drawCurvedSelectionOutline(gl, program, buffer, outlinePoints, canvasWidth, canvasHeight, viewport);
  }
};

// others
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';
import { TEXT_FONT_SIZE } from '../../../../../constants';

// types
import { TEditingTextBox, TPoint } from 'types/canvas';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawCurvedSelectionOutline } from './drawCurvedSelectionHighlight/drawCurvedSelectionOutline';
import { getCurvedSelectionOutlinePoints } from 'utils/canvas/text/getCurvedSelectionOutlinePoints';
import { getTextPathSampler } from 'utils/canvas/text/pathSampler/getTextPathSampler';
import { getVisibleCurvedContent } from 'utils/canvas/text/getVisibleCurvedContent';
import { toFlatVertices } from './drawCurvedSelectionHighlight/toFlatVertices';
import { transformPoints } from './drawCurvedSelectionHighlight/transformPoints';

export const drawCurvedEditingOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  editingTextBox: TEditingTextBox,
  editingTextContent: string,
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

  if (visibleContent.length > 0) {
    const outlinePoints = toFlatVertices(
      transformPoints(
        getCurvedSelectionOutlinePoints(
          MSDF_ATLAS_JSON,
          visibleContent,
          TEXT_FONT_SIZE,
          center,
          editingTextBox.pathStartOffset ?? 0,
          editingTextBox.pathFlip ?? false,
          sampler,
          lineHeight,
          0,
          visibleContent.length,
        ),
        editingTextBox,
        center,
      ),
    );

    drawCurvedSelectionOutline(gl, program, buffer, outlinePoints, canvasWidth, canvasHeight, viewport);
  }
};

// others
import { DRAFT_FRAME_STROKE, HOVER_OUTLINE_WIDTH } from 'constant/canvas';
import { MSDF_ATLAS_JSON } from 'constant/webgl/msdfAtlas';

// types
import { TTextNode, TViewport } from 'types/design/types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { getTextLineWidths } from 'utils/canvas/text/getTextLineWidths';

export const drawTextHoverUnderline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TTextNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const lineWidths = getTextLineWidths(MSDF_ATLAS_JSON, node.content, node.width, node.fontSize);
  const scale = node.fontSize / MSDF_ATLAS_JSON.info.size;
  const lineHeight = MSDF_ATLAS_JSON.common.lineHeight * scale;

  lineWidths.forEach((width, index) => {
    const y = node.y + (index + 1) * lineHeight;

    drawLine(
      gl,
      program,
      buffer,
      { x1: node.x, x2: node.x + width, y1: y, y2: y },
      DRAFT_FRAME_STROKE,
      HOVER_OUTLINE_WIDTH / viewport.zoom,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });
};

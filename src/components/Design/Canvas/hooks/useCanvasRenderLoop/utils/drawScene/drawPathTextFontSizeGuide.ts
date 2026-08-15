// others
import { DRAFT_FRAME_STROKE, FONT_SIZE_GUIDE_DASH_GAP_PX, FONT_SIZE_GUIDE_DASH_LENGTH_PX } from 'constant/canvas';

// types
import { NodeType } from 'types/design/enums';
import { TSceneNode, TViewport } from 'types/design/types';

// utils
import { drawDashedRectOutline } from 'utils/canvas/drawDashedRectOutline';

export const drawPathTextFontSizeGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TSceneNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (node.type === NodeType.text && node.pathId) {
    const padding = node.fontSize;
    const guideRect = { height: node.height + padding * 2, width: node.width + padding * 2, x: node.x - padding, y: node.y - padding };

    drawDashedRectOutline(
      gl,
      program,
      buffer,
      guideRect,
      DRAFT_FRAME_STROKE,
      canvasWidth,
      canvasHeight,
      viewport,
      node.rotation,
      FONT_SIZE_GUIDE_DASH_LENGTH_PX,
      FONT_SIZE_GUIDE_DASH_GAP_PX,
    );
  }
};

// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';
import { ELLIPSE_ARC_GUIDE_LINE_WIDTH } from '../../../../../constants';

// types
import { TDraftRect } from 'types/canvas';
import { TEllipseNode, TViewport } from 'types/design/types';

// utils
import { drawEllipseArcGuideLine } from 'utils/canvas/drawEllipseArcGuideLine';

export const drawFullyCutAwayGuideLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
  arcEndAngle: number,
  isFullyCutAway: boolean,
  node: TEllipseNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (isFullyCutAway) {
    drawEllipseArcGuideLine(
      gl,
      program,
      buffer,
      bounds,
      arcEndAngle,
      DRAFT_FRAME_STROKE,
      ELLIPSE_ARC_GUIDE_LINE_WIDTH,
      canvasWidth,
      canvasHeight,
      viewport,
      node.rotation,
      node.flipX,
      node.flipY,
    );
  }
};

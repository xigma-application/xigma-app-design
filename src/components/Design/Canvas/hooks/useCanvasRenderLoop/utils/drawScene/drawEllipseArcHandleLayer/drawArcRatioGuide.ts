// others
import { DRAFT_FRAME_STROKE } from 'constant/canvas';
import { ELLIPSE_ARC_GUIDE_LINE_WIDTH } from '../../../../../constants';

// types
import { TDraftRect } from 'types/canvas';
import { TEllipseNode, TViewport } from 'types/design/types';

// utils
import { drawEllipseArcRatioGuideArc } from 'utils/canvas/drawEllipseArcRatioGuideArc';
import { getEffectiveArcAngles } from 'utils/canvas/ellipseArc/getEffectiveArcAngles';
import { TEllipseMajorArc } from 'utils/canvas/ellipseArc/getEllipseArcMajorArc';

export const drawArcRatioGuide = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  bounds: TDraftRect,
  arcStartAngle: number,
  arcEndAngle: number,
  arcRatio: number,
  majorArc: TEllipseMajorArc,
  node: TEllipseNode,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (arcRatio >= 1 && Math.abs(majorArc.majorSweep) < 360) {
    const { effectiveEndAngle, effectiveStartAngle } = getEffectiveArcAngles(
      arcStartAngle,
      arcEndAngle,
      node.arcRatioInverted ?? false,
      majorArc,
    );

    drawEllipseArcRatioGuideArc(
      gl,
      program,
      buffer,
      bounds,
      effectiveStartAngle,
      effectiveEndAngle,
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

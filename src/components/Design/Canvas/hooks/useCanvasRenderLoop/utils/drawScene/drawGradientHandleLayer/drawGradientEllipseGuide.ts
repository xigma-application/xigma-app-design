// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';
import { TDrawContext } from '../types';

// utils
import { drawLine } from 'utils/canvas/drawLine';
import { getGradientEllipsePoint } from './getGradientEllipsePoint';

const GRADIENT_ELLIPSE_GUIDE_COLOR = '#ffffff';
const GRADIENT_ELLIPSE_GUIDE_WIDTH = 1;
const GRADIENT_ELLIPSE_GUIDE_SHADOW_COLOR = '#000000';
const GRADIENT_ELLIPSE_GUIDE_SHADOW_ALPHA = 0.35;
const GRADIENT_ELLIPSE_GUIDE_SHADOW_EXTRA_WIDTH = 2;

const isEllipseShapedGradientPaint = (paint: TGradientPaint): boolean =>
  paint.type === 'gradient-radial' || paint.type === 'gradient-angular';

export const drawGradientEllipseGuide = (ctx: TDrawContext, bounds: TDraftRect, rotation: number, paint: TGradientPaint): void => {
  if (isEllipseShapedGradientPaint(paint)) {
    const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = ctx;
    const points = Array.from({ length: ELLIPSE_SEGMENTS }, (_, index) =>
      getGradientEllipsePoint(bounds, rotation, paint, index / ELLIPSE_SEGMENTS),
    );

    points.forEach((point, index) => {
      const next = points[(index + 1) % points.length];
      const line = { x1: point.x, x2: next.x, y1: point.y, y2: next.y };

      drawLine(
        gl,
        program,
        buffer,
        line,
        GRADIENT_ELLIPSE_GUIDE_SHADOW_COLOR,
        (GRADIENT_ELLIPSE_GUIDE_WIDTH + GRADIENT_ELLIPSE_GUIDE_SHADOW_EXTRA_WIDTH) / viewport.zoom,
        canvasWidth,
        canvasHeight,
        viewport,
        GRADIENT_ELLIPSE_GUIDE_SHADOW_ALPHA,
      );
      drawLine(
        gl,
        program,
        buffer,
        line,
        GRADIENT_ELLIPSE_GUIDE_COLOR,
        GRADIENT_ELLIPSE_GUIDE_WIDTH / viewport.zoom,
        canvasWidth,
        canvasHeight,
        viewport,
      );
    });
  }
};

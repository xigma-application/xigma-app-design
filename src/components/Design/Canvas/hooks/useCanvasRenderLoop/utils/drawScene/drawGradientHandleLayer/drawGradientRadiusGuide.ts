// others
import {
  ALIGNMENT_GUIDE_HALO_ALPHA,
  ALIGNMENT_GUIDE_HALO_STROKE,
  ALIGNMENT_GUIDE_HALO_WIDTH_PX,
  ALIGNMENT_GUIDE_STROKE,
  ALIGNMENT_GUIDE_STROKE_WIDTH_PX,
} from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TDrawContext } from '../types';

// utils
import { drawLine } from 'utils/canvas/drawLine';

const CROSSHAIR_SIZE_PX = 6;

const drawGuideCrosshair = (ctx: TDrawContext, point: TPoint): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = ctx;
  const size = CROSSHAIR_SIZE_PX / viewport.zoom;
  const strokeWidth = ALIGNMENT_GUIDE_STROKE_WIDTH_PX / viewport.zoom;
  const horizontal = { x1: point.x - size, x2: point.x + size, y1: point.y, y2: point.y };
  const vertical = { x1: point.x, x2: point.x, y1: point.y - size, y2: point.y + size };

  drawLine(gl, program, buffer, horizontal, ALIGNMENT_GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport);
  drawLine(gl, program, buffer, vertical, ALIGNMENT_GUIDE_STROKE, strokeWidth, canvasWidth, canvasHeight, viewport);
};

export const drawGradientRadiusGuide = (ctx: TDrawContext, center: TPoint, radiusHandle: TPoint): void => {
  const { buffer, canvasHeight, canvasWidth, gl, program, viewport } = ctx;
  const line = { x1: center.x, x2: radiusHandle.x, y1: center.y, y2: radiusHandle.y };

  drawLine(
    gl,
    program,
    buffer,
    line,
    ALIGNMENT_GUIDE_HALO_STROKE,
    ALIGNMENT_GUIDE_HALO_WIDTH_PX / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
    ALIGNMENT_GUIDE_HALO_ALPHA,
  );
  drawLine(
    gl,
    program,
    buffer,
    line,
    ALIGNMENT_GUIDE_STROKE,
    ALIGNMENT_GUIDE_STROKE_WIDTH_PX / viewport.zoom,
    canvasWidth,
    canvasHeight,
    viewport,
  );
  drawGuideCrosshair(ctx, center);
  drawGuideCrosshair(ctx, radiusHandle);
};

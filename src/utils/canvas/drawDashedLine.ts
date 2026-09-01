// types
import { TLineSegment } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawLine } from './drawLine';

export const drawDashedLine = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  line: TLineSegment,
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  dashLength: number,
  dashGap: number,
): void => {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const length = Math.hypot(dx, dy);

  if (length !== 0) {
    const patternLength = (dashLength + dashGap) / viewport.zoom;
    const dashCount = Math.max(1, Math.round(length / patternLength));
    const segmentLength = length / dashCount;
    const dashRatio = dashLength / (dashLength + dashGap);

    Array.from({ length: dashCount }, (_, index) => index).forEach((index) => {
      const start = index * segmentLength;
      const end = start + segmentLength * dashRatio;
      const dash: TLineSegment = {
        x1: line.x1 + (dx * start) / length,
        x2: line.x1 + (dx * end) / length,
        y1: line.y1 + (dy * start) / length,
        y2: line.y1 + (dy * end) / length,
      };

      drawLine(gl, program, buffer, dash, color, strokeWidth, canvasWidth, canvasHeight, viewport);
    });
  }
};

// others
import { VECTOR_CUT_CROSSING_FILL, VECTOR_VERTEX_FILL } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { HANDLE_DIAMOND_ROTATION } from '../drawVectorEditHandlesLayer/drawVectorTangentHandles/drawHandleDiamond';
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export const drawDefaultWidthHandleDiamond = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  handle: TPoint,
  size: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    {
      fill: VECTOR_VERTEX_FILL,
      height: size,
      stroke: VECTOR_CUT_CROSSING_FILL,
      width: size,
      x: handle.x - size / 2,
      y: handle.y - size / 2,
    },
    canvasWidth,
    canvasHeight,
    viewport,
    HANDLE_DIAMOND_ROTATION,
  );
};

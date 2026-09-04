// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';
import { TVectorNodeDragSnapshot } from 'types/design/canvas/types';

// utils
import { drawVectorFillPaints } from './drawVectorFillPaints';
import { drawVectorThickStrokeVertices } from './drawVectorThickStrokeVertices';

export const drawVectorNodeDragSnapshot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer>,
  strokeBufferCache: WeakMap<number[], WebGLBuffer>,
  snapshot: TVectorNodeDragSnapshot,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
): void => {
  const translateLocation = gl.getUniformLocation(program, 'u_translate');

  gl.useProgram(program);
  gl.uniform2f(translateLocation, snapshot.deltaX, snapshot.deltaY);

  snapshot.facesByPaint.forEach(({ paint, points }) => {
    drawVectorFillPaints(
      gl,
      program,
      buffer,
      faceBufferCache,
      null,
      points,
      paint,
      canvasWidth,
      canvasHeight,
      viewport,
      isAlphaWriteEnabled,
    );
  });

  drawVectorThickStrokeVertices(
    gl,
    program,
    buffer,
    strokeBufferCache,
    snapshot.strokeVertices,
    snapshot.strokeColor,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};

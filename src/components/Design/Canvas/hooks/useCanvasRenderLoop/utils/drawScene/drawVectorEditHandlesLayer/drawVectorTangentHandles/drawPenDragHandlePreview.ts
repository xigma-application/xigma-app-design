// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawTangentHandle } from './drawTangentHandle';

export const drawPenDragHandlePreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  penActiveVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  dotSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const activeVertex = penActiveVertexId ? node.vertices[penActiveVertexId] : null;

  if (activeVertex && penDraggedHandlePosition) {
    drawTangentHandle(
      gl,
      program,
      buffer,
      activeVertex,
      penDraggedHandlePosition,
      dotSize,
      false,
      false,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};

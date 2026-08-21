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
  dragOriginVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  isPenDraggedHandleSnapped: boolean,
  dotSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const dragOriginVertex = dragOriginVertexId ? node.vertices[dragOriginVertexId] : null;

  if (dragOriginVertex && penDraggedHandlePosition) {
    drawTangentHandle(
      gl,
      program,
      buffer,
      dragOriginVertex,
      penDraggedHandlePosition,
      dotSize,
      false,
      false,
      isPenDraggedHandleSnapped,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  }
};

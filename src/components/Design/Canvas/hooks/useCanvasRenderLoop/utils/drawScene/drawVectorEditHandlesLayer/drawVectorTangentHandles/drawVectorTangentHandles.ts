// others
import { VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorHandleHover } from 'types/design/canvas/types';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawPenDragHandlePreview } from './drawPenDragHandlePreview';
import { drawSegmentTangentHandles } from './drawSegmentTangentHandles';

export const drawVectorTangentHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  hoveredHandle: TVectorHandleHover | null,
  selectedHandles: TVectorHandleHover[],
  selectedVertexIds: string[],
  oneHopVertexIds: string[],
  dragOriginVertexId: string | null,
  penDraggedHandlePosition: TPoint | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const dotSize = VECTOR_VERTEX_SIZE / viewport.zoom;

  Object.values(node.segments).forEach((segment) => {
    drawSegmentTangentHandles(
      gl,
      program,
      buffer,
      node,
      segment,
      hoveredHandle,
      selectedHandles,
      selectedVertexIds,
      oneHopVertexIds,
      dotSize,
      canvasWidth,
      canvasHeight,
      viewport,
    );
  });

  drawPenDragHandlePreview(
    gl,
    program,
    buffer,
    node,
    dragOriginVertexId,
    penDraggedHandlePosition,
    dotSize,
    canvasWidth,
    canvasHeight,
    viewport,
  );
};

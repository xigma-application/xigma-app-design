// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { processVectorVertexDot } from './processVectorVertexDot';

export type TVertexDotBuckets = { plainVertexCenters: TPoint[]; selectedVertexCenters: TPoint[] };

export const collectVertexDotBuckets = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: ReadonlySet<string>,
  newVertexIds: ReadonlySet<string>,
  hoveredVertexId: string | null,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): TVertexDotBuckets => {
  const plainVertexCenters: TPoint[] = [];
  const selectedVertexCenters: TPoint[] = [];

  Object.values(node.vertices).forEach((vertex) =>
    processVectorVertexDot(
      gl,
      program,
      buffer,
      vertex,
      selectedVertexIds,
      newVertexIds,
      hoveredVertexId,
      baseSize,
      canvasWidth,
      canvasHeight,
      viewport,
      plainVertexCenters,
      selectedVertexCenters,
    ),
  );

  return { plainVertexCenters, selectedVertexCenters };
};

// others
import { VECTOR_VERTEX_FILL, VECTOR_VERTEX_SIZE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawHoveredVertexDot } from './drawHoveredVertexDot';
import { drawNewVertexDot } from './drawNewVertexDot';
import { drawSelectedVertexDot } from './drawSelectedVertexDot';
import { drawVectorVertexDotBatch } from './drawVectorVertexDotBatch';

export const drawVectorVertexDots = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: string[],
  hoveredVertexId: string | null,
  newVertexIds: Set<string>,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const baseSize = VECTOR_VERTEX_SIZE / viewport.zoom;
  const selected = new Set(selectedVertexIds);
  const plainVertexCenters: TPoint[] = [];

  Object.values(node.vertices).forEach((vertex) => {
    const isNew = newVertexIds.has(vertex.id);
    const isHovered = vertex.id === hoveredVertexId;

    if (selected.has(vertex.id)) {
      drawSelectedVertexDot(gl, program, buffer, vertex, isNew, baseSize, canvasWidth, canvasHeight, viewport);
    } else if (isNew) {
      drawNewVertexDot(gl, program, buffer, vertex, isHovered, baseSize, canvasWidth, canvasHeight, viewport);
    } else if (isHovered) {
      drawHoveredVertexDot(gl, program, buffer, vertex, baseSize, canvasWidth, canvasHeight, viewport);
    } else {
      plainVertexCenters.push(vertex);
    }
  });

  drawVectorVertexDotBatch(gl, program, buffer, plainVertexCenters, baseSize, VECTOR_VERTEX_FILL, canvasWidth, canvasHeight, viewport);
};

// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawHoveredVertexDot } from './drawHoveredVertexDot';
import { drawNewVertexDot } from './drawNewVertexDot';
import { drawSelectedVertexDot } from './drawSelectedVertexDot/drawSelectedVertexDot';

export const drawImmediateVertexDots = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedVertexIds: ReadonlySet<string>,
  newVertexIds: ReadonlySet<string>,
  hoveredVertexId: string | null,
  isMeasuring: boolean,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const candidateIds = new Set(newVertexIds);

  if (hoveredVertexId) {
    candidateIds.add(hoveredVertexId);
  }

  candidateIds.forEach((id) => {
    const vertex = node.vertices[id];

    if (!vertex) {
      return;
    }

    const isNew = newVertexIds.has(id);
    const isSelected = selectedVertexIds.has(id);
    const isHovered = id === hoveredVertexId;

    if (isSelected && isNew) {
      drawSelectedVertexDot(gl, program, buffer, vertex, isNew, isMeasuring, baseSize, canvasWidth, canvasHeight, viewport);
    } else if (isNew) {
      drawNewVertexDot(gl, program, buffer, vertex, isHovered, baseSize, canvasWidth, canvasHeight, viewport);
    } else if (isHovered && !isSelected) {
      drawHoveredVertexDot(gl, program, buffer, vertex, baseSize, canvasWidth, canvasHeight, viewport);
    }
  });
};

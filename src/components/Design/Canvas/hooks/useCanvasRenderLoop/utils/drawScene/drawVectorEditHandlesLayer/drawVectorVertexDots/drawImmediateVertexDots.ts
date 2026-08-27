// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawHoveredVertexDot } from './drawHoveredVertexDot';
import { drawNewVertexDot } from './drawNewVertexDot';
import { drawSelectedVertexDot } from './drawSelectedVertexDot';

// Only a vertex that is new (cut-marked) or hovered can ever need an immediate (non-batched) draw —
// a merely-selected vertex always lands in classifyVertexDots' selected batch instead, hover or not
// (selection outranks hover, matching the original combined switch's case order). So this only ever
// has to visit the small newVertexIds/hoveredVertexId set, never every vertex on the node.
export const drawImmediateVertexDots = (
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
      drawSelectedVertexDot(gl, program, buffer, vertex, isNew, baseSize, canvasWidth, canvasHeight, viewport);
    } else if (isNew) {
      drawNewVertexDot(gl, program, buffer, vertex, isHovered, baseSize, canvasWidth, canvasHeight, viewport);
    } else if (isHovered && !isSelected) {
      drawHoveredVertexDot(gl, program, buffer, vertex, baseSize, canvasWidth, canvasHeight, viewport);
    }
  });
};

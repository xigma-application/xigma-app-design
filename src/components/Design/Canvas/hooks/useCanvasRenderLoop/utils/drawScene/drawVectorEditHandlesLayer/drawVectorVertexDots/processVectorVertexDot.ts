// types
import { TPoint } from 'types/canvas';
import { TVectorVertex, TViewport } from 'types/design/types';

// utils
import { drawOrCollectVertexDot } from './drawOrCollectVertexDot';

export const processVectorVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TVectorVertex,
  selectedVertexIds: ReadonlySet<string>,
  newVertexIds: ReadonlySet<string>,
  hoveredVertexId: string | null,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  plainVertexCenters: TPoint[],
  selectedVertexCenters: TPoint[],
): void => {
  const isNew = newVertexIds.has(vertex.id);
  const isSelected = selectedVertexIds.has(vertex.id);
  const isHovered = vertex.id === hoveredVertexId;
  const bucket = drawOrCollectVertexDot(
    gl,
    program,
    buffer,
    vertex,
    isSelected,
    isNew,
    isHovered,
    baseSize,
    canvasWidth,
    canvasHeight,
    viewport,
  );

  switch (bucket) {
    case 'selected':
      selectedVertexCenters.push(vertex);
      break;
    case 'plain':
      plainVertexCenters.push(vertex);
      break;
    default:
      break;
  }
};

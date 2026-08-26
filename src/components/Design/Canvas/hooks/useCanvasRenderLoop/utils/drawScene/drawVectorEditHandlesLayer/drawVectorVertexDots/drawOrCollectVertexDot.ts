// types
import { TVectorVertex, TViewport } from 'types/design/types';

// utils
import { drawHoveredVertexDot } from './drawHoveredVertexDot';
import { drawNewVertexDot } from './drawNewVertexDot';
import { drawSelectedVertexDot } from './drawSelectedVertexDot';

export type TVertexDotBucket = 'plain' | 'selected' | null;

export const drawOrCollectVertexDot = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  vertex: TVectorVertex,
  isSelected: boolean,
  isNew: boolean,
  isHovered: boolean,
  baseSize: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): TVertexDotBucket => {
  switch (true) {
    case isSelected && isNew:
      drawSelectedVertexDot(gl, program, buffer, vertex, isNew, baseSize, canvasWidth, canvasHeight, viewport);
      return null;
    case isSelected:
      return 'selected';
    case isNew:
      drawNewVertexDot(gl, program, buffer, vertex, isHovered, baseSize, canvasWidth, canvasHeight, viewport);
      return null;
    case isHovered:
      drawHoveredVertexDot(gl, program, buffer, vertex, baseSize, canvasWidth, canvasHeight, viewport);
      return null;
    default:
      return 'plain';
  }
};

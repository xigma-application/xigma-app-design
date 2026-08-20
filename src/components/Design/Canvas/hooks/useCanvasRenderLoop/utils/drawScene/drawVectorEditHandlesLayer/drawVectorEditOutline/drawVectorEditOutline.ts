// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawEditModeOutline } from './drawEditModeOutline';
import { drawHoveredSegmentHighlight } from './drawHoveredSegmentHighlight';

export const drawVectorEditOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  hoveredSegmentId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawEditModeOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
  drawHoveredSegmentHighlight(gl, program, buffer, node, hoveredSegmentId, canvasWidth, canvasHeight, viewport);
};

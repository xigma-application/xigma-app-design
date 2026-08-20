// types
import { TVectorNode, TViewport } from 'types/design/types';

// utils
import { drawEditModeOutline } from './drawEditModeOutline';
import { drawHoveredSegmentHighlight } from './drawHoveredSegmentHighlight';
import { drawHoveredVectorSegmentHighlight } from './drawHoveredVectorSegmentHighlight';
import { drawSelectedSegmentsHighlight } from './drawSelectedSegmentsHighlight';

export const drawVectorEditOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  node: TVectorNode,
  selectedSegmentIds: string[],
  hoveredSegmentId: string | null,
  hoveredVectorSegmentId: string | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawEditModeOutline(gl, program, buffer, node, canvasWidth, canvasHeight, viewport);
  drawSelectedSegmentsHighlight(gl, program, buffer, node, selectedSegmentIds, canvasWidth, canvasHeight, viewport);
  drawHoveredVectorSegmentHighlight(gl, program, buffer, node, hoveredVectorSegmentId, canvasWidth, canvasHeight, viewport);
  drawHoveredSegmentHighlight(gl, program, buffer, node, hoveredSegmentId, canvasWidth, canvasHeight, viewport);
};

// others
import { IMAGE_EDITOR_EDGE_HANDLE_LENGTH, IMAGE_EDITOR_HANDLE_THICKNESS } from 'constant/canvas';

// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getRectEdgeMidpoints } from 'utils/canvas/getRectEdgeMidpoints';

const EDGE_OUTWARD_DIRECTIONS: readonly TPoint[] = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 },
];

export const drawImageEditorEdgeHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  rotation: number,
): void => {
  const length = IMAGE_EDITOR_EDGE_HANDLE_LENGTH / viewport.zoom;
  const thickness = IMAGE_EDITOR_HANDLE_THICKNESS / viewport.zoom;
  const center: TPoint = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

  getRectEdgeMidpoints(rect).forEach((midpoint, index) => {
    const isHorizontalEdge = index === 0 || index === 2;
    const outward = EDGE_OUTWARD_DIRECTIONS[index];
    const width = isHorizontalEdge ? length : thickness;
    const height = isHorizontalEdge ? thickness : length;

    drawRect(
      gl,
      program,
      buffer,
      {
        fill,
        height,
        width,
        x: midpoint.x - width / 2 + (outward.x * thickness) / 2,
        y: midpoint.y - height / 2 + (outward.y * thickness) / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      rotation,
      center,
    );
  });
};

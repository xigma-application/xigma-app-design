// others
import { SMART_SELECTION_SWAP_HANDLE_FILL } from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TGridGeometry, TSmartSelectionGap, TSmartSelectionLayout, TSmartSelectionNode } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';
import { getGridCellRect } from '../../../../../utils/getSmartSelectionLayout/getGridCellRect';

const FILL_ALPHA = 0.3;

const getLayoutExtent = (layout: TSmartSelectionLayout): TDraftRect => {
  const nodes = layout.type === 'grid' ? layout.cells.flat().filter((cell): cell is TSmartSelectionNode => cell !== null) : layout.nodes;
  const allBounds = nodes.map((node) => node.bounds);
  const left = Math.min(...allBounds.map((bounds) => bounds.x));
  const top = Math.min(...allBounds.map((bounds) => bounds.y));
  const right = Math.max(...allBounds.map((bounds) => bounds.x + bounds.width));
  const bottom = Math.max(...allBounds.map((bounds) => bounds.y + bounds.height));

  return { height: bottom - top, width: right - left, x: left, y: top };
};

const drawFillRect = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  rect: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  drawRect(
    gl,
    program,
    buffer,
    { ...rect, fill: SMART_SELECTION_SWAP_HANDLE_FILL, fillAlpha: FILL_ALPHA },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};

const drawGapFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  gap: TSmartSelectionGap,
  axis: 'x' | 'y',
  extent: TDraftRect,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const half = gap.value / 2;
  const rect: TDraftRect =
    axis === 'x'
      ? { height: extent.height, width: gap.value, x: gap.midpoint.x - half, y: extent.y }
      : { height: gap.value, width: extent.width, x: extent.x, y: gap.midpoint.y - half };

  drawFillRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
};

const drawGridColumnGapFills = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  geometry: TGridGeometry,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  geometry.rowY.forEach((_, rowIndex) => {
    for (let column = 0; column < geometry.columnX.length - 1; column += 1) {
      const before = getGridCellRect(geometry, rowIndex, column);
      const after = getGridCellRect(geometry, rowIndex, column + 1);
      const rect: TDraftRect = {
        height: before.height,
        width: after.x - (before.x + before.width),
        x: before.x + before.width,
        y: before.y,
      };

      drawFillRect(gl, program, buffer, rect, canvasWidth, canvasHeight, viewport);
    }
  });
};

export const drawSmartSelectionGapFillPreview = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  layout: TSmartSelectionLayout,
  axis: 'x' | 'y',
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (layout.type === 'grid' && axis === 'x') {
    drawGridColumnGapFills(gl, program, buffer, layout.geometry, canvasWidth, canvasHeight, viewport);

    return;
  }

  const extent = getLayoutExtent(layout);
  const gaps = layout.type === 'grid' ? layout.rowGaps : layout.gaps;

  gaps.forEach((gap) => drawGapFill(gl, program, buffer, gap, axis, extent, canvasWidth, canvasHeight, viewport));
};

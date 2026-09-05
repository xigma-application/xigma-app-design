// types
import { TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawGapFill } from './drawGapFill';
import { drawGridColumnGapFills } from './drawGridColumnGapFills';
import { getLayoutExtent } from './getLayoutExtent';

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
    drawGridColumnGapFills(gl, program, buffer, layout.cells, layout.geometry, canvasWidth, canvasHeight, viewport);
  } else {
    const extent = getLayoutExtent(layout);
    const gaps = layout.type === 'grid' ? layout.rowGaps : layout.gaps;

    gaps.forEach((gap) => drawGapFill(gl, program, buffer, gap, axis, extent, canvasWidth, canvasHeight, viewport));
  }
};

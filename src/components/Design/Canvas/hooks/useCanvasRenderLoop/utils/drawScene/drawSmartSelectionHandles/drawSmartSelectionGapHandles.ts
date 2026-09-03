// types
import { TSmartSelectionGap, TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawGapHandleBar } from './drawGapHandleBar';
import { getGridRowGapHandleBounds } from '../../../../../utils/getGridRowGapHandleBounds';

const drawRowGapHandle = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  gap: TSmartSelectionGap,
  firstColumnWidth: number,
  lastColumnWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const { end, midX, start } = getGridRowGapHandleBounds(gap, firstColumnWidth, lastColumnWidth);
  const rowGapHandle: TSmartSelectionGap = { ...gap, midpoint: { x: midX, y: gap.midpoint.y } };

  drawGapHandleBar(gl, program, buffer, rowGapHandle, 'horizontal', canvasWidth, canvasHeight, viewport, end - start);
};

export const drawSmartSelectionGapHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  layout: TSmartSelectionLayout,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (layout.type === 'row') {
    layout.gaps.forEach((gap) => drawGapHandleBar(gl, program, buffer, gap, 'vertical', canvasWidth, canvasHeight, viewport));
  } else if (layout.type === 'column') {
    layout.gaps.forEach((gap) => drawGapHandleBar(gl, program, buffer, gap, 'horizontal', canvasWidth, canvasHeight, viewport));
  } else {
    const firstColumnWidth = layout.cells[0][0].bounds.width;
    const lastColumnWidth = layout.cells[0][layout.columnCount - 1].bounds.width;

    layout.columnGaps.forEach((gap) => drawGapHandleBar(gl, program, buffer, gap, 'vertical', canvasWidth, canvasHeight, viewport));
    layout.rowGaps.forEach((gap) =>
      drawRowGapHandle(gl, program, buffer, gap, firstColumnWidth, lastColumnWidth, canvasWidth, canvasHeight, viewport),
    );
  }
};

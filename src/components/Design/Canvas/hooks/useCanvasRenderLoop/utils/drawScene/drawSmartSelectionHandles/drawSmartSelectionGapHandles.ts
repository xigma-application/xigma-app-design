// others
import { SMART_SELECTION_GAP_HANDLE_FILL } from 'constant/canvas';

// types
import { TSmartSelectionGap, TSmartSelectionLayout } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawGapHandleBar, TGapHandleOrientation } from './drawGapHandleBar';
import { drawLine } from 'utils/canvas/drawLine';

const drawGap = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  gap: TSmartSelectionGap,
  orientation: TGapHandleOrientation,
  drawSeparator: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (drawSeparator) {
    drawLine(gl, program, buffer, gap.span, SMART_SELECTION_GAP_HANDLE_FILL, 1 / viewport.zoom, canvasWidth, canvasHeight, viewport);
  }

  drawGapHandleBar(gl, program, buffer, gap, orientation, canvasWidth, canvasHeight, viewport);
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
    layout.gaps.forEach((gap) => drawGap(gl, program, buffer, gap, 'vertical', false, canvasWidth, canvasHeight, viewport));
  } else if (layout.type === 'column') {
    layout.gaps.forEach((gap) => drawGap(gl, program, buffer, gap, 'horizontal', false, canvasWidth, canvasHeight, viewport));
  } else {
    layout.columnGaps.forEach((gap) => drawGap(gl, program, buffer, gap, 'vertical', true, canvasWidth, canvasHeight, viewport));
    layout.rowGaps.forEach((gap) => drawGap(gl, program, buffer, gap, 'horizontal', true, canvasWidth, canvasHeight, viewport));
  }
};

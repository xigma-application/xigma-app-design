// others
import {
  SMART_SELECTION_GAP_HANDLE_FILL,
  SMART_SELECTION_GAP_HANDLE_LENGTH_PX,
  SMART_SELECTION_GAP_HANDLE_WIDTH_PX,
} from 'constant/canvas';

// types
import { TSmartSelectionGap } from 'types/design/smartSelection/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

export type TGapHandleOrientation = 'horizontal' | 'vertical';

export const drawGapHandleBar = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  gap: TSmartSelectionGap,
  orientation: TGapHandleOrientation,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const width = (orientation === 'vertical' ? SMART_SELECTION_GAP_HANDLE_WIDTH_PX : SMART_SELECTION_GAP_HANDLE_LENGTH_PX) / viewport.zoom;
  const height = (orientation === 'vertical' ? SMART_SELECTION_GAP_HANDLE_LENGTH_PX : SMART_SELECTION_GAP_HANDLE_WIDTH_PX) / viewport.zoom;

  drawRect(
    gl,
    program,
    buffer,
    { fill: SMART_SELECTION_GAP_HANDLE_FILL, height, width, x: gap.midpoint.x - width / 2, y: gap.midpoint.y - height / 2 },
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );
};

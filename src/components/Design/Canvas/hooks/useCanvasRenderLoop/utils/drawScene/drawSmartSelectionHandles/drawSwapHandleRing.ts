// others
import {
  SMART_SELECTION_GAP_HANDLE_STROKE,
  SMART_SELECTION_SWAP_HANDLE_FILL,
  SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX,
  SMART_SELECTION_SWAP_HANDLE_RING_PINK_PX,
  SMART_SELECTION_SWAP_HANDLE_RING_WHITE_PX,
} from 'constant/canvas';

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawEllipse } from 'utils/canvas/shapes/drawEllipse';
import { drawThickEllipseOutline } from 'utils/canvas/shapes/drawThickEllipseOutline';

const centredEllipse = (centerX: number, centerY: number, diameter: number): TDraftRect => ({
  height: diameter,
  width: diameter,
  x: centerX - diameter / 2,
  y: centerY - diameter / 2,
});

export const drawSwapHandleRing = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  centerX: number,
  centerY: number,
  filled: boolean,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const white = SMART_SELECTION_SWAP_HANDLE_RING_WHITE_PX;
  const pink = SMART_SELECTION_SWAP_HANDLE_RING_PINK_PX;
  const outerDiameter = SMART_SELECTION_SWAP_HANDLE_RING_DIAMETER_PX;
  const centreline = centredEllipse(centerX, centerY, (outerDiameter - white) / viewport.zoom);

  drawThickEllipseOutline(
    gl,
    program,
    buffer,
    centreline,
    SMART_SELECTION_GAP_HANDLE_STROKE,
    white,
    canvasWidth,
    canvasHeight,
    viewport,
    0,
  );

  if (filled) {
    // pink runs from the middle pink line of the border inward, leaving only the outer white sliver
    drawEllipse(
      gl,
      program,
      buffer,
      { ...centredEllipse(centerX, centerY, (outerDiameter - (white - pink)) / viewport.zoom), fill: SMART_SELECTION_SWAP_HANDLE_FILL },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );

    return;
  }

  drawThickEllipseOutline(gl, program, buffer, centreline, SMART_SELECTION_SWAP_HANDLE_FILL, pink, canvasWidth, canvasHeight, viewport, 0);
};

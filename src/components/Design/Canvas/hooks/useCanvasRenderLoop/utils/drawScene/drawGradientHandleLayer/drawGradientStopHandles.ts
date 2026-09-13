// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const STOP_HANDLE_SIZE = 10;
const STOP_HANDLE_STROKE = '#ffffff';

export const drawGradientStopHandles = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  stops: TGradientStop[],
  positions: TPoint[],
  selectedStopIndex: number | null,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const handleSize = STOP_HANDLE_SIZE / viewport.zoom;

  stops.forEach((stop, index) => {
    const position = positions[index];

    drawRect(
      gl,
      program,
      buffer,
      {
        fill: stop.color,
        fillAlpha: stop.opacity / 100,
        height: handleSize,
        stroke: index === selectedStopIndex ? DIMENSION_HINT_GUIDE_BLUE : STOP_HANDLE_STROKE,
        width: handleSize,
        x: position.x - handleSize / 2,
        y: position.y - handleSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};

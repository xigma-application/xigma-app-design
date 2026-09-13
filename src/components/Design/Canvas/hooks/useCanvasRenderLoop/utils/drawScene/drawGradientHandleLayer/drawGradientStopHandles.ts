// others
import { DIMENSION_HINT_GUIDE_BLUE } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TGradientStop } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { drawGradientStopPointer } from './drawGradientStopPointer';
import { drawRect } from 'utils/canvas/drawRect/drawRect';

const STOP_HANDLE_BACKDROP_SIZE = 24;
const STOP_HANDLE_BACKDROP_FILL = '#cacaca';
const STOP_HANDLE_BORDER_SIZE = 20;
const STOP_HANDLE_BORDER_STROKE = '#ffffff';
const STOP_HANDLE_SWATCH_SIZE = 19;

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
  const backdropSize = STOP_HANDLE_BACKDROP_SIZE / viewport.zoom;
  const borderSize = STOP_HANDLE_BORDER_SIZE / viewport.zoom;
  const swatchSize = STOP_HANDLE_SWATCH_SIZE / viewport.zoom;

  stops.forEach((stop, index) => {
    const position = positions[index];
    const isSelected = index === selectedStopIndex;

    drawRect(
      gl,
      program,
      buffer,
      {
        fill: isSelected ? DIMENSION_HINT_GUIDE_BLUE : STOP_HANDLE_BACKDROP_FILL,
        height: backdropSize,
        width: backdropSize,
        x: position.x - backdropSize / 2,
        y: position.y - backdropSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
    drawGradientStopPointer(
      gl,
      program,
      buffer,
      { x: position.x, y: position.y + backdropSize / 2 },
      isSelected ? DIMENSION_HINT_GUIDE_BLUE : STOP_HANDLE_BACKDROP_FILL,
      canvasWidth,
      canvasHeight,
      viewport,
    );
    drawRect(
      gl,
      program,
      buffer,
      {
        height: borderSize,
        stroke: isSelected ? DIMENSION_HINT_GUIDE_BLUE : STOP_HANDLE_BORDER_STROKE,
        width: borderSize,
        x: position.x - borderSize / 2,
        y: position.y - borderSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
    drawRect(
      gl,
      program,
      buffer,
      {
        fill: stop.color,
        fillAlpha: stop.opacity / 100,
        height: swatchSize,
        width: swatchSize,
        x: position.x - swatchSize / 2,
        y: position.y - swatchSize / 2,
      },
      canvasWidth,
      canvasHeight,
      viewport,
      0,
    );
  });
};

// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRoundedPolygon } from './drawRoundedPolygon';
import { drawStandardPolygon } from './drawStandardPolygon';

export type TDrawablePolygon = TDraftRect & {
  cornerRadius?: number;
  fill?: string;
  fillAlpha?: number;
  sides: number;
  stroke?: string;
};

export const drawPolygon = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  polygon: TDrawablePolygon,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): void => {
  if (polygon.cornerRadius) {
    drawRoundedPolygon(
      gl,
      program,
      buffer,
      { ...polygon, cornerRadius: polygon.cornerRadius },
      canvasWidth,
      canvasHeight,
      viewport,
      flipX,
      flipY,
      rotation,
    );
  } else {
    drawStandardPolygon(gl, program, buffer, polygon, canvasWidth, canvasHeight, viewport, flipX, flipY, rotation);
  }
};

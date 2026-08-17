// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { drawRoundedStar } from './drawRoundedStar';
import { drawStandardStar } from './drawStandardStar';

export type TDrawableStar = TDraftRect & {
  cornerRadius?: number;
  fill?: string;
  fillAlpha?: number;
  points: number;
  ratio: number;
  stroke?: string;
};

export const drawStar = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  star: TDrawableStar,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  flipX: boolean,
  flipY: boolean,
  rotation: number,
): void => {
  if (star.cornerRadius) {
    drawRoundedStar(
      gl,
      program,
      buffer,
      { ...star, cornerRadius: star.cornerRadius },
      canvasWidth,
      canvasHeight,
      viewport,
      flipX,
      flipY,
      rotation,
    );
  } else {
    drawStandardStar(gl, program, buffer, star, canvasWidth, canvasHeight, viewport, flipX, flipY, rotation);
  }
};

// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../types';

// utils
import { drawScene } from './drawScene/drawScene';
import { resolveColorSampleRequest } from './resolveColorSampleRequest';
import { resolvePatternThumbnailRequest } from './resolvePatternThumbnailRequest';

type TFrameIdRef = { current: number };

const tick = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  frameIdRef: TFrameIdRef,
  refs: TCanvasRefs,
): void => {
  drawScene(gl, program, buffer, imageContext, canvas, refs);
  resolveColorSampleRequest(gl, canvas, refs.colorSampleRequestRef);
  resolvePatternThumbnailRequest(gl, program, buffer, imageContext, refs);
  frameIdRef.current = requestAnimationFrame(() => tick(gl, program, buffer, imageContext, canvas, frameIdRef, refs));
};

export const startRenderLoop = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageContext: TImageRenderContext,
  canvas: HTMLCanvasElement,
  refs: TCanvasRefs,
): (() => void) => {
  const frameIdRef: TFrameIdRef = { current: 0 };
  frameIdRef.current = requestAnimationFrame(() => tick(gl, program, buffer, imageContext, canvas, frameIdRef, refs));

  return (): void => cancelAnimationFrame(frameIdRef.current);
};

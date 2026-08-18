// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../types';

// utils
import { startRenderLoop } from './startRenderLoop';

export const setupRenderLoop = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageProgram: WebGLProgram,
  imageBuffer: WebGLBuffer,
  msdfProgram: WebGLProgram,
  msdfBuffer: WebGLBuffer,
  canvas: HTMLCanvasElement,
  refs: TCanvasRefs,
): (() => void) => {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const imageContext: TImageRenderContext = {
    buffer: imageBuffer,
    cache: new Map(),
    ellipseArcLengthCache: new Map(),
    msdfBuffer,
    msdfProgram,
    program: imageProgram,
    textGeometryCache: new Map(),
  };

  return startRenderLoop(gl, program, buffer, imageContext, canvas, refs);
};

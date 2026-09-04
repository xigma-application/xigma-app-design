// types
import { TCanvasRefs } from 'types/design/canvas/types';
import { TImageRenderContext } from '../types';

// utils
import { createRenderTargetPool } from 'utils/canvas/renderTarget/createRenderTargetPool/createRenderTargetPool';
import { startRenderLoop } from './startRenderLoop';

export const setupRenderLoop = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  imageProgram: WebGLProgram,
  imageBuffer: WebGLBuffer,
  msdfProgram: WebGLProgram,
  msdfBuffer: WebGLBuffer,
  gridProgram: WebGLProgram,
  gridBuffer: WebGLBuffer,
  checkerboardProgram: WebGLProgram,
  maskCompositeProgram: WebGLProgram,
  maskCompositeBuffer: WebGLBuffer,
  dragSnapshotProgram: WebGLProgram,
  canvas: HTMLCanvasElement,
  refs: TCanvasRefs,
): (() => void) => {
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const imageContext: TImageRenderContext = {
    buffer: imageBuffer,
    cache: new Map(),
    checkerboardProgram,
    dragSnapshotFaceBufferCache: new WeakMap(),
    dragSnapshotProgram,
    dragSnapshotStrokeBufferCache: new WeakMap(),
    dragSnapshotTrackedByNodeId: new Map(),
    ellipseArcLengthCache: new Map(),
    faceBufferCache: new WeakMap(),
    gridBuffer,
    gridProgram,
    isAlphaWriteEnabled: false,
    maskCompositeBuffer,
    maskCompositeProgram,
    msdfBuffer,
    msdfProgram,
    program: imageProgram,
    renderTargetPool: createRenderTargetPool(gl),
    strokeBufferCache: new WeakMap(),
    textGeometryCache: new Map(),
    vertexDotBufferCache: new WeakMap(),
  };

  const stopRenderLoop = startRenderLoop(gl, program, buffer, imageContext, canvas, refs);

  return (): void => {
    stopRenderLoop();
    imageContext.renderTargetPool.dispose();
  };
};

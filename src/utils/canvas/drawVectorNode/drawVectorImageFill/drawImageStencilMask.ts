// types
import { TPoint } from 'types/canvas';

// utils
import { getOrCreateFaceBuffer } from '../getOrCreateFaceBuffer';

export const drawImageStencilMask = (
  gl: WebGL2RenderingContext,
  positionLocation: number,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  buffer: WebGLBuffer,
  faces: TPoint[][],
): void => {
  faces.forEach((face: TPoint[]) => {
    getOrCreateFaceBuffer(gl, faceBufferCache, buffer, face);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, face.length);
  });
};

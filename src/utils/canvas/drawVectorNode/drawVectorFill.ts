// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getOrCreateFaceBuffer } from './getOrCreateFaceBuffer';
import { getVectorFillCoveringQuad } from './getVectorFillCoveringQuad';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export const drawVectorFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha = 1,
): void => {
  if (faces.length !== 0) {
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const colorLocation = gl.getUniformLocation(program, 'u_color');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');

    gl.useProgram(program);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.enableVertexAttribArray(positionLocation);

    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.STENCIL_TEST);
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);

    faces.forEach((face: TPoint[]) => {
      getOrCreateFaceBuffer(gl, faceBufferCache, buffer, face);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, face.length);
    });

    gl.colorMask(true, true, true, isAlphaWriteEnabled);
    gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(getVectorFillCoveringQuad(faces, nodeBounds)), gl.STATIC_DRAW);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(color, alpha));
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disable(gl.STENCIL_TEST);
  }
};

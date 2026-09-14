// types
import { TDraftRect, TPoint } from 'types/canvas';
import { TGradientPaint } from 'types/design/paint/types';
import { TViewport } from 'types/design/types';

// utils
import { getGradientStopUniformArrays } from './getGradientStopUniformArrays';
import { getGradientTypeIndex } from './getGradientTypeIndex';
import { getOrCreateFaceBuffer } from './getOrCreateFaceBuffer';
import { getVectorFillBounds } from './getVectorFillBounds';
import { getVectorFillCoveringQuad } from './getVectorFillCoveringQuad';

const getGradientRadiusRatio = (paint: TGradientPaint): number =>
  paint.type === 'gradient-radial' || paint.type === 'gradient-angular' || paint.type === 'gradient-diamond' ? (paint.radiusRatio ?? 1) : 1;

export const drawVectorGradientFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faceBufferCache: WeakMap<TPoint[], WebGLBuffer> | null,
  nodeBounds: TDraftRect | null,
  faces: TPoint[][],
  paint: TGradientPaint,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
  isAlphaWriteEnabled: boolean,
  alpha = 1,
): void => {
  if (faces.length !== 0) {
    const bounds = getVectorFillBounds(faces, nodeBounds);
    const { colors, count, positions } = getGradientStopUniformArrays(paint.stops);
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
    const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const boundsOriginLocation = gl.getUniformLocation(program, 'u_boundsOrigin');
    const boundsSizeLocation = gl.getUniformLocation(program, 'u_boundsSize');
    const stopColorsLocation = gl.getUniformLocation(program, 'u_stopColors');
    const stopPositionsLocation = gl.getUniformLocation(program, 'u_stopPositions');
    const stopCountLocation = gl.getUniformLocation(program, 'u_stopCount');
    const startLocation = gl.getUniformLocation(program, 'u_start');
    const endLocation = gl.getUniformLocation(program, 'u_end');
    const gradientTypeIndexLocation = gl.getUniformLocation(program, 'u_gradientTypeIndex');
    const opacityLocation = gl.getUniformLocation(program, 'u_opacity');
    const radiusRatioLocation = gl.getUniformLocation(program, 'u_radiusRatio');

    gl.useProgram(program);
    gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
    gl.uniform1f(zoomLocation, viewport.zoom);
    gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
    gl.uniform2f(boundsOriginLocation, bounds.x, bounds.y);
    gl.uniform2f(boundsSizeLocation, bounds.width, bounds.height);
    gl.uniform4fv(stopColorsLocation, colors);
    gl.uniform1fv(stopPositionsLocation, positions);
    gl.uniform1i(stopCountLocation, count);
    gl.uniform2f(startLocation, paint.start.x, paint.start.y);
    gl.uniform2f(endLocation, paint.end.x, paint.end.y);
    gl.uniform1i(gradientTypeIndexLocation, getGradientTypeIndex(paint.type));
    gl.uniform1f(opacityLocation, alpha);
    gl.uniform1f(radiusRatioLocation, getGradientRadiusRatio(paint));
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
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    gl.disable(gl.STENCIL_TEST);
  }
};

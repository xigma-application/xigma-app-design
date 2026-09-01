// others
import { VECTOR_PAINT_HATCH_SPACING_PX } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getHatchLineVertices } from './getHatchLineVertices';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export const drawVectorHatchFill = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  faces: TPoint[][],
  color: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
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
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    // the caller (bindTarget) may have alpha writes enabled — an offscreen mask target relies on
    // it to carry the mask's alpha into the composite — so capture it instead of hardcoding false
    // when color writes are re-enabled below, or an offscreen mask render loses its alpha channel
    const [, , , alphaWriteEnabled] = gl.getParameter(gl.COLOR_WRITEMASK) as [boolean, boolean, boolean, boolean];

    gl.clear(gl.STENCIL_BUFFER_BIT);
    gl.enable(gl.STENCIL_TEST);
    gl.colorMask(false, false, false, false);
    gl.stencilFunc(gl.ALWAYS, 1, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.INVERT);

    faces.forEach((face: TPoint[]) => {
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(face.flatMap((point) => [point.x, point.y])), gl.STATIC_DRAW);
      gl.drawArrays(gl.TRIANGLE_FAN, 0, face.length);
    });

    gl.colorMask(true, true, true, alphaWriteEnabled);
    gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);

    const hatchVertices = getHatchLineVertices(faces.flat(), viewport.zoom, VECTOR_PAINT_HATCH_SPACING_PX);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(hatchVertices), gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
    gl.drawArrays(gl.LINES, 0, hatchVertices.length / 2);

    gl.disable(gl.STENCIL_TEST);
  }
};

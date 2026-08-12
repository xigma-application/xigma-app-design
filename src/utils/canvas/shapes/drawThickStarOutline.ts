// types
import { TDraftRect } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getQuadVertices } from '../drawThickOutline';
import { getStarPoints } from './getStarPoints';
import { hexToRgbaFloat } from '../hexToRgbaFloat';

export const drawThickStarOutline = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  star: TDraftRect & { points: number; ratio: number },
  color: string,
  strokeWidth: number,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const colorLocation = gl.getUniformLocation(program, 'u_color');
  const viewportOffsetLocation = gl.getUniformLocation(program, 'u_viewportOffset');
  const zoomLocation = gl.getUniformLocation(program, 'u_zoom');
  const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
  const halfWidth = strokeWidth / viewport.zoom / 2;
  const { points, ratio } = star;
  const vertexCount = points * 2;

  const outerPoints = getStarPoints(
    { height: star.height + halfWidth * 2, width: star.width + halfWidth * 2, x: star.x - halfWidth, y: star.y - halfWidth },
    points,
    ratio,
  );
  const innerPoints = getStarPoints(
    { height: star.height - halfWidth * 2, width: star.width - halfWidth * 2, x: star.x + halfWidth, y: star.y + halfWidth },
    points,
    ratio,
  );

  const vertices = outerPoints.flatMap((outerPoint, index) => {
    const nextIndex = (index + 1) % vertexCount;

    return getQuadVertices(
      outerPoint.x,
      outerPoint.y,
      outerPoints[nextIndex].x,
      outerPoints[nextIndex].y,
      innerPoints[nextIndex].x,
      innerPoints[nextIndex].y,
      innerPoints[index].x,
      innerPoints[index].y,
    );
  });

  gl.useProgram(program);
  gl.uniform2f(viewportOffsetLocation, viewport.x, viewport.y);
  gl.uniform1f(zoomLocation, viewport.zoom);
  gl.uniform2f(resolutionLocation, canvasWidth, canvasHeight);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.uniform4fv(colorLocation, hexToRgbaFloat(color));
  gl.drawArrays(gl.TRIANGLES, 0, vertexCount * 6);
};

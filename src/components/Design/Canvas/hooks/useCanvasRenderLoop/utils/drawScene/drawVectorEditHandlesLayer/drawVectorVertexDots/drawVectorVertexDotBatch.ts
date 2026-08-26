// others
import { ELLIPSE_SEGMENTS } from 'constant/canvas';

// types
import { TPoint } from 'types/canvas';
import { TViewport } from 'types/design/types';

// utils
import { getEllipsePoints } from 'utils/canvas/shapes/getEllipsePoints';
import { hexToRgbaFloat } from 'utils/canvas/hexToRgbaFloat';

const FLOATS_PER_POINT = 2;
const POINTS_PER_TRIANGLE = 3;

const buildDotBatchVertices = (centers: TPoint[], unitRimPoints: TPoint[]): Float32Array => {
  const trianglesPerDot = unitRimPoints.length;
  const floatsPerDot = trianglesPerDot * POINTS_PER_TRIANGLE * FLOATS_PER_POINT;
  const vertices = new Float32Array(centers.length * floatsPerDot);

  centers.forEach((center, dotIndex) => {
    const dotOffset = dotIndex * floatsPerDot;

    unitRimPoints.forEach((point, pointIndex) => {
      const nextPoint = unitRimPoints[(pointIndex + 1) % unitRimPoints.length];
      const triangleOffset = dotOffset + pointIndex * POINTS_PER_TRIANGLE * FLOATS_PER_POINT;

      vertices[triangleOffset] = center.x;
      vertices[triangleOffset + 1] = center.y;
      vertices[triangleOffset + 2] = center.x + point.x;
      vertices[triangleOffset + 3] = center.y + point.y;
      vertices[triangleOffset + 4] = center.x + nextPoint.x;
      vertices[triangleOffset + 5] = center.y + nextPoint.y;
    });
  });

  return vertices;
};

export const drawVectorVertexDotBatch = (
  gl: WebGL2RenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  centers: TPoint[],
  size: number,
  fill: string,
  canvasWidth: number,
  canvasHeight: number,
  viewport: TViewport,
): void => {
  if (centers.length > 0) {
    const unitRimPoints = getEllipsePoints({ height: size, width: size, x: -size / 2, y: -size / 2 }, ELLIPSE_SEGMENTS);
    const vertices = buildDotBatchVertices(centers, unitRimPoints);

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
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.uniform4fv(colorLocation, hexToRgbaFloat(fill));
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / FLOATS_PER_POINT);
  }
};
